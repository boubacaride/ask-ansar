/**
 * Seed script for the duas table.
 * Run: npx tsx scripts/seed-duas.ts
 *
 * This script:
 * 1. Reads all curated duas from utils/duaFallbacks.ts
 * 2. Converts them to Supabase format (snake_case)
 * 3. Seeds the duas table with all data
 *
 * Data sourced from authenticated Islamic references (Bukhari, Muslim, Tirmidhi, etc.)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { FALLBACK_DUAS } from '../utils/duaFallbacks';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface DuaRow {
  category: string;
  title: string;
  arabic_text: string;
  english_text: string;
  french_text: string;
  transliteration: string;
  reference: string;
  repetitions: number;
  sort_order: number;
  source_url: string;
}

function buildRows(): DuaRow[] {
  const rows: DuaRow[] = [];

  for (const [category, duas] of Object.entries(FALLBACK_DUAS)) {
    duas.forEach((dua, index) => {
      rows.push({
        category: dua.category,
        title: dua.title,
        arabic_text: dua.arabicText,
        english_text: dua.englishText,
        french_text: dua.frenchText,
        transliteration: dua.transliteration,
        reference: dua.reference,
        repetitions: dua.repetitions,
        sort_order: index + 1,
        source_url: 'https://duaandazkar.com',
      });
    });
  }

  return rows;
}

async function seedDuas() {
  const rows = buildRows();
  console.log(`\n=== Duas Seeding Script ===`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Total duas to seed: ${rows.length}\n`);

  // Check if table exists
  const { error: checkError } = await supabase.from('duas').select('id').limit(1);
  if (checkError && checkError.code === '42P01') {
    console.error('ERROR: The "duas" table does not exist yet!');
    console.error('Please create it in the Supabase SQL Editor.');
    return;
  }

  // Clear existing data
  const { error: deleteError } = await supabase
    .from('duas')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.warn('Could not clear existing data:', deleteError.message);
  } else {
    console.log('Cleared existing duas data.');
  }

  // Insert in batches of 10
  const batchSize = 10;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('duas').insert(batch);

    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      console.error('  Details:', JSON.stringify(error));
    } else {
      inserted += batch.length;
      console.log(`\u2713 Inserted batch ${Math.floor(i / batchSize) + 1} (${inserted}/${rows.length} total)`);
    }
  }

  console.log(`\n\u2705 Done! ${inserted}/${rows.length} duas seeded successfully.`);

  // Verify counts per category
  const categories = [...new Set(rows.map(d => d.category))];
  console.log('\nDuas per category:');
  for (const cat of categories.sort()) {
    const count = rows.filter(d => d.category === cat).length;
    console.log(`  ${cat}: ${count}`);
  }

  // Verify via Supabase query
  console.log('\nVerifying in Supabase...');
  const { count, error: countError } = await supabase
    .from('duas')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.warn('Could not verify count:', countError.message);
  } else {
    console.log(`Total rows in Supabase duas table: ${count}`);
  }
}

seedDuas().catch(console.error);
