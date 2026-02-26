/**
 * Response Validator — post-processes LLM responses for citation checks,
 * confidence scoring, and Quran reference validation.
 *
 * No API calls — pure string analysis for speed.
 */

export interface ValidationResult {
  text: string;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

const LOW_CONFIDENCE_DISCLAIMER =
  '\n\nوالله أعلم (Et Allah sait mieux). Consultez un savant pour confirmer.';

/**
 * Validate and potentially augment an LLM response.
 *
 * - Scores confidence based on source count + similarity
 * - Checks for [Source N] citation references
 * - Validates Quran surah numbers (1–114)
 * - Auto-appends disclaimer for low-confidence answers
 */
export function validateResponse(
  responseText: string,
  ragSourceCount: number,
  avgSimilarity: number,
  questionCategory: string,
): ValidationResult {
  const warnings: string[] = [];
  let text = responseText;

  // -------------------------------------------------------------------------
  // 1. Confidence scoring
  // -------------------------------------------------------------------------
  let confidence: 'high' | 'medium' | 'low';

  if (ragSourceCount >= 3 && avgSimilarity > 0.8) {
    confidence = 'high';
  } else if (ragSourceCount >= 1 && avgSimilarity > 0.65) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // -------------------------------------------------------------------------
  // 2. Citation check — verify [Source N] references exist in text
  // -------------------------------------------------------------------------
  if (ragSourceCount > 0) {
    const citationPattern = /\[Source\s+\d+\]/i;
    if (!citationPattern.test(text)) {
      warnings.push(
        `Response has ${ragSourceCount} RAG source(s) but no [Source N] citations found in text.`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // 3. Quran reference format check — validate surah numbers are 1–114
  // -------------------------------------------------------------------------
  // Matches patterns like "surah 115", "sourate 0", "120:5", etc.
  const surahPatterns = [
    /(?:surah|sourate|سورة)\s+(\d+)/gi,
    /\b(\d{1,3}):(\d+)\b/g,
  ];

  for (const pattern of surahPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const surahNum = parseInt(match[1], 10);
      if (surahNum < 1 || surahNum > 114) {
        warnings.push(
          `Potentially invalid surah number ${surahNum} found (valid range: 1–114).`,
        );
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. Low-confidence disclaimer
  // -------------------------------------------------------------------------
  if (confidence === 'low' && !text.includes('والله أعلم')) {
    text += LOW_CONFIDENCE_DISCLAIMER;
  }

  return { text, confidence, warnings };
}
