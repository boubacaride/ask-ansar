/**
 * Unit tests for completeness guard.
 * Run with: npx tsx __tests__/completenessGuard.test.ts
 */
import { analyzeCompleteness, verifyCompleteness } from '../llm/completenessGuard';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

console.log('=== Completeness Guard Tests ===\n');

// 99 names detection
console.log('-- Known list detection: 99 names --');

const en99 = analyzeCompleteness('Give me the 99 names of Allah');
assert(en99.isListRequest === true, 'EN: detects list request');
assert(en99.expectedCount === 99, 'EN: expected count is 99');

const fr99 = analyzeCompleteness("Donne moi les noms d'Allah");
assert(fr99.isListRequest === true, 'FR: detects names of Allah');
assert(fr99.expectedCount === 99, 'FR: expected count is 99');

const ar99 = analyzeCompleteness('أسماء الله الحسنى');
assert(ar99.isListRequest === true, 'AR: detects Asma ul Husna');
assert(ar99.expectedCount === 99, 'AR: expected count is 99');

const asma = analyzeCompleteness('What is Asma ul Husna?');
assert(asma.isListRequest === true, 'EN: detects Asma ul Husna variant');

// Pillars detection
console.log('\n-- Known list detection: Pillars --');

const pillars = analyzeCompleteness('What are the pillars of Islam?');
assert(pillars.isListRequest === true, 'EN: detects pillars of Islam');
assert(pillars.expectedCount === 5, 'EN: expected count is 5');

const piliersFr = analyzeCompleteness("Quels sont les piliers de l'Islam?");
assert(piliersFr.isListRequest === true, 'FR: detects pillars of Islam');
assert(piliersFr.expectedCount === 5, 'FR: expected count is 5');

// Generic completeness keywords
console.log('\n-- Generic completeness --');

const allTest = analyzeCompleteness('List all the prophets mentioned in the Quran');
assert(allTest.isListRequest === true, 'EN: "list all" triggers completeness');
assert(allTest.expectedCount === null, 'EN: no specific expected count');

const tousTest = analyzeCompleteness('Cite moi tous les prophètes');
assert(tousTest.isListRequest === true, 'FR: "tous" triggers completeness');

// Non-list queries
console.log('\n-- Non-list queries --');

const simple = analyzeCompleteness('What is Hajj?');
assert(simple.isListRequest === false, 'EN: simple question is not a list');

const simpleFr = analyzeCompleteness("Qu'est-ce que le Ramadan?");
assert(simpleFr.isListRequest === false, 'FR: simple question is not a list');

// Verification
console.log('\n-- Response verification --');

const partialResponse = '1. Ar-Rahman\n2. Ar-Rahim\n3. Al-Malik\n4. Al-Quddus';
const v1 = verifyCompleteness(partialResponse, 99);
assert(v1.itemCount === 4, 'Counts 4 items in partial response');
assert(v1.isComplete === false, 'Marks as incomplete (4/99)');

// Generate a mock 99-item response
const fullLines = Array.from({ length: 99 }, (_, i) => `${i + 1}. Name ${i + 1}`).join('\n');
const v2 = verifyCompleteness(fullLines, 99);
assert(v2.itemCount === 99, 'Counts 99 items in full response');
assert(v2.isComplete === true, 'Marks as complete (99/99)');

const v3 = verifyCompleteness('Some text without numbered items', 99);
assert(v3.itemCount === 0, 'Counts 0 items in non-list response');
assert(v3.isComplete === false, 'Marks as incomplete (0/99)');

// Prompt augmentation
console.log('\n-- Prompt augmentation --');
assert(en99.promptAugmentation.includes('99'), 'Augmentation mentions 99');
assert(en99.promptAugmentation.includes('CRITICAL'), 'Augmentation includes CRITICAL keyword');
assert(allTest.promptAugmentation.includes('COMPLETENESS'), 'Generic augmentation present');
assert(simple.promptAugmentation === '', 'No augmentation for simple query');

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
