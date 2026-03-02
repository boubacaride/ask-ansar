import { supabase as supabaseClient } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dua, getFallbackDuas } from './duaFallbacks';

export type { Dua } from './duaFallbacks';

const DUA_CACHE_PREFIX = 'dua_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const DUA_CACHE_VERSION = 7; // Bump to invalidate old caches after adding verseRefs for quran.com audio

// ── Cache helpers ────────────────────────────────────────────────

async function getCachedDuas(category: string): Promise<Dua[] | null> {
  try {
    const key = `${DUA_CACHE_PREFIX}${category}`;
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    // Invalidate old caches (wrong version or expired)
    if (parsed.version !== DUA_CACHE_VERSION || Date.now() - parsed.timestamp > CACHE_EXPIRY) {
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
    await AsyncStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), version: DUA_CACHE_VERSION }));
  } catch (error) {
    console.error('Error setting cached duas:', error);
  }
}

/**
 * Clears all cached dua data from AsyncStorage.
 * Useful when data needs to be refreshed after an update.
 */
export async function clearAllDuaCaches(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const duaCacheKeys = keys.filter(k => k.startsWith(DUA_CACHE_PREFIX));
    if (duaCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(duaCacheKeys);
      console.log(`Cleared ${duaCacheKeys.length} dua cache entries`);
    }
  } catch (error) {
    console.error('Error clearing dua caches:', error);
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
  { id: 'waking_up', label: 'Au R\u00e9veil', icon: 'alarm', color: '#FFB74D', iconFamily: 'MaterialCommunityIcons' },
  { id: 'wudu', label: 'Ablutions (Wudu)', icon: 'water', color: '#29B6F6', iconFamily: 'MaterialCommunityIcons' },
  { id: 'masjid', label: 'Entr\u00e9e/Sortie Mosqu\u00e9e', icon: 'mosque', color: '#66BB6A', iconFamily: 'MaterialCommunityIcons' },
  { id: 'sickness', label: 'Maladie & Gu\u00e9rison', icon: 'hospital-box', color: '#EF5350', iconFamily: 'MaterialCommunityIcons' },
  { id: 'hajj_umrah', label: 'Hajj & Omra', icon: 'star-crescent', color: '#c9a227', iconFamily: 'MaterialCommunityIcons' },
  { id: 'marriage', label: 'Mariage', icon: 'heart-multiple', color: '#F06292', iconFamily: 'MaterialCommunityIcons' },
  { id: 'weather', label: 'Pluie & Orage', icon: 'weather-lightning-rainy', color: '#78909C', iconFamily: 'MaterialCommunityIcons' },
  { id: 'anxiety', label: 'Angoisse & Tristesse', icon: 'heart-pulse', color: '#EC407A', iconFamily: 'MaterialCommunityIcons' },
  { id: 'parents', label: 'Parents & Famille', icon: 'account-group', color: '#FF7043', iconFamily: 'MaterialCommunityIcons' },
  { id: 'death', label: 'D\u00e9c\u00e8s & Fun\u00e9railles', icon: 'flower-tulip', color: '#8D6E63', iconFamily: 'MaterialCommunityIcons' },
  { id: 'toilet', label: 'Entr\u00e9e/Sortie Toilettes', icon: 'door', color: '#90A4AE', iconFamily: 'MaterialCommunityIcons' },
  { id: 'ruqyah', label: 'Roqya', icon: 'leaf', color: '#00897B', iconFamily: 'MaterialCommunityIcons' },
  { id: 'misc', label: "Autres Dou'as", icon: 'dots-horizontal', color: '#757575', iconFamily: 'MaterialCommunityIcons' },
];

export interface CategoryDescription {
  title: string;
  sections: { heading?: string; body: string }[];
}

