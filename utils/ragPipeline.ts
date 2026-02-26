/**
 * RAG Pipeline — Semantic cache + vector source search + question classification.
 *
 * Flow: embed question → check cache → classify → search sources → build context.
 * Every step fails gracefully so the existing LLM flow continues unchanged on error.
 */
import OpenAI from 'openai';
import { supabase } from '@/utils/supabase';
import { rateLimiter } from '@/utils/rateLimiter';
import { deduplicateRequest, getCachedEmbedding, setCachedEmbedding } from '@/utils/requestDedup';
import { detectLanguage } from '@/llm/languageDetect';
import type { SourceBadge, RAGResult } from '@/types/chat';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EMBEDDING_MODEL = 'text-embedding-3-small';
const CACHE_SIMILARITY = 0.95;
const SOURCE_SIMILARITY = 0.60;
const MAX_SOURCES = 5;

// Grade colors used by SourceBadges component
const GRADE_COLORS: Record<string, string> = {
  sahih: '#10B981',
  hasan: '#F59E0B',
  sahih_li_ghayrihi: '#34D399',
  hasan_li_ghayrihi: '#FBBF24',
  daif: '#EF4444',
  mawdu: '#991B1B',
};

// ---------------------------------------------------------------------------
// OpenAI client (reuses existing EXPO_PUBLIC_OPENAI_API_KEY)
// ---------------------------------------------------------------------------
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey || apiKey.length < 20 || apiKey.includes('YOUR_')) return null;
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

