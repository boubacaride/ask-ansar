/**
 * translate-titles-french.js
 *
 * Translates all category names and dua titles in duas-com-data.json
 * from English to French using Google Translate free API.
 *
 * Usage: node scripts/translate-titles-french.js
 */

const fs = require("fs");
const path = require("path");

const PROJECT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(PROJECT_DIR, "data", "duas-com-data.json");
const PROGRESS_PATH = path.join(PROJECT_DIR, "data", ".translate-titles-progress.json");

const BATCH_SIZE = 10; // translate 10 texts per API call (batched)
const BATCH_DELAY = 1200; // ms between batches
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateText(text, retries = MAX_RETRIES) {
  if (!text || text.trim().length === 0) return text;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=fr&dt=t&q=${encodedText}`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      clearTimeout(timer);

      if (!res.ok) {
        if (res.status === 429) {
          console.warn(`  Rate limited, waiting ${5 * (attempt + 1)}s...`);
          await sleep(5000 * (attempt + 1));
          continue;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data && data[0]) {
        return data[0]
          .filter((segment) => segment && segment[0])
          .map((segment) => segment[0])
          .join("");
      }
      return text;
    } catch (err) {
      if (attempt === retries) {
        console.warn(
          `  Translation failed for "${text.substring(0, 50)}...": ${err.message}`
        );
        return text;
      }
      await sleep(1000 * (attempt + 1));
    }
  }
  return text;
}

async function main() {
  console.log("=== Translate Category Names & Dua Titles: EN -> FR ===\n");

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

  // Load progress if exists
  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
      console.log(`Resuming from previous progress (${Object.keys(progress).length} already done)\n`);
    } catch (e) {
      progress = {};
    }
  }

  // Collect all texts that need translation
  const items = [];

  for (const lg of data.letters) {
    for (const cat of lg.categories) {
      // Category name
      const catKey = `cat_${cat.id}`;
      items.push({ key: catKey, text: cat.name, type: "category", ref: cat });

      // Dua titles
      for (const dua of cat.duas) {
        const duaKey = `dua_${dua.id}_${cat.id}`;
        items.push({ key: duaKey, text: dua.title, type: "dua", ref: dua });
      }
    }
  }

  console.log(`Total items: ${items.length}`);

  // Filter out already translated
  const remaining = items.filter((item) => !progress[item.key]);
  console.log(`Remaining: ${remaining.length}\n`);

  if (remaining.length === 0) {
    console.log("All already translated!");
    applyTranslations(data, progress);
    return;
  }

  let completed = 0;
  let errors = 0;
  const startTime = Date.now();

  // Process items in batches
  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);

    // Translate batch items concurrently (2 at a time to avoid rate limits)
    const CONCURRENCY = 2;
    for (let j = 0; j < batch.length; j += CONCURRENCY) {
      const subBatch = batch.slice(j, j + CONCURRENCY);

      const results = await Promise.allSettled(
        subBatch.map(async (item) => {
          const translated = await translateText(item.text);
          return { key: item.key, translated };
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled" && r.value.translated) {
          progress[r.value.key] = r.value.translated;
          completed++;
        } else {
          errors++;
        }
      }

      if (j + CONCURRENCY < batch.length) await sleep(400);
    }

    const total = completed + errors;
    if (total % 50 < BATCH_SIZE || i + BATCH_SIZE >= remaining.length) {
      const sec = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `${total}/${remaining.length} (${completed} ok, ${errors} err) | ${sec}s`
      );
    }

    // Save progress every 100
    if (total % 100 < BATCH_SIZE || i + BATCH_SIZE >= remaining.length) {
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress), "utf-8");
    }

    if (i + BATCH_SIZE < remaining.length) await sleep(BATCH_DELAY);
  }

  // Apply translations to data
  applyTranslations(data, progress);

  const sec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Done ===`);
  console.log(`Translated: ${completed} | Errors: ${errors} | Time: ${sec}s`);
}

function applyTranslations(data, progress) {
  let catUpdated = 0;
  let duaUpdated = 0;

  for (const lg of data.letters) {
    for (const cat of lg.categories) {
      const catKey = `cat_${cat.id}`;
      if (progress[catKey]) {
        cat.name = progress[catKey];
        catUpdated++;
      }

      for (const dua of cat.duas) {
        const duaKey = `dua_${dua.id}_${cat.id}`;
        if (progress[duaKey]) {
          dua.title = progress[duaKey];
          duaUpdated++;
        }
      }
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`\nApplied: ${catUpdated} category names, ${duaUpdated} dua titles`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
