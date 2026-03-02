/**
 * Generate SQL INSERT statements from duaFallbacks.ts
 * Run: npx tsx scripts/gen-seed-sql.ts > scripts/seed-duas-v2.sql
 */

import { FALLBACK_DUAS } from '../utils/duaFallbacks';
import * as fs from 'fs';
import * as path from 'path';

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function generateSQL(): string {
  const lines: string[] = [];

  lines.push('-- Seed duas table with curated data from duaFallbacks.ts');
  lines.push('-- Generated on ' + new Date().toISOString());
  lines.push('-- Total categories: ' + Object.keys(FALLBACK_DUAS).length);
  lines.push('');

  // Delete existing data first
  lines.push('-- Clear existing data');
  lines.push("DELETE FROM duas WHERE id IS NOT NULL;");
  lines.push('');

  let totalCount = 0;

  for (const [category, duas] of Object.entries(FALLBACK_DUAS)) {
    lines.push(`-- ═══ ${category.toUpperCase()} (${duas.length} duas) ═══`);

    duas.forEach((dua, index) => {
      totalCount++;
      const sortOrder = index + 1;

      lines.push(`INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (`);
      lines.push(`  '${escapeSQL(dua.category)}',`);
      lines.push(`  '${escapeSQL(dua.title)}',`);
      lines.push(`  '${escapeSQL(dua.arabicText)}',`);
      lines.push(`  '${escapeSQL(dua.englishText)}',`);
      lines.push(`  '${escapeSQL(dua.frenchText)}',`);
      lines.push(`  '${escapeSQL(dua.transliteration)}',`);
      lines.push(`  '${escapeSQL(dua.reference)}',`);
      lines.push(`  ${dua.repetitions},`);
      lines.push(`  ${sortOrder}`);
      lines.push(`);`);
      lines.push('');
    });
  }

  lines.push(`-- Total: ${totalCount} duas inserted`);
  lines.push(`-- Verify: SELECT category, COUNT(*) FROM duas GROUP BY category ORDER BY category;`);

  return lines.join('\n');
}

const sql = generateSQL();
const outPath = path.join(__dirname, 'seed-duas-v2.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
console.log(`Generated SQL at: ${outPath}`);
console.log(`Total size: ${(sql.length / 1024).toFixed(1)} KB`);

// Count duas
let total = 0;
for (const [cat, duas] of Object.entries(FALLBACK_DUAS)) {
  total += duas.length;
  console.log(`  ${cat}: ${duas.length}`);
}
console.log(`Total duas: ${total}`);
