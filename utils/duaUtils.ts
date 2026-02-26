import { supabase as supabaseClient } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dua, getFallbackDuas } from './duaFallbacks';

export type { Dua } from './duaFallbacks';

const DUA_CACHE_PREFIX = 'dua_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Cache helpers ────────────────────────────────────────────────

async function getCachedDuas(category: string): Promise<Dua[] | null> {
  try {
    const key = `${DUA_CACHE_PREFIX}${category}`;
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Error getting cached duas:', error);
    return null;
  }
}

async function setCachedDuas(category: string, data: Dua[]): Promise<void> {
  try {
    const key = `${DUA_CACHE_PREFIX}${category}`;
    await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.error('Error setting cached duas:', error);
  }
}

// ── Main fetch function ──────────────────────────────────────────

export async function fetchDuasByCategory(
  category: string,
  limit: number = 20,
  offset: number = 0
): Promise<Dua[]> {
  console.log(`Fetching duas for category: ${category} (limit: ${limit}, offset: ${offset})`);

  // 1. Check AsyncStorage cache
  try {
    const cached = await getCachedDuas(category);
    if (cached && cached.length > 0) {
      console.log(`\u2713 Found ${cached.length} cached duas in AsyncStorage`);
      return cached.slice(offset, offset + limit);
    }
  } catch (error) {
    console.warn('AsyncStorage cache check failed:', error);
  }

  // 2. Fetch from Supabase
  try {
    const { data, error } = await supabaseClient
      .from('duas')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (!error && data && data.length > 0) {
      console.log(`\u2713 Found ${data.length} duas in Supabase`);
      const duas: Dua[] = data.map((row) => ({
        id: row.id,
        category: row.category,
        title: row.title || '',
        arabicText: row.arabic_text,
        englishText: row.english_text || '',
        frenchText: row.french_text || row.english_text || '',
        transliteration: row.transliteration || '',
        reference: row.reference || '',
        repetitions: row.repetitions || 1,
      }));

      if (offset === 0) {
        setCachedDuas(category, duas).catch(console.warn);
      }

      return duas;
    }
  } catch (error) {
    console.warn('Supabase duas query failed:', error);
  }

  // 3. Static fallback
  console.log('Using fallback static duas');
  const fallbackDuas = getFallbackDuas(category);

  if (fallbackDuas.length > 0) {
    console.log(`\u2713 Loaded ${fallbackDuas.length} fallback duas`);
    if (offset === 0) {
      setCachedDuas(category, fallbackDuas).catch(console.warn);
    }
    return fallbackDuas.slice(offset, offset + limit);
  }

  console.log('No duas available for this category');
  return [];
}

// ── Category definitions ─────────────────────────────────────────

export interface DuaCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  iconFamily: 'MaterialCommunityIcons' | 'FontAwesome5' | 'Ionicons';
}

export const DUA_CATEGORIES: DuaCategory[] = [
  { id: 'morning', label: 'Adhkar du Matin', icon: 'weather-sunny', color: '#FF9800', iconFamily: 'MaterialCommunityIcons' },
  { id: 'evening', label: 'Adhkar du Soir', icon: 'weather-night', color: '#5C6BC0', iconFamily: 'MaterialCommunityIcons' },
  { id: 'after_salah', label: 'Apr\u00e8s la Salat', icon: 'mosque', color: '#4CAF50', iconFamily: 'MaterialCommunityIcons' },
  { id: 'sleep', label: 'Avant de Dormir', icon: 'bed-empty', color: '#7E57C2', iconFamily: 'MaterialCommunityIcons' },
  { id: 'travel', label: 'Voyage', icon: 'airplane', color: '#00ACC1', iconFamily: 'MaterialCommunityIcons' },
  { id: 'food', label: 'Nourriture', icon: 'food-apple', color: '#8D6E63', iconFamily: 'MaterialCommunityIcons' },
  { id: 'protection', label: 'Protection', icon: 'shield-check', color: '#E53935', iconFamily: 'MaterialCommunityIcons' },
  { id: 'forgiveness', label: 'Pardon (Istighfar)', icon: 'hand-heart', color: '#EC407A', iconFamily: 'MaterialCommunityIcons' },
  { id: 'daily', label: 'Quotidiennes', icon: 'calendar-today', color: '#26A69A', iconFamily: 'MaterialCommunityIcons' },
  { id: 'quran', label: 'Du Coran', icon: 'book-open-variant', color: '#1565C0', iconFamily: 'MaterialCommunityIcons' },
  { id: 'rabbana', label: 'Rabbana (Notre Seigneur)', icon: 'hands-pray', color: '#6A1B9A', iconFamily: 'MaterialCommunityIcons' },
  { id: 'misc', label: "Autres Dou'as", icon: 'dots-horizontal', color: '#757575', iconFamily: 'MaterialCommunityIcons' },
];
