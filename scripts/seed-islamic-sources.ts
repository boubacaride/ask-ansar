/**
 * Seed script — Populates islamic_sources with 500+ entries + embeddings.
 * Run: npx tsx scripts/seed-islamic-sources.ts
 *
 * Imports from modular data files in scripts/data/:
 *   - quran-sources.ts    (~80 Quran verses)
 *   - hadith-sources.ts   (~200 hadiths)
 *   - fiqh-sources.ts     (~100 fiqh rulings)
 *   - aqeedah-sources.ts  (~50 aqeedah entries)
 *   - seerah-sources.ts   (~50 seerah entries)
 *
 * Requires EXPO_PUBLIC_OPENAI_API_KEY and EXPO_PUBLIC_SUPABASE_URL/KEY in .env
 */
import 'dotenv/config';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Data modules
import { QURAN_SOURCES } from './data/quran-sources';
import { HADITH_SOURCES } from './data/hadith-sources';
import { FIQH_SOURCES } from './data/fiqh-sources';
import { AQEEDAH_SOURCES } from './data/aqeedah-sources';
import { SEERAH_SOURCES } from './data/seerah-sources';

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------
const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);

// ---------------------------------------------------------------------------
// Batch embedding (up to 20 texts per API call for efficiency)
// ---------------------------------------------------------------------------
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 250; // respect rate limits

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map((t) => t.slice(0, 8000)),
  });
  return res.data.map((d) => d.embedding);
}

// ---------------------------------------------------------------------------
// Merge all sources
// ---------------------------------------------------------------------------
const ALL_SOURCES = [
  ...QURAN_SOURCES,
  ...HADITH_SOURCES,
  ...FIQH_SOURCES,
  ...AQEEDAH_SOURCES,
  ...SEERAH_SOURCES,
];

// ---------------------------------------------------------------------------
// Ingestion
// ---------------------------------------------------------------------------
async function seed() {
  console.log('=== Islamic Sources Seed Script ===\n');
  console.log(`  Quran:   ${QURAN_SOURCES.length} entries`);
  console.log(`  Hadith:  ${HADITH_SOURCES.length} entries`);
  console.log(`  Fiqh:    ${FIQH_SOURCES.length} entries`);
  console.log(`  Aqeedah: ${AQEEDAH_SOURCES.length} entries`);
  console.log(`  Seerah:  ${SEERAH_SOURCES.length} entries`);
  console.log(`  TOTAL:   ${ALL_SOURCES.length} entries\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < ALL_SOURCES.length; i += BATCH_SIZE) {
    const batch = ALL_SOURCES.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(ALL_SOURCES.length / BATCH_SIZE);

    console.log(`\n--- Batch ${batchNum}/${totalBatches} (${batch.length} entries) ---`);

    // Build embedding texts
    const embeddingTexts = batch.map((source) =>
      [
        source.title,
        source.content,
        source.arabic_text ?? '',
        source.french_text ?? '',
      ].join(' '),
    );

    try {
      // Batch embed
      const embeddings = await getEmbeddings(embeddingTexts);

      // Insert each entry with its embedding
      for (let j = 0; j < batch.length; j++) {
        const source = batch[j];
        const embedding = embeddings[j];

        try {
          // Check for duplicates by title + source_type
          const { data: existing } = await supabase
            .from('islamic_sources')
            .select('id')
            .eq('title', source.title)
            .eq('source_type', source.source_type)
            .limit(1);

          if (existing && existing.length > 0) {
            console.log(`  SKIP ${source.source_type.padEnd(10)} | ${source.title} (already exists)`);
            skipped++;
            continue;
          }

          const { error } = await supabase.from('islamic_sources').insert({
            ...source,
            content_embedding: JSON.stringify(embedding),
          });

          if (error) throw error;

          console.log(`  OK   ${source.source_type.padEnd(10)} | ${source.title}`);
          success++;
        } catch (err: any) {
          console.error(`  FAIL ${source.title}: ${err.message}`);
          failed++;
        }
      }
    } catch (err: any) {
      // Batch embedding failed — try one by one
      console.warn(`  Batch embedding failed: ${err.message}. Retrying individually...`);

      for (const source of batch) {
        try {
          const text = [source.title, source.content, source.arabic_text ?? '', source.french_text ?? ''].join(' ');
          const [embedding] = await getEmbeddings([text]);

          const { error } = await supabase.from('islamic_sources').insert({
            ...source,
            content_embedding: JSON.stringify(embedding),
          });

          if (error) throw error;

          console.log(`  OK   ${source.source_type.padEnd(10)} | ${source.title}`);
          success++;
        } catch (innerErr: any) {
          console.error(`  FAIL ${source.title}: ${innerErr.message}`);
          failed++;
        }

        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // Rate limit delay between batches
    if (i + BATCH_SIZE < ALL_SOURCES.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log('\n=== RESULTS ===');
  console.log(`  Ingested: ${success}`);
  console.log(`  Skipped:  ${skipped} (already in DB)`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Total:    ${ALL_SOURCES.length}`);
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
