/**
 * Unit tests for language detection.
 * Run with: npx tsx __tests__/languageDetect.test.ts
 */
import { detectLanguage } from '../llm/languageDetect';

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

console.log('=== Language Detection Tests ===\n');

// English detection
console.log('-- English --');
assert(detectLanguage('Give me the 99 names of Allah') === 'en', 'English: 99 names of Allah');
assert(detectLanguage('What are the pillars of Islam?') === 'en', 'English: pillars of Islam');
assert(detectLanguage('Hello, how are you?') === 'en', 'English: greeting');
assert(detectLanguage('Tell me about Hajj') === 'en', 'English: about Hajj');

// French detection
console.log('\n-- French --');
assert(detectLanguage('Donne moi les 99 noms d\'Allah') === 'fr', 'French: 99 names of Allah');
assert(detectLanguage('Quels sont les piliers de l\'Islam?') === 'fr', 'French: pillars of Islam');
assert(detectLanguage('Cite moi tous les noms d\'Allah') === 'fr', 'French: cite all names');
assert(detectLanguage('Qu\'est-ce que le Hajj?') === 'fr', 'French: what is Hajj');
assert(detectLanguage('Donnez moi les sourates du Coran') === 'fr', 'French: surahs of Quran');
assert(detectLanguage('Comment faire la prière?') === 'fr', 'French: how to pray');

// Arabic detection
console.log('\n-- Arabic --');
assert(detectLanguage('أعطني أسماء الله الحسنى') === 'ar', 'Arabic: names of Allah');
assert(detectLanguage('ما هي أركان الإسلام؟') === 'ar', 'Arabic: pillars of Islam');
assert(detectLanguage('كيف أصلي؟') === 'ar', 'Arabic: how to pray');

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