// ---------------------------------------------------------------------------
// 1. Embedding generation
// ---------------------------------------------------------------------------
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    // Check LRU cache first
    const cached = getCachedEmbedding(text);
    if (cached) return cached;

    const client = getOpenAIClient();
    if (!client) return null;

    const response = await rateLimiter.throttle('openai', () =>
      client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8000),
      }),
    );
    const embedding = response.data[0].embedding;

    // Store in LRU cache
    setCachedEmbedding(text, embedding);

    return embedding;
  } catch (err) {
    console.warn('[RAG] Embedding generation failed:', (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 2. Semantic cache check
// ---------------------------------------------------------------------------
async function checkSemanticCache(embedding: number[], language?: string): Promise<{
  hit: boolean;
  answer?: string;
  sources?: SourceBadge[];
  cacheId?: string;
}> {
  try {
    const { data, error } = await supabase.rpc('check_semantic_cache', {
      query_embedding: JSON.stringify(embedding),
      similarity_threshold: CACHE_SIMILARITY,
    });

    if (error || !data || data.length === 0) {
      return { hit: false };
    }

    // Language-aware filtering: skip cache entries in a different language
    const row = language
      ? data.find((r: any) => r.language === language) ?? data[0]
      : data[0];

    if (!row) return { hit: false };

    // Increment hit count in background
    supabase.rpc('increment_cache_hit', { cache_id: row.id }).catch(() => {});

    // Parse sources from jsonb
    let sources: SourceBadge[] = [];
    try {
      sources = typeof row.answer_sources === 'string'
        ? JSON.parse(row.answer_sources)
        : row.answer_sources ?? [];
    } catch {
      sources = [];
    }

    return {
      hit: true,
      answer: row.answer_text,
      sources,
      cacheId: row.id,
    };
  } catch (err) {
    console.warn('[RAG] Cache check failed:', (err as Error).message);
    return { hit: false };
  }
}

// ---------------------------------------------------------------------------
// 3. Question classification (fast, no API call)
// ---------------------------------------------------------------------------
export type QuestionCategory = 'quran' | 'hadith' | 'fiqh' | 'aqeedah' | 'seerah' | 'tafsir' | 'general';

const CATEGORY_PATTERNS: [QuestionCategory, RegExp][] = [
  ['quran', /quran|coran|sourate|surah|verse|ayah|ayat|قرآن|آية|recit|récitation|tajwid|مصحف|تلاوة/i],
  ['tafsir', /tafsir|تفسير|exégèse|interprétation|meaning.*verse|signification/i],
  ['hadith', /hadith|حديث|prophet.*said|sunnah|narrator|bukhari|muslim|tirmidhi|abu.?daw|ibn.?majah|nasai|رسول الله|النبي|سنة|رواية|صحيح|حسن|rapporté|narrateur|chaîne/i],
  ['fiqh', /halal|haram|permissible|ruling|wudu|salah|salat|prayer|fasting|zakat|hajj|umrah|nikah|divorce|fiqh|حكم|فتوى|licite|illicite|jeûne|prière|ablution|aumône|pèlerinage|mariage|héritage|finance|nourriture|purification|صلاة|صيام|زكاة|حج|عمرة|نكاح|طلاق|ميراث|وضوء|طهارة/i],
  ['aqeedah', /belief|aqeedah|aqidah|tawhid|shirk|angels|qadr|destiny|afterlife|jannah|jahannam|عقيدة|توحيد|إيمان|croyance|foi|paradis|enfer|résurrection|anges|livres|prophètes|destin|جنة|نار|بعث|ملائكة/i],
  ['seerah', /prophet.*life|seerah|biography|battle|migration|hijrah|companion|sahab|سيرة|هجرة|biographie|prophète|compagnon|bataille|غزوة|صحابة|فتح/i],
];

export function classifyQuestion(query: string): QuestionCategory {
  for (const [category, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(query)) return category;
  }
  return 'general';
}

// ---------------------------------------------------------------------------
// 4. Source search via hybrid vector + full-text search
// ---------------------------------------------------------------------------
async function searchIslamicSources(
  embedding: number[],
  category: QuestionCategory,
  queryText: string = '',
): Promise<{ badges: SourceBadge[]; rawResults: any[] }> {
  try {
    // Use hybrid search (vector 0.7 + FTS 0.3) for better recall
    const { data, error } = await rateLimiter.throttle('supabase', () =>
      supabase.rpc('hybrid_search_islamic_sources', {
        query_embedding: JSON.stringify(embedding),
        query_text: queryText,
        match_threshold: SOURCE_SIMILARITY,
        match_count: MAX_SOURCES,
        filter_type: category !== 'general' ? category : null,
        filter_min_grade: 'hasan',
      }),
    );

    if (error || !data || data.length === 0) {
      // If category-filtered search returned nothing, try without filter
      if (category !== 'general') {
        const { data: fallbackData, error: fbError } = await rateLimiter.throttle('supabase', () =>
          supabase.rpc('hybrid_search_islamic_sources', {
            query_embedding: JSON.stringify(embedding),
            query_text: queryText,
            match_threshold: SOURCE_SIMILARITY,
            match_count: MAX_SOURCES,
            filter_type: null,
            filter_min_grade: 'hasan',
          }),
        );
        if (fbError || !fallbackData || fallbackData.length === 0) {
          return { badges: [], rawResults: [] };
        }
        return {
          badges: mapToBadges(fallbackData),
          rawResults: fallbackData,
        };
      }
      return { badges: [], rawResults: [] };
    }

    return {
      badges: mapToBadges(data),
      rawResults: data,
    };
  } catch (err) {
    console.warn('[RAG] Source search failed:', (err as Error).message);
    return { badges: [], rawResults: [] };
  }
}

function mapToBadges(rows: any[]): SourceBadge[] {
  return rows.map((r) => ({
    type: r.source_type as SourceBadge['type'],
    label: r.book_name || r.title,
    reference: r.reference ?? undefined,
    grade: r.hadith_grade ?? undefined,
    gradeColor: r.hadith_grade ? GRADE_COLORS[r.hadith_grade] : undefined,
    verseKey: r.verse_key ?? undefined,
    similarity: r.similarity,
  }));
}

// ---------------------------------------------------------------------------
// 5. Build RAG context string for the LLM prompt
// ---------------------------------------------------------------------------
function buildRAGContext(rawResults: any[]): string {
  if (rawResults.length === 0) return '';

  const entries = rawResults.map((r, i) => {
    let entry = `[Source ${i + 1}] ${r.source_type.toUpperCase()} — ${r.title}`;
    if (r.reference) entry += ` | Ref: ${r.reference}`;
    if (r.hadith_grade) entry += ` | Grade: ${r.hadith_grade}`;
    if (r.narrator) entry += ` | Narrator: ${r.narrator}`;
    if (r.arabic_text) entry += `\nArabic: ${r.arabic_text}`;
    entry += `\nContent: ${r.content}`;
    if (r.french_text) entry += `\nFrench: ${r.french_text}`;
    entry += `\nRelevance: ${(r.similarity * 100).toFixed(1)}%`;
    return entry;
  });

  return [
    '=== VERIFIED SOURCES (ground your answer in these) ===',
    entries.join('\n\n---\n\n'),
    '=== END SOURCES ===',
    '',
    'INSTRUCTIONS: Base your answer primarily on the sources above. Cite them by [Source N].',
    'If sources are insufficient for the question, state that no verified source was found for that specific point.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// 6. Write answer to semantic cache (fire-and-forget, language-aware)
// ---------------------------------------------------------------------------

/**
 * TTL strategy:
 * - high-confidence (3+ sources, avg > 0.8): 30 days
 * - medium-confidence: 7 days (default)
 * - low-confidence: never cached (handled in chatUtils.ts)
 */
function getCacheTTLDays(sourceCount: number, avgSimilarity: number): number {
  if (sourceCount >= 3 && avgSimilarity > 0.8) return 30;
  return 7;
}

export async function writeSemanticCache(
  embedding: number[] | null,
  question: string,
  answer: string,
  sources: SourceBadge[],
  language: string = 'fr',
): Promise<void> {
  if (!embedding) return;
  try {
    const avgSim = sources.length > 0
      ? sources.reduce((s, b) => s + (b.similarity ?? 0), 0) / sources.length
      : 0;
    const ttlDays = getCacheTTLDays(sources.length, avgSim);

    await supabase.from('semantic_cache').insert({
      question_text: question,
      question_embedding: JSON.stringify(embedding),
      answer_text: answer,
      answer_sources: sources,
      language,
      expires_at: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.warn('[RAG] Cache write failed:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// 7. Main pipeline orchestrator
// ---------------------------------------------------------------------------
export async function processQuery(query: string): Promise<RAGResult> {
  return deduplicateRequest(query, async () => {
    const empty: RAGResult = {
      context: '',
      sources: [],
      cacheHit: false,
      embedding: null,
    };

    // Step 1: Generate embedding
    const embedding = await generateEmbedding(query);
    if (!embedding) return empty;

    // Step 2: Check semantic cache (language-aware)
    const lang = detectLanguage(query);
    const cache = await checkSemanticCache(embedding, lang);
    if (cache.hit && cache.answer) {
      return {
        context: '',
        sources: cache.sources ?? [],
        cacheHit: true,
        cachedAnswer: cache.answer,
        cachedSources: cache.sources,
        embedding,
      };
    }

    // Step 3: Classify question
    const category = classifyQuestion(query);

    // Step 4: Search islamic sources (hybrid vector + full-text)
    const { badges, rawResults } = await searchIslamicSources(embedding, category, query);

    // Step 5: Build RAG context
    const context = buildRAGContext(rawResults);

    return {
      context,
      sources: badges,
      cacheHit: false,
      embedding,
    };
  });
}
