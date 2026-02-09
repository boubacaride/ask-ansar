/**
 * Lightweight language detection using Unicode ranges + stopwords.
 * Returns 'ar', 'fr', or 'en'.
 */

const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const FRENCH_STOPWORDS = [
  'le', 'la', 'les', 'des', 'une', 'un', 'est', 'que', 'ce',
  'dans', 'pour', 'pas', 'sur', 'sont', 'avec', 'tout', 'mais',
  'cette', 'nous', 'vous', 'leur', 'ces', 'ses', 'aux', 'aussi',
  'entre', 'après', 'très', 'fait', 'comme', 'quoi', 'quel',
  'quelle', 'quels', 'quelles', 'comment', 'donne', 'donnez',
  'moi', 'noms', 'tous', 'allah', 'islam', 'coran', 'sourate',
  'cite', 'combien', 'pourquoi', 'qui', 'ou', 'donc',
];

/**
 * Detect the language of user input text.
 * Priority: Arabic (Unicode) > French (stopwords) > English (default).
 */
export function detectLanguage(text: string): 'ar' | 'fr' | 'en' {
  // If >30% of characters are Arabic script, it's Arabic
  const chars = text.replace(/\s/g, '');
  if (chars.length > 0) {
    const arabicCount = (chars.match(new RegExp(ARABIC_RANGE.source, 'g')) || []).length;
    if (arabicCount / chars.length > 0.3) {
      return 'ar';
    }
  }

  // Check for French stopwords — split on spaces, apostrophes, hyphens
  const words = text.toLowerCase().split(/[\s''\-]+/).filter(Boolean);
  const frenchHits = words.filter((w) => FRENCH_STOPWORDS.includes(w)).length;
  // If at least 2 French stopwords found, or >25% of words are French stopwords
  if (frenchHits >= 2 || (words.length > 0 && frenchHits / words.length > 0.25)) {
    return 'fr';
  }

  // Check for French-specific characters (accented letters common in French)
  if (/[àâçéèêëîïôùûüÿœæ]/i.test(text)) {
    return 'fr';
  }

  return 'en';
}
