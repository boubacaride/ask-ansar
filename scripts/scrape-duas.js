/**
 * Duas.com Scraper
 *
 * Fetches all dua categories and their duas from the Duas.com JSON API.
 * Uses native fetch (Node 18+). No external dependencies required.
 *
 * Endpoints:
 *   GET https://duas.com/categories.php?fetchCategories={letter}
 *   GET https://duas.com/categories.php?fetchDuas={tagID}
 *
 * Usage: node scripts/scrape-duas.js
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://duas.com/categories.php";
const DELAY_MS = 500;
const OUTPUT_DIR = path.join(__dirname, "..", "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "duas-com-data.json");

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch categories for a given letter.
 * Returns an array of { t_id, t_tag } or an empty array if none found.
 */
async function fetchCategoriesByLetter(letter) {
  const url = `${BASE_URL}?fetchCategories=${letter}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  [WARN] HTTP ${res.status} for letter "${letter}"`);
      return [];
    }
    const text = await res.text();
    // The API returns `false` (literal string) when no categories exist
    if (text.trim() === "false" || text.trim() === "") {
      return [];
    }
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (err) {
    console.error(`  [ERROR] Failed to fetch categories for "${letter}": ${err.message}`);
    return [];
  }
}

/**
 * Fetch duas for a given tag/category ID.
 * Returns an array of { d_id, d_name, d_slug } or an empty array.
 */
async function fetchDuasByTagId(tagId) {
  const url = `${BASE_URL}?fetchDuas=${tagId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  [WARN] HTTP ${res.status} for tag ID ${tagId}`);
      return [];
    }
    const text = await res.text();
    if (text.trim() === "false" || text.trim() === "") {
      return [];
    }
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (err) {
    console.error(`  [ERROR] Failed to fetch duas for tag ${tagId}: ${err.message}`);
    return [];
  }
}

/**
 * Derive a slug from a category name (t_tag).
 * e.g. "Aakhirah (Hereafter)" -> "aakhirah-hereafter"
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("=== Duas.com Scraper ===\n");

  const result = {
    scrapedAt: new Date().toISOString(),
    letters: [],
  };

  let totalCategories = 0;
  let totalDuas = 0;

  for (const letter of LETTERS) {
    console.log(`Fetching categories for letter: ${letter.toUpperCase()}`);
    const rawCategories = await fetchCategoriesByLetter(letter);
    await sleep(DELAY_MS);

    const letterEntry = {
      letter,
      categories: [],
    };

    if (rawCategories.length === 0) {
      console.log(`  No categories found for "${letter}"\n`);
      result.letters.push(letterEntry);
      continue;
    }

    console.log(`  Found ${rawCategories.length} categories`);
    totalCategories += rawCategories.length;

    for (const cat of rawCategories) {
      const categorySlug = slugify(cat.t_tag);
      console.log(`  Fetching duas for: ${cat.t_tag} (ID: ${cat.t_id})`);

      const rawDuas = await fetchDuasByTagId(cat.t_id);
      await sleep(DELAY_MS);

      const categoryEntry = {
        id: cat.t_id,
        name: cat.t_tag,
        slug: categorySlug,
        sourceUrl: BASE_URL,
        duas: rawDuas.map((d) => ({
          id: d.d_id,
          title: d.d_name,
          slug: d.d_slug,
          url: `https://duas.com/dua/${d.d_id}/${d.d_slug}`,
        })),
      };

      totalDuas += categoryEntry.duas.length;
      console.log(`    -> ${categoryEntry.duas.length} duas`);

      letterEntry.categories.push(categoryEntry);
    }

    result.letters.push(letterEntry);
    console.log();
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf-8");

  console.log("=== Scraping Complete ===");
  console.log(`  Total categories: ${totalCategories}`);
  console.log(`  Total duas:       ${totalDuas}`);
  console.log(`  Output:           ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
