import { supabase as supabaseClient } from './supabase';
import { getCachedHadiths, setCachedHadiths } from './hadithCache';
import { getFallbackHadiths } from './fallbackHadiths';

export interface CategoryHadith {
  hadithNumber: string;
  arabicText: string;
  englishText: string;
  frenchText: string;
  reference: string;
  collectionName: string;
  collectionId: string;
}

const SUNNAH_API_BASE = 'https://api.sunnah.com/v1';
const SUNNAH_API_KEY = process.env.EXPO_PUBLIC_SUNNAH_API_KEY;

const CATEGORY_SEARCH_TERMS: Record<string, string[]> = {
  faith: ['faith', 'belief', 'iman', 'testimony'],
  prayer: ['prayer', 'salat', 'salah', 'worship'],
  fasting: ['fasting', 'sawm', 'ramadan'],
  zakat: ['zakat', 'charity', 'alms'],
  hajj: ['hajj', 'pilgrimage', 'umrah'],
  manners: ['manners', 'adab', 'behavior', 'conduct'],
  family: ['family', 'marriage', 'parents', 'children'],
  business: ['business', 'trade', 'transactions', 'dealings'],
};

const COLLECTIONS = [
  { id: 'bukhari', name: 'Sahih al-Bukhari' },
  { id: 'muslim', name: 'Sahih Muslim' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi' },
  { id: 'abudawud', name: 'Sunan Abu Dawud' },
];

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

async function getCachedTranslation(
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

async function fetchRandomHadithsFromSunnah(
  categoryId: string,
  limit: number = 10
): Promise<CategoryHadith[]> {
  const searchTerms = CATEGORY_SEARCH_TERMS[categoryId] || [categoryId];
  const hadiths: CategoryHadith[] = [];

  for (const collection of COLLECTIONS) {
    try {
      const response = await fetch(`${SUNNAH_API_BASE}/hadiths/random`, {
        method: 'GET',
        headers: SUNNAH_API_KEY ? {
          'X-API-Key': SUNNAH_API_KEY,
        } : {},
      });

      if (response.ok) {
        const data = await response.json();
        const hadith = data.hadith;

        if (hadith && hadith.hadithEnglish) {
          const englishText = hadith.hadithEnglish.toLowerCase();
          const matchesTerm = searchTerms.some(term =>
            englishText.includes(term.toLowerCase())
          );

          if (matchesTerm) {
            hadiths.push({
              hadithNumber: hadith.hadithNumber || '',
              arabicText: hadith.hadithArabic || '',
              englishText: hadith.hadithEnglish || '',
              frenchText: '',
              reference: `${collection.name} ${hadith.hadithNumber || ''}`,
              collectionName: collection.name,
              collectionId: collection.id,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching from ${collection.id}:`, error);
    }

    if (hadiths.length >= limit) break;
  }

  return hadiths;
}

async function translateHadith(hadith: CategoryHadith): Promise<CategoryHadith> {
  if (hadith.frenchText && hadith.frenchText !== hadith.englishText) {
    return hadith;
  }

  if (!hadith.englishText) {
    return hadith;
  }

  const cacheKey = `category_hadith_${hadith.reference.replace(/\s+/g, '_')}`;
  const cached = await getCachedTranslation('hadith', cacheKey, 'fr');

  if (cached) {
    console.log('Using cached translation');
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
      console.log('Cached translation');
    } catch (error) {
      console.warn('Failed to cache translation:', error);
    }
  }

  return { ...hadith, frenchText };
}

export async function fetchHadithsByCategory(
  categoryId: string,
  limit: number = 10,
  offset: number = 0
): Promise<CategoryHadith[]> {
  console.log(`Fetching hadiths for category: ${categoryId} (limit: ${limit}, offset: ${offset})`);

  try {
    const cached = await getCachedHadiths(categoryId);
    if (cached && cached.length > 0) {
      console.log(`✓ Found ${cached.length} cached hadiths in AsyncStorage`);
      return cached.slice(offset, offset + limit);
    }
  } catch (error) {
    console.warn('AsyncStorage cache check failed:', error);
  }

  try {
    const { data, error } = await supabaseClient
      .from('hadiths')
      .select('*')
      .range(offset, offset + limit - 1);

    if (!error && data && data.length > 0) {
      const searchTerms = CATEGORY_SEARCH_TERMS[categoryId] || [categoryId];
      const filtered = data.filter((row) => {
        const text = (row.english_text || '').toLowerCase();
        return searchTerms.some(term => text.includes(term.toLowerCase()));
      });

      if (filtered.length > 0) {
        console.log(`✓ Found ${filtered.length} hadiths in Supabase database`);
        const hadiths = filtered.map((row) => ({
          hadithNumber: row.hadith_number,
          arabicText: row.arabic_text,
          englishText: row.english_text,
          frenchText: row.french_text || row.english_text,
          reference: row.reference,
          collectionName: row.book_title,
          collectionId: row.collection_id,
        }));

        if (offset === 0) {
          setCachedHadiths(categoryId, hadiths).catch(console.warn);
        }

        return hadiths;
      }
    }
  } catch (error) {
    console.warn('Supabase database query failed:', error);
  }

  console.log('Using fallback static hadiths');
  const fallbackHadiths = getFallbackHadiths(categoryId);

  if (fallbackHadiths.length > 0) {
    console.log(`✓ Loaded ${fallbackHadiths.length} fallback hadiths`);
    if (offset === 0) {
      setCachedHadiths(categoryId, fallbackHadiths).catch(console.warn);
    }
    return fallbackHadiths.slice(offset, offset + limit);
  }

  console.log('No hadiths available for this category');
  return [];
}
