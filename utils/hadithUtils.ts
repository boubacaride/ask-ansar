import { supabase as supabaseClient } from './supabase';

export interface TranslatedHadith {
  hadithNumber: string;
  arabicText: string;
  englishText: string;
  frenchText: string;
  reference: string;
  book: string;
  chapter: string;
}

export interface HadithBook {
  bookNumber: number;
  bookTitle: string;
  bookTitleArabic?: string;
  hadithCount: number;
}

export interface CollectionMetadata {
  collectionId: string;
  totalBooks: number;
  totalHadiths: number;
  lastSyncedAt?: string;
}

interface SunnahAPIHadith {
  hadithNumber: string;
  hadithArabic: string;
  hadithEnglish: string;
  englishNarrator?: string;
  hadithUrdu?: string;
  urduNarrator?: string;
  arabicChapter?: string;
  englishChapter?: string;
  bookSlug?: string;
  chapterId?: string;
}

interface SunnahAPIBook {
  bookNumber: string;
  book: Array<{
    lang: string;
    name: string;
  }>;
  hadithStartNumber: number;
  hadithEndNumber: number;
  numberOfHadith: number;
}

const SUNNAH_API_BASE = 'https://api.sunnah.com/v1';
const SUNNAH_API_KEY = process.env.EXPO_PUBLIC_SUNNAH_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delayMs: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await delay(delayMs);
    return retryWithBackoff(fn, retries - 1, delayMs * 2);
  }
}

