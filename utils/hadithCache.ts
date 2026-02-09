import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'hadith_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export interface CachedHadith {
  data: any;
  timestamp: number;
}

export async function getCachedHadiths(categoryId: string): Promise<any[] | null> {
  try {
    const key = `${CACHE_PREFIX}${categoryId}`;
    const cached = await AsyncStorage.getItem(key);

    if (!cached) {
      return null;
    }

    const parsed: CachedHadith = JSON.parse(cached);
    const now = Date.now();

    if (now - parsed.timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Error getting cached hadiths:', error);
    return null;
  }
}

export async function setCachedHadiths(categoryId: string, data: any[]): Promise<void> {
  try {
    const key = `${CACHE_PREFIX}${categoryId}`;
    const cached: CachedHadith = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    console.error('Error setting cached hadiths:', error);
  }
}

export async function clearHadithCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const hadithKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(hadithKeys);
  } catch (error) {
    console.error('Error clearing hadith cache:', error);
  }
}
