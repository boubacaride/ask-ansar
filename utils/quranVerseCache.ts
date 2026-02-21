import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'quran_verse_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CachedSurah {
  data: any;
  timestamp: number;
}

/**
 * Get cached surah data from local AsyncStorage.
 * Returns null if not found or expired.
 * This is instant (<10ms) vs Supabase cache hits (100-400ms on mobile).
 */
export async function getLocalCachedSurah(
  surahNumber: number,
  language: string
): Promise<any | null> {
  try {
    const key = `${CACHE_PREFIX}${surahNumber}_${language}`;
    const cached = await AsyncStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const parsed: CachedSurah = JSON.parse(cached);
    const now = Date.now();

    if (now - parsed.timestamp > CACHE_EXPIRY) {
      // Expired — remove and return null
      await AsyncStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Error getting local cached surah:', error);
    return null;
  }
}

/**
 * Save surah data to local AsyncStorage cache.
 */
export async function setLocalCachedSurah(
  surahNumber: number,
  language: string,
  data: any
): Promise<void> {
  try {
    const key = `${CACHE_PREFIX}${surahNumber}_${language}`;
    const cached: CachedSurah = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.error('Error setting local cached surah:', error);
  }
}

/**
 * Clear all local Quran verse caches.
 */
export async function clearLocalQuranCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const quranKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (quranKeys.length > 0) {
      await AsyncStorage.multiRemove(quranKeys);
    }
  } catch (error) {
    console.error('Error clearing local quran cache:', error);
  }
}

/**
 * Prefetch a surah into local cache if not already cached.
 * Returns true if the surah was fetched and cached, false if already cached.
 */
export async function isSurahLocallyCached(
  surahNumber: number,
  language: string
): Promise<boolean> {
  try {
    const key = `${CACHE_PREFIX}${surahNumber}_${language}`;
    const cached = await AsyncStorage.getItem(key);

    if (!cached) return false;

    const parsed: CachedSurah = JSON.parse(cached);
    const now = Date.now();

    return now - parsed.timestamp <= CACHE_EXPIRY;
  } catch {
    return false;
  }
}