export const CATEGORY_DESCRIPTIONS: Record<string, CategoryDescription> = {
  ruqyah: {
    title: 'Roqya',
    sections: [
      {
        body: "'Ruqyah' is the practice of treating illnesses through Qur'\u0101nic \u0101y\u0101t and invocations as prescribed by the Messenger of Allah \uFDFA. It provides a cure for evil eye, magic and physical ailments.\n\nThe Qur'\u0101n offers perfect solace to a believer - both spiritually and physically. Ruqyah should therefore play an essential role in our lives.\n\nAllah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647 says: \"And say: The truth has come, and falsehood has vanished. Surely falsehood is ever bound to vanish by its very nature. And We send down in the Qur'\u0101n that which is a cure and a mercy for the believers.\" (17:81-2)\n\nAs well providing a cure, Ruqyah is an excellent way for the believers to build their Im\u0101n and reaffirm their tawh\u012Bd for Allah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647. Indeed seeking treatment through the Qur'\u0101n demonstrates complete belief in the Book of Allah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647.\n\nThe Messenger of Allah \uFDFA said: \"Make good use of the two cures: honey and the Qur'\u0101n.\" (Ibn M\u0101jah)\n\n'\u0100'ishah r.a said: \"When the Messenger of Allah \uFDFA was ill, Jibr\u012Bl (\u0639\u0644\u064A\u0647 \u0627\u0644\u0633\u0644\u0627\u0645) performed Ruqyah on him.\" (Muslim)\n\nIn another hadith, '\u0100'ishah r.a informs us that the Messenger of Allah \uFDFA entered upon her and found a woman treating her with Ruqyah (through other than the words of Allah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647). He \uFDFA said: \"Treat her with the book of Allah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647.\" (Ibn Hibb\u0101n)\n\nShe also said: \"The Messenger of Allah \uFDFA used to command me to perform Ruqyah from the evil eye.\" (Muslim)\n\nOnce the Messenger of Allah \uFDFA saw a girl whose face had changed colour in the house of Umm Salamah r.a, so he \uFDFA said: \"Seek Ruqyah for her, because she has been affected by the evil eye.\" (Bukh\u0101r\u012B)\n\n'\u0100'ishah r.a narrated that whenever the Messenger of Allah \uFDFA would become sick, he would recite [the last 3 S\u016Brahs of the Qur'\u0101n] and then blow over his body. She says: \"During his last illness from which he passed away, the Messenger of Allah \uFDFA used to blow over himself. But when his sickness intensified, I used to (recite and then) blow over him using his own hands because of their blessings.\" (Bukh\u0101r\u012B)\n\nIn another had\u012Bth, she r.a mentions that whenever anyone from his family would become ill, he \uFDFA would blow over them with these three S\u016Brahs. (Muslim)\n\n\"The Qur'\u0101n is the complete healing for all mental, spiritual and physical diseases; all the diseases of this world and the Hereafter. But not everyone is guided to use it for the purpose of healing. If the sick person uses the Qur'\u0101n for healing in the proper way, and applies it to his disease with sincerity, faith, complete acceptance and firm conviction, fulfilling all its conditions, then no disease can resist it.\" (Ibn al-Qayyim)",
      },
      {
        heading: 'Conditions for Ruqyah to be successful',
        body: "Before Ruqyah:\n\u2022 Intention: Ruqyah is a du'\u0101. The intention should always be to ask Allah to remove the evil by the words of the Qur'\u0101n.\n\u2022 Make wudh\u016B, offer two rak'ats and make sincere du'\u0101'.\n\u2022 Du'\u0101', especially in tahajjud, brings great reprieve and assistance from Allah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647.\n\u2022 Make abundant and sincere istighf\u0101r (seeking forgiveness from Allah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647), and stay away from sins.\n\u2022 One should restore people's rights if they have wronged anyone or taken anything unjustly.\n\u2022 Give sadaqah as it wards off calamity (Bayhaq\u012B). The Messenger of Allah \uFDFA said: \"Treat your sick by giving Sadaqah.\" (Bayhaq\u012B)\n\u2022 Remove animate pictures from the home. Any amulets (ta'w\u012Bdh) which contain illegible text or invokes upon other than Allah should also be taken out and disposed of in a river.\n\u2022 Remain in a state of wudh\u016B through the day and also sleep with wudh\u016B.\n\nDuring Ruqyah:\n\u2022 Begin Ruqyah by sending Salaw\u0101t (salutations) upon the Prophet \uFDFA.\n\u2022 Recite the Ruqyah loudly, clearly and with concentration, at least 3 or 7 times.\n\u2022 One may recite directly into the hands, blowing into them and rubbing them over the body.\n\u2022 One can also recite whilst placing the hands over the part of the body that is in pain.\n\u2022 One may recite and blow on water. Keep the mouth close to the water, breathe into it and repeatedly blow over it. This can be used for drinking and bathing.\n\u2022 Olive oil and other Sunnah medicines can be recited upon and applied to the body.\n\u2022 When reciting on others, place the hand on the forehead of the affected person (mahram only), or on the part of the body in pain, recite and blow.\n\u2022 If one cannot recite, then Ruqyah can be listened to. This should be done with full concentration. One should listen carefully and ensure that they do not fall asleep.",
      },
      {
        heading: 'Evil Eye (\u0627\u0644\u0639\u064A\u0646)',
        body: "Evil eye comes from a resentful and malevolent envy that is manifested by casting a gaze, stare or look that is envious and ill-wishing. An envier causes harm or misfortune to an unsuspecting person through his eyes, without needing his hands or tongue. The intensity of the effect differs according to the weakness of the victim and the power of the envier's jealousy, hatred and anger.\n\nThe Messenger of Allah \uFDFA said: \"The evil eye is true. If anything could outdo the decree, it would be the evil eye.\" (Muslim)\n\nHe \uFDFA also said: \"The evil eye is true. It can cause a mountain to collapse.\" (Ahmad)\n\nAnd he \uFDFA said: \"Most of those who die amongst my Ummah do so - after the will and decree of Allah \u062C\u0644 \u062C\u0644\u0627\u0644\u0647 - because of the evil eye.\" (Bazz\u0101r)",
      },
    ],
  },
};
