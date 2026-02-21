import { supabase } from './supabase';
import { getLocalCachedSurah, setLocalCachedSurah } from './quranVerseCache';

export interface QuranVerse {
  number: number;
  numberInSurah: number;
  text: string;
  englishText?: string;
  frenchText?: string;
}

export interface SurahData {
  number: number;
  name: string;
  arabicName: string;
  englishName: string;
  numberOfVerses: number;
  revelationType: string;
  verses: QuranVerse[];
}

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
const ARABIC_EDITION = 'quran-uthmani';
const ENGLISH_EDITION = 'en.asad';
const FRENCH_EDITION = 'fr.hamidullah';

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// ─── Supabase (remote) cache ────────────────────────────────────────

async function getRemoteCachedSurah(surahNumber: number, language: string): Promise<string | null> {
  try {
    const cacheKey = `surah_${surahNumber}_${language}`;

    const { data, error } = await supabase
      .from('translation_cache')
      .select('translated_text, created_at')
      .eq('original_text', cacheKey)
      .maybeSingle();

    if (error) {
      console.error('Error fetching cached surah:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const cacheAge = Date.now() - new Date(data.created_at).getTime();
    if (cacheAge > CACHE_DURATION_MS) {
      return null;
    }

    return data.translated_text;
  } catch (err) {
    console.error('Error in getRemoteCachedSurah:', err);
    return null;
  }
}

async function setRemoteCachedSurah(surahNumber: number, language: string, data: string): Promise<void> {
  try {
    const cacheKey = `surah_${surahNumber}_${language}`;

    const { error } = await supabase
      .from('translation_cache')
      .upsert(
        {
          original_text: cacheKey,
          translated_text: data,
          source_language: 'ar',
          target_language: language,
        },
        {
          onConflict: 'original_text,source_language,target_language',
        }
      );

    if (error) {
      console.error('Error caching surah:', error);
    }
  } catch (err) {
    console.error('Error in setRemoteCachedSurah:', err);
  }
}

// ─── Two-tier cache: Local (instant) → Supabase (remote) → API ─────

async function fetchSurahFromAPI(surahNumber: number, edition: string): Promise<any> {
  const url = `${QURAN_API_BASE}/surah/${surahNumber}/${edition}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.code !== 200 || !result.data) {
    throw new Error('Invalid API response');
  }

  return result.data;
}

/**
 * Get surah data with two-tier caching:
 * 1. Local AsyncStorage (instant, <10ms)
 * 2. Supabase remote cache (100-400ms on mobile)
 * 3. API fetch (cold start)
 *
 * After fetching from remote or API, promotes to local cache.
 */
async function getSurahDataWithCache(
  surahNumber: number,
  language: string,
  edition: string
): Promise<any> {
  // Tier 1: Local cache (instant)
  const localCached = await getLocalCachedSurah(surahNumber, language);
  if (localCached) {
    return localCached;
  }

  // Tier 2: Remote Supabase cache
  const remoteCached = await getRemoteCachedSurah(surahNumber, language);
  if (remoteCached) {
    const parsed = JSON.parse(remoteCached);
    // Promote to local cache for next time
    setLocalCachedSurah(surahNumber, language, parsed).catch(console.error);
    return parsed;
  }

  // Tier 3: API fetch
  const data = await fetchSurahFromAPI(surahNumber, edition);

  // Save to both caches (fire-and-forget)
  setLocalCachedSurah(surahNumber, language, data).catch(console.error);
  setRemoteCachedSurah(surahNumber, language, JSON.stringify(data)).catch(console.error);

  return data;
}

// ─── Main entry point ───────────────────────────────────────────────

export async function getSurahVerses(
  surahNumber: number,
  includeEnglish: boolean = true,
  includeFrench: boolean = true
): Promise<SurahData> {
  try {
    // Fetch all editions in parallel (3x faster than sequential)
    const fetchPromises: Promise<any>[] = [
      getSurahDataWithCache(surahNumber, 'arabic', ARABIC_EDITION),
    ];

    if (includeEnglish) {
      fetchPromises.push(getSurahDataWithCache(surahNumber, 'english', ENGLISH_EDITION));
    }

    if (includeFrench) {
      fetchPromises.push(getSurahDataWithCache(surahNumber, 'french', FRENCH_EDITION));
    }

    const results = await Promise.all(fetchPromises);

    const arabicData = results[0];
    let resultIndex = 1;

    // Build base verses from Arabic
    const verses: QuranVerse[] = arabicData.ayahs.map((ayah: any) => ({
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      text: ayah.text,
    }));

    // Merge English translations
    if (includeEnglish) {
      const englishData = results[resultIndex++];
      englishData.ayahs.forEach((ayah: any, index: number) => {
        if (verses[index]) {
          verses[index].englishText = ayah.text;
        }
      });
    }

    // Merge French translations
    if (includeFrench) {
      const frenchData = results[resultIndex++];
      frenchData.ayahs.forEach((ayah: any, index: number) => {
        if (verses[index]) {
          verses[index].frenchText = ayah.text;
        }
      });
    }

    return {
      number: arabicData.number,
      name: arabicData.name,
      arabicName: arabicData.name,
      englishName: arabicData.englishName,
      numberOfVerses: arabicData.numberOfAyahs,
      revelationType: arabicData.revelationType,
      verses,
    };
  } catch (error) {
    console.error('Error fetching surah verses:', error);
    throw error;
  }
}
