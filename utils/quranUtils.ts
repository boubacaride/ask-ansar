import { supabase } from './supabase';

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

async function getCachedSurah(surahNumber: number, language: string): Promise<string | null> {
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
      console.log(`Cache expired for ${cacheKey}`);
      return null;
    }

    return data.translated_text;
  } catch (err) {
    console.error('Error in getCachedSurah:', err);
    return null;
  }
}

async function cacheSurah(surahNumber: number, language: string, data: string): Promise<void> {
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
    console.error('Error in cacheSurah:', err);
  }
}

async function fetchSurahFromAPI(surahNumber: number, edition: string): Promise<any> {
  const url = `${QURAN_API_BASE}/surah/${surahNumber}/${edition}`;
  console.log(`Fetching surah ${surahNumber} with edition ${edition}`);

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

export async function getSurahVerses(
  surahNumber: number,
  includeEnglish: boolean = true,
  includeFrench: boolean = true
): Promise<SurahData> {
  try {
    const cachedArabic = await getCachedSurah(surahNumber, 'arabic');
    let arabicData;

    if (cachedArabic) {
      console.log(`Using cached Arabic data for surah ${surahNumber}`);
      arabicData = JSON.parse(cachedArabic);
    } else {
      console.log(`Fetching Arabic data for surah ${surahNumber}`);
      arabicData = await fetchSurahFromAPI(surahNumber, ARABIC_EDITION);
      await cacheSurah(surahNumber, 'arabic', JSON.stringify(arabicData));
    }

    const verses: QuranVerse[] = arabicData.ayahs.map((ayah: any) => ({
      number: ayah.number,
      numberInSurah: ayah.numberInSurah,
      text: ayah.text,
    }));

    if (includeEnglish) {
      const cachedEnglish = await getCachedSurah(surahNumber, 'english');
      let englishData;

      if (cachedEnglish) {
        console.log(`Using cached English data for surah ${surahNumber}`);
        englishData = JSON.parse(cachedEnglish);
      } else {
        console.log(`Fetching English data for surah ${surahNumber}`);
        englishData = await fetchSurahFromAPI(surahNumber, ENGLISH_EDITION);
        await cacheSurah(surahNumber, 'english', JSON.stringify(englishData));
      }

      englishData.ayahs.forEach((ayah: any, index: number) => {
        if (verses[index]) {
          verses[index].englishText = ayah.text;
        }
      });
    }

    if (includeFrench) {
      const cachedFrench = await getCachedSurah(surahNumber, 'french');
      let frenchData;

      if (cachedFrench) {
        console.log(`Using cached French data for surah ${surahNumber}`);
        frenchData = JSON.parse(cachedFrench);
      } else {
        console.log(`Fetching French data for surah ${surahNumber}`);
        frenchData = await fetchSurahFromAPI(surahNumber, FRENCH_EDITION);
        await cacheSurah(surahNumber, 'french', JSON.stringify(frenchData));
      }

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
