/**
 * scrape-duas-content.js
 *
 * Reads data/duas-com-data.json for dua IDs/slugs, fetches each dua page from
 * http://duas.com/dua/{id}/{slug}, parses Arabic text, translation,
 * transliteration, sources, and dua number, then saves everything to
 * data/duas-com-content.json keyed by dua ID.
 *
 * Features:
 *   - Concurrency of 5 simultaneous fetches with 300ms delay between batches
 *   - Resume support (skips already-scraped IDs when output file exists)
 *   - Progress logging every 50 duas
 *   - Graceful error handling (skips failing duas)
 *
 * Usage: node scripts/scrape-duas-content.js
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const PROJECT_DIR = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(PROJECT_DIR, "data", "duas-com-data.json");
const OUTPUT_PATH = path.join(PROJECT_DIR, "data", "duas-com-content.json");

const CONCURRENCY = 5;
const BATCH_DELAY = 300;
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 2;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Strip HTML tags, convert <br> to newlines, decode entities. */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Fetch URL using native fetch (Node 18+), handles http→https redirects automatically. */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(500 * (attempt + 1));
    }
  }
}

/** Parse a dua page HTML and extract arabic, translation, transliteration, sources, duaNumber. */
function parseDuaPage(html) {
  const $ = cheerio.load(html);
  const result = {};

  // Dua number
  const duaIdText = $("div.duaID").text().trim();
  const numMatch = duaIdText.match(/Dua\s*No:\s*(\d+)/i);
  result.duaNumber = numMatch ? parseInt(numMatch[1], 10) : null;

  // Arabic
  const arabicEl = $("div.arabic.green");
  result.arabic = arabicEl.length
    ? stripHtml(arabicEl.html() || "")
        .replace(/\n{2,}/g, "\n")
        .trim()
    : "";

  // Translation & Transliteration
  result.translation = "";
  result.transliteration = "";
  result.sources = "";

  $("div.contentBox").each((_, el) => {
    const box = $(el);
    const titleText = box.find(".contentTitle").text().trim().toLowerCase();

    if (titleText.startsWith("translation")) {
      const hc = box.find(".hiddenContent");
      if (hc.length) {
        result.translation = stripHtml(hc.html() || "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }
    } else if (titleText.startsWith("transliteration")) {
      const hc = box.find(".hiddenContent");
      if (hc.length) {
        result.transliteration = stripHtml(hc.html() || "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }
    }
  });

  // Sources
  $("div.contentBox.green").each((_, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().startsWith("sources")) {
      result.sources = text.replace(/^Sources:\s*/i, "").trim();
    }
  });

  return result;
}

async function main() {
  console.log("=== Duas.com Content Scraper ===\n");

  if (!fs.existsSync(INPUT_PATH)) {
    console.error("ERROR: Input file not found:", INPUT_PATH);
    process.exit(1);
  }
  const inputData = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));

  // Collect unique duas
  const duaMap = new Map();
  for (const letter of inputData.letters || []) {
    for (const cat of letter.categories || []) {
      for (const dua of cat.duas || []) {
        if (dua.id && dua.slug && !duaMap.has(dua.id)) {
          duaMap.set(dua.id, { id: dua.id, slug: dua.slug, title: dua.title });
        }
      }
    }
  }

  const allDuas = Array.from(duaMap.values());
  console.log(`Found ${allDuas.length} unique duas.`);

  // Resume support
  let existing = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
      console.log(`Loaded ${Object.keys(existing).length} already scraped.`);
    } catch (e) {
      existing = {};
    }
  }

  const toScrape = allDuas.filter((d) => !existing[d.id]);
  console.log(`Remaining to scrape: ${toScrape.length}\n`);

  if (toScrape.length === 0) {
    console.log("All done already.");
    return;
  }

  let completed = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < toScrape.length; i += CONCURRENCY) {
    const batch = toScrape.slice(i, i + CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async (dua) => {
        const url = `http://duas.com/dua/${dua.id}/${dua.slug}`;
        try {
          const html = await fetchWithRetry(url);
          const parsed = parseDuaPage(html);
          return { id: dua.id, data: parsed };
        } catch (err) {
          console.warn(`  WARN: dua ${dua.id} failed: ${err.message}`);
          return { id: dua.id, data: null };
        }
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.data) {
        existing[r.value.id] = r.value.data;
        completed++;
      } else {
        errors++;
      }
    }

    const total = completed + errors;
    if (total % 50 < CONCURRENCY || i + CONCURRENCY >= toScrape.length) {
      const sec = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(
        `${total}/${toScrape.length} (${completed} ok, ${errors} err) | ${Object.keys(existing).length} total | ${sec}s`
      );
    }

    // Save every 100
    if (total % 100 < CONCURRENCY || i + CONCURRENCY >= toScrape.length) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2), "utf-8");
    }

    if (i + CONCURRENCY < toScrape.length) await sleep(BATCH_DELAY);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2), "utf-8");

  const sec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Done ===`);
  console.log(
    `Scraped: ${completed} | Errors: ${errors} | Total: ${Object.keys(existing).length}`
  );
  console.log(`Time: ${sec}s | Output: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
