/**
 * translate-duas-french.js
 *
 * Translates all dua translations from English to French using
 * Google Translate's free API endpoint.
 *
 * Features:
 *   - Concurrency of 3 with delay between batches
 *   - Resume support (skips already-translated IDs)
 *   - Progress logging
 *   - Graceful error handling
 *
 * Usage: node scripts/translate-duas-french.js
 */

const fs = require("fs");
const path = require("path");

const PROJECT_DIR = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(PROJECT_DIR, "data", "duas-com-content.json");
const OUTPUT_PATH = path.join(PROJECT_DIR, "data", "duas-com-content.json"); // overwrite in place

const CONCURRENCY = 2;
const BATCH_DELAY = 1500; // ms between batches to avoid rate limiting
const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Translate text from English to French using Google Translate free API.
 * For long texts, splits into chunks to avoid URL length limits.
 */
async function translateText(text, retries = MAX_RETRIES) {
  if (!text || text.trim().length === 0) return text;

  // Google Translate has a ~5000 char limit per request
  const MAX_CHUNK = 4500;
  if (text.length > MAX_CHUNK) {
    // Split by paragraphs/sentences
    const parts = splitText(text, MAX_CHUNK);
    const translated = [];
    for (const part of parts) {
      const t = await translateText(part, retries);
      translated.push(t);
      await sleep(500);
    }
    return translated.join("\n\n");
  }

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
          // Rate limited - wait longer
          console.warn(`  Rate limited, waiting ${5 * (attempt + 1)}s...`);
          await sleep(5000 * (attempt + 1));
          continue;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      // Response format: [[["translated text","original text",null,null,N],...],...]
      if (data && data[0]) {
        return data[0]
          .filter((segment) => segment && segment[0])
          .map((segment) => segment[0])
          .join("");
      }
      return text; // fallback
    } catch (err) {
      if (attempt === retries) {
        console.warn(`  Translation failed after ${retries + 1} attempts: ${err.message}`);
        return text; // return original on failure
      }
      await sleep(1000 * (attempt + 1));
    }
  }
  return text;
}

/**
 * Split text into chunks respecting paragraph boundaries
 */
function splitText(text, maxLen) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // If any chunk is still too long, split by sentences
  const result = [];
  for (const chunk of chunks) {
    if (chunk.length > maxLen) {
      const sentences = chunk.split(/(?<=[.!?])\s+/);
      let cur = "";
      for (const s of sentences) {
        if (cur.length + s.length + 1 > maxLen && cur.length > 0) {
          result.push(cur.trim());
          cur = s;
        } else {
          cur = cur ? cur + " " + s : s;
        }
      }
      if (cur.trim()) result.push(cur.trim());
    } else {
      result.push(chunk);
    }
  }

  return result;
}

async function main() {
  console.log("=== Dua Translation: English -> French ===\n");

  if (!fs.existsSync(INPUT_PATH)) {
    console.error("ERROR: Input file not found:", INPUT_PATH);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  const keys = Object.keys(data);
  console.log(`Total duas: ${keys.length}`);

  // Check which ones need translation (those that still have English text)
  // We'll use a marker to track which ones we've already translated
  const MARKER_PATH = path.join(PROJECT_DIR, "data", ".translated-ids.json");
  let translatedIds = new Set();
  if (fs.existsSync(MARKER_PATH)) {
    try {
      const ids = JSON.parse(fs.readFileSync(MARKER_PATH, "utf-8"));
      translatedIds = new Set(ids);
      console.log(`Already translated: ${translatedIds.size}`);
    } catch (e) {
      translatedIds = new Set();
    }
  }

  const toTranslate = keys.filter((k) => !translatedIds.has(k) && data[k].translation);
  console.log(`Remaining to translate: ${toTranslate.length}\n`);

  if (toTranslate.length === 0) {
    console.log("All done already.");
    return;
  }

  let completed = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < toTranslate.length; i += CONCURRENCY) {
    const batch = toTranslate.slice(i, i + CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const original = data[id].translation;
        try {
          const translated = await translateText(original);
          return { id, translated };
        } catch (err) {
          console.warn(`  WARN: dua ${id} translation failed: ${err.message}`);
          return { id, translated: null };
        }
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.translated) {
        data[r.value.id].translation = r.value.translated;
        translatedIds.add(r.value.id);
        completed++;
      } else {
        errors++;
      }
    }

    const total = completed + errors;
    if (total % 20 < CONCURRENCY || i + CONCURRENCY >= toTranslate.length) {
      const sec = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `${total}/${toTranslate.length} (${completed} ok, ${errors} err) | ${sec}s`
      );
    }

    // Save every 50
    if (total % 50 < CONCURRENCY || i + CONCURRENCY >= toTranslate.length) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8");
      fs.writeFileSync(MARKER_PATH, JSON.stringify([...translatedIds]), "utf-8");
    }

    if (i + CONCURRENCY < toTranslate.length) await sleep(BATCH_DELAY);
  }

  // Final save
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8");
  fs.writeFileSync(MARKER_PATH, JSON.stringify([...translatedIds]), "utf-8");

  const sec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Done ===`);
  console.log(
    `Translated: ${completed} | Errors: ${errors} | Total: ${translatedIds.size}`
  );
  console.log(`Time: ${sec}s`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
