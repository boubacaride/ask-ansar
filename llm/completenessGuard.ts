/**
 * Completeness guard: detects when users ask for complete lists
 * and provides prompt augmentation + post-response verification.
 */

/** Known list requests with expected counts. */
const LIST_EXPECTATIONS: Array<{
  patterns: RegExp[];
  expectedCount: number;
  label: string;
}> = [
  {
    patterns: [
      /99\s*n(om|ame)s?\b/i,
      /n(om|ame)s?\s*(d['']?\s*)?allah/i,
      /asma\s*(ul|al)?\s*husna/i,
      /أسماء\s*الله\s*الحسنى/,
      /noms\s*d(e|')\s*dieu/i,
      /names\s*of\s*(god|allah)/i,
      /beautiful\s*names/i,
      /beaux\s*noms/i,
    ],
    expectedCount: 99,
    label: '99 Names of Allah',
  },
  {
    patterns: [
      /piliers?\s*(de\s*l['']?\s*islam|of\s*islam)/i,
      /pillars?\s*of\s*islam/i,
      /أركان\s*الإسلام/,
    ],
    expectedCount: 5,
    label: 'Pillars of Islam',
  },
  {
    patterns: [
      /piliers?\s*(de\s*la\s*foi|of\s*(the\s*)?faith|iman)/i,
      /pillars?\s*of\s*(iman|faith)/i,
      /أركان\s*الإيمان/,
    ],
    expectedCount: 6,
    label: 'Pillars of Iman',
  },
];

/** Generic "give me all/complete/full/entire" detection. */
const COMPLETENESS_KEYWORDS = [
  /\ball\b/i,
  /\bcomplete\b/i,
  /\bfull\b/i,
  /\bentire\b/i,
  /\btous\b/i,
  /\btoutes\b/i,
  /\bcomplète\b/i,
  /\bcomplet\b/i,
  /\bintégral/i,
  /\bكامل/,
  /\bجميع/,
  /\bكل\b/,
  /\bcite[z]?\s*(moi\s*)?(les|tous)/i,
  /\bliste?\b/i,
  /\blist\b/i,
  /\bénumère/i,
  /\benumerate/i,
  /\bdonne[z]?\s*(moi\s*)?(les|tous)/i,
];

export interface CompletenessInfo {
  /** Whether the query asks for a complete list */
  isListRequest: boolean;
  /** Expected item count if known (e.g., 99 for names of Allah) */
  expectedCount: number | null;
  /** Human-readable label for the list */
  label: string | null;
  /** Extra system prompt to enforce completeness */
  promptAugmentation: string;
}

/**
 * Analyze a user query and return completeness metadata.
 */
export function analyzeCompleteness(query: string): CompletenessInfo {
  // Check known list patterns first
  for (const entry of LIST_EXPECTATIONS) {
    for (const pattern of entry.patterns) {
      if (pattern.test(query)) {
        return {
          isListRequest: true,
          expectedCount: entry.expectedCount,
          label: entry.label,
          promptAugmentation: buildPromptAugmentation(entry.expectedCount, entry.label),
        };
      }
    }
  }

  // Check generic completeness keywords
  const hasCompletenessKeyword = COMPLETENESS_KEYWORDS.some((re) => re.test(query));
  if (hasCompletenessKeyword) {
    return {
      isListRequest: true,
      expectedCount: null,
      label: null,
      promptAugmentation: buildGenericCompletenessPrompt(),
    };
  }

  return {
    isListRequest: false,
    expectedCount: null,
    label: null,
    promptAugmentation: '',
  };
}

function buildPromptAugmentation(expectedCount: number, label: string): string {
  return `
CRITICAL COMPLETENESS REQUIREMENT:
The user is asking for the complete ${label}. You MUST provide ALL ${expectedCount} items in a numbered list from 1 to ${expectedCount}.
- Do NOT stop early or truncate.
- Do NOT summarize or skip items.
- Number each item sequentially: 1. ... 2. ... up to ${expectedCount}.
- If each item has an Arabic name and a meaning/translation, include both.
- Output every single item. The response MUST contain exactly ${expectedCount} numbered items.
- After the list, include a brief closing line confirming the total count.`;
}

function buildGenericCompletenessPrompt(): string {
  return `
COMPLETENESS REQUIREMENT:
The user is asking for a complete list. You MUST provide ALL items without truncation.
- Number each item sequentially.
- Do NOT stop early, summarize, or skip items.
- Do NOT say "and so on" or "etc." — list every single item.
- After the list, confirm the total count.`;
}

/**
 * Post-response verification: check if the response contains the expected
 * number of items.
 * Returns the count of numbered items found, or null if not a list.
 */
export function verifyCompleteness(
  responseText: string,
  expectedCount: number | null
): { itemCount: number; isComplete: boolean } {
  // Count lines that start with a number followed by . or )
  const numberedLines = responseText.match(/^\s*\d+[\.\)]\s/gm);
  const itemCount = numberedLines?.length ?? 0;

  if (expectedCount === null) {
    return { itemCount, isComplete: true };
  }

  return {
    itemCount,
    isComplete: itemCount >= expectedCount,
  };
}

/**
 * Build a continuation prompt to get the remaining items.
 */
export function buildContinuationPrompt(
  currentCount: number,
  expectedCount: number,
  label: string | null
): string {
  return `You previously provided items 1 through ${currentCount}${label ? ` of the ${label}` : ''}.
The list is incomplete. Continue from item ${currentCount + 1} to item ${expectedCount}.
Use the same format (numbered list). Do NOT repeat items 1-${currentCount}. Start directly with ${currentCount + 1}.`;
}