async function fetchFromSunnahAPI(
  collectionId: string,
  bookNumber?: number
): Promise<TranslatedHadith[]> {
  if (!SUNNAH_API_KEY) {
    throw new Error('Sunnah.com API key not configured');
  }

  const endpoint = bookNumber
    ? `${SUNNAH_API_BASE}/collections/${collectionId}/books/${bookNumber}/hadiths`
    : `${SUNNAH_API_BASE}/collections/${collectionId}/hadiths`;

  console.log('Fetching from Sunnah.com API:', endpoint);

  const response = await fetch(endpoint, {
    headers: {
      'X-API-Key': SUNNAH_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Sunnah API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const hadiths: SunnahAPIHadith[] = data.data || [];

  return hadiths.map((hadith, index) => ({
    hadithNumber: hadith.hadithNumber || `${bookNumber || 1}-${index + 1}`,
    arabicText: hadith.hadithArabic || '',
    englishText: hadith.hadithEnglish || '',
    frenchText: '',
    reference: `${collectionId} ${hadith.hadithNumber || ''}`,
    book: hadith.bookSlug || `Book ${bookNumber || ''}`,
    chapter: hadith.englishChapter || '',
  }));
}

async function fetchFromDatabase(
  collectionId: string,
  bookNumber: number
): Promise<TranslatedHadith[]> {
  const { data, error } = await supabaseClient
    .from('hadiths')
    .select('*')
    .eq('collection_id', collectionId)
    .eq('book_number', bookNumber)
    .order('hadith_number_in_book', { ascending: true });

  if (error || !data || data.length === 0) {
    throw new Error('No cached data found');
  }

  return data.map((row) => ({
    hadithNumber: row.hadith_number,
    arabicText: row.arabic_text,
    englishText: row.english_text,
    frenchText: row.french_text || '',
    reference: row.reference,
    book: row.book_title,
    chapter: row.chapter_title || '',
  }));
}

async function fetchFromEdgeFunction(url: string): Promise<TranslatedHadith[]> {
  const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sunnah-translator`;

  console.log('Fetching from edge function:', apiUrl);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge function error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.hadiths || [];
}

async function translateTextWithClaude(text: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'sk-ant-api03-YOUR_ANTHROPIC_API_KEY_HERE') {
    console.warn('Anthropic API key not configured, trying OpenAI fallback');
    return translateTextWithOpenAI(text);
  }

  try {
    console.log('Translating with Claude AI...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Translate this Islamic hadith to French. Only return the French translation, nothing else. Preserve Islamic terminology (Allah, Prophète Muhammad ﷺ, etc.):\n\n${text}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, response.statusText, errorText);
      console.log('Falling back to OpenAI...');
      return translateTextWithOpenAI(text);
    }

    const data = await response.json();
    const translation = data.content?.[0]?.text?.trim();

    if (!translation) {
      console.warn('No translation received from Claude, trying OpenAI');
      return translateTextWithOpenAI(text);
    }

    console.log('✓ Translation successful with Claude AI');
    return translation;
  } catch (error) {
    console.error('Claude translation error:', error);
    console.log('Falling back to OpenAI...');
    return translateTextWithOpenAI(text);
  }
}

async function translateTextWithOpenAI(text: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key not configured');
    return text;
  }

  try {
    console.log('Translating with OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a translator specializing in Islamic texts. Translate hadiths from English to French while preserving Islamic terminology (Allah, Prophète Muhammad ﷺ, etc.). Provide only the translation without any explanations.'
          },
          {
            role: 'user',
            content: `Translate this hadith to French:\n\n${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return text;
    }

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content?.trim();

    console.log('✓ Translation successful with OpenAI');
    return translation || text;
  } catch (error) {
    console.error('OpenAI translation error:', error);
    return text;
  }
}

async function translateToFrench(
  hadiths: TranslatedHadith[]
): Promise<TranslatedHadith[]> {
  const translated = await Promise.all(
    hadiths.map(async (hadith) => {
      if (hadith.frenchText && hadith.frenchText !== hadith.englishText && hadith.frenchText !== '') {
        return hadith;
      }

      if (!hadith.englishText) {
        return hadith;
      }

      const cacheKey = `hadith_${hadith.reference.replace(/\s+/g, '_')}`;
      const cached = await getCachedTranslation('hadith', cacheKey, 'fr');

      if (cached) {
        console.log('Using cached translation for:', hadith.reference);
        return { ...hadith, frenchText: cached };
      }

      console.log('Translating hadith:', hadith.reference);
      const frenchText = await translateTextWithClaude(hadith.englishText);

      if (frenchText !== hadith.englishText) {
        try {
          await supabaseClient.from('translation_cache').insert({
            source_text: hadith.englishText,
            source_language: 'en',
            target_language: 'fr',
            translated_text: frenchText,
            source_type: 'hadith',
            source_id: cacheKey,
            translation_provider: 'claude',
          });
          console.log('Cached translation for:', hadith.reference);
        } catch (error) {
          console.warn('Failed to cache translation:', error);
        }
      }

      return { ...hadith, frenchText };
    })
  );

  return translated;
}

async function cacheHadiths(
  collectionId: string,
  bookNumber: number,
  hadiths: TranslatedHadith[]
): Promise<void> {
  if (hadiths.length === 0) return;

  try {
    const hadithsToInsert = hadiths.map((hadith, index) => ({
      collection_id: collectionId,
      book_number: bookNumber,
      book_title: hadith.book || `Book ${bookNumber}`,
      book_title_arabic: '',
      chapter_number: null,
      chapter_title: hadith.chapter,
      hadith_number: hadith.hadithNumber || `${bookNumber}-${index + 1}`,
      hadith_number_in_book: index + 1,
      arabic_text: hadith.arabicText,
      english_text: hadith.englishText,
      french_text: hadith.frenchText,
      reference: hadith.reference,
      url: getSunnahComUrl(collectionId, bookNumber),
    }));

    const { error } = await supabaseClient
      .from('hadiths')
      .upsert(hadithsToInsert, {
        onConflict: 'url',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error caching hadiths:', error);
    }
  } catch (error) {
    console.error('Error in cacheHadiths:', error);
  }
}

export async function getBookHadiths(
  collectionId: string,
  bookNumber: number
): Promise<TranslatedHadith[]> {
  console.log(`[getBookHadiths] Fetching hadiths for ${collectionId}, book ${bookNumber}`);

  try {
    console.log('Strategy 1: Checking database cache...');
    const cachedHadiths = await fetchFromDatabase(collectionId, bookNumber);
    console.log(`Found ${cachedHadiths.length} cached hadiths`);
    return cachedHadiths;
  } catch (dbError) {
    console.log('Database cache miss, trying other sources...');
  }

  let hadiths: TranslatedHadith[] = [];
  let lastError: Error | null = null;

  if (SUNNAH_API_KEY) {
    try {
      console.log('Strategy 2: Trying Sunnah.com API...');
      hadiths = await retryWithBackoff(() =>
        fetchFromSunnahAPI(collectionId, bookNumber)
      );
      console.log(`Fetched ${hadiths.length} hadiths from Sunnah API`);
    } catch (apiError) {
      console.error('Sunnah API failed:', apiError);
      lastError = apiError as Error;
    }
  }

  if (hadiths.length === 0) {
    try {
      console.log('Strategy 3: Trying edge function...');
      const url = getSunnahComUrl(collectionId, bookNumber);
      hadiths = await retryWithBackoff(() => fetchFromEdgeFunction(url));
      console.log(`Fetched ${hadiths.length} hadiths from edge function`);
    } catch (edgeError) {
      console.error('Edge function failed:', edgeError);
      lastError = edgeError as Error;
    }
  }

  if (hadiths.length === 0) {
    const errorMessage = lastError
      ? `Impossible de charger les hadiths: ${lastError.message}`
      : 'Aucun hadith trouvé pour ce livre';
    throw new Error(errorMessage);
  }

  try {
    console.log('Translating hadiths to French...');
    hadiths = await translateToFrench(hadiths);
  } catch (translateError) {
    console.warn('Translation failed, using English text:', translateError);
  }

  await cacheHadiths(collectionId, bookNumber, hadiths);

  return hadiths;
}

export async function getCachedTranslation(
  sourceType: string,
  sourceId: string,
  targetLanguage: string = 'fr'
): Promise<string | null> {
  try {
    const { data, error } = await supabaseClient
      .from('translation_cache')
      .select('translated_text')
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .eq('target_language', targetLanguage)
      .maybeSingle();

    if (error) {
      console.error('Error fetching cached translation:', error);
      return null;
    }

    return data?.translated_text || null;
  } catch (error) {
    console.error('Error fetching cached translation:', error);
    return null;
  }
}

export function getSunnahComUrl(collectionId: string, bookNumber?: number): string {
  const baseUrl = 'https://sunnah.com';

  if (bookNumber) {
    return `${baseUrl}/${collectionId}/${bookNumber}`;
  }

  return `${baseUrl}/${collectionId}`;
}

export async function getCollectionMetadata(collectionId: string): Promise<CollectionMetadata | null> {
  try {
    console.log('[getCollectionMetadata] Checking database for:', collectionId);

    const { data, error } = await supabaseClient
      .from('hadith_collections_metadata')
      .select('*')
      .eq('collection_id', collectionId)
      .maybeSingle();

    if (error) {
      console.error('[getCollectionMetadata] Database error:', error);
    }

    if (data) {
      console.log('[getCollectionMetadata] Found in database:', data);
      return {
        collectionId: data.collection_id,
        totalBooks: data.total_books,
        totalHadiths: data.total_hadiths,
        lastSyncedAt: data.last_synced_at,
      };
    }

    console.log('[getCollectionMetadata] Not in database, checking API...');

    if (SUNNAH_API_KEY) {
      try {
        const response = await fetch(`${SUNNAH_API_BASE}/collections/${collectionId}`, {
          headers: {
            'X-API-Key': SUNNAH_API_KEY,
          },
        });

        if (response.ok) {
          const apiData = await response.json();
          console.log('[getCollectionMetadata] Found in API:', apiData);

          return {
            collectionId,
            totalBooks: apiData.data?.totalBooks || 0,
            totalHadiths: apiData.data?.totalHadith || 0,
          };
        }
      } catch (apiError) {
        console.error('[getCollectionMetadata] API error:', apiError);
      }
    }

    console.log('[getCollectionMetadata] Using default metadata');
    return {
      collectionId,
      totalBooks: 100,
      totalHadiths: 7000,
    };
  } catch (error) {
    console.error('[getCollectionMetadata] Exception:', error);
    return {
      collectionId,
      totalBooks: 100,
      totalHadiths: 7000,
    };
  }
}

export async function getCollectionBooks(collectionId: string): Promise<HadithBook[]> {
  try {
    console.log('[getCollectionBooks] Checking database for:', collectionId);

    const { data, error } = await supabaseClient
      .from('hadiths')
      .select('book_number, book_title, book_title_arabic')
      .eq('collection_id', collectionId)
      .order('book_number', { ascending: true });

    if (!error && data && data.length > 0) {
      const booksMap = new Map<number, HadithBook>();

      data.forEach((row) => {
        if (!booksMap.has(row.book_number)) {
          booksMap.set(row.book_number, {
            bookNumber: row.book_number,
            bookTitle: row.book_title,
            bookTitleArabic: row.book_title_arabic,
            hadithCount: 1,
          });
        } else {
          const book = booksMap.get(row.book_number)!;
          book.hadithCount++;
        }
      });

      const books = Array.from(booksMap.values());
      console.log(`[getCollectionBooks] Found ${books.length} books in database`);
      return books;
    }

    console.log('[getCollectionBooks] Not in database, checking API...');

    if (SUNNAH_API_KEY) {
      try {
        const response = await fetch(
          `${SUNNAH_API_BASE}/collections/${collectionId}/books`,
          {
            headers: {
              'X-API-Key': SUNNAH_API_KEY,
            },
          }
        );

        if (response.ok) {
          const apiData = await response.json();
          const apiBooks: SunnahAPIBook[] = apiData.data || [];

          console.log(`[getCollectionBooks] Found ${apiBooks.length} books in API`);

          return apiBooks.map((book) => {
            const englishName = book.book.find(b => b.lang === 'eng')?.name || `Book ${book.bookNumber}`;
            const arabicName = book.book.find(b => b.lang === 'ara')?.name;

            return {
              bookNumber: parseInt(book.bookNumber),
              bookTitle: englishName,
              bookTitleArabic: arabicName,
              hadithCount: book.numberOfHadith || 0,
            };
          });
        }
      } catch (apiError) {
        console.error('[getCollectionBooks] API error:', apiError);
      }
    }

    console.log('[getCollectionBooks] Using default book list');
    return Array.from({ length: 97 }, (_, i) => ({
      bookNumber: i + 1,
      bookTitle: `Book ${i + 1}`,
      hadithCount: 50,
    }));
  } catch (error) {
    console.error('[getCollectionBooks] Exception:', error);
    return Array.from({ length: 97 }, (_, i) => ({
      bookNumber: i + 1,
      bookTitle: `Book ${i + 1}`,
      hadithCount: 50,
    }));
  }
}
