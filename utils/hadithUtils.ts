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
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const FETCH_TIMEOUT_MS = 20000; // 20 second timeout for all network requests

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Fetch with a timeout using AbortController */
async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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

  const response = await fetchWithTimeout(endpoint, {
    headers: {
      'X-API-Key': SUNNAH_API_KEY,
    },
  }, 15000);

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

  const response = await fetchWithTimeout(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  }, 25000);

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

// Sunnah.com URL slug → CDN API collection ID mapping
// Available CDN collections: abudawud, bukhari, dehlawi, ibnmajah, malik, muslim, nasai, nawawi, qudsi, tirmidhi
const CDN_COLLECTION_MAP: Record<string, string> = {
  bukhari: 'bukhari',
  muslim: 'muslim',
  tirmidhi: 'tirmidhi',
  abudawud: 'abudawud',
  nasai: 'nasai',
  ibnmajah: 'ibnmajah',
  malik: 'malik',
  nawawi40: 'nawawi',
  qudsi40: 'qudsi',
  dehlawi: 'dehlawi',
};

// Collections NOT available on fawazahmed0 CDN (must use alt CDN, sunnah.com API, or scraper)
const CDN_UNAVAILABLE = new Set(['riyadussalihin', 'adab', 'shamail', 'bulugh', 'mishkat']);

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

// AhmedBaset/hadith-json CDN — covers collections missing from fawazahmed0
// Uses per-chapter endpoints (~50KB each) instead of full collection (~2MB)
const ALT_CDN_CHAPTER_BASE = 'https://cdn.jsdelivr.net/gh/AhmedBaset/hadith-json@main/db/by_chapter';
const ALT_CDN_COLLECTION_MAP: Record<string, string> = {
  riyadussalihin: 'other_books/riyad_assalihin',
  adab: 'other_books/adab',
  shamail: 'other_books/shamail',
  bulugh: 'other_books/bulugh',
  mishkat: 'other_books/mishkat',
};

// Hardcoded chapter metadata for known collections (avoids downloading full 2MB file for book list)
const ALT_CDN_CHAPTERS: Record<string, { english: string; arabic: string; count: number; urlSlug: string }[]> = {
  riyadussalihin: [
    { english: 'The Book of Miscellany', arabic: 'كتاب المقدمات', count: 679, urlSlug: 'introduction' },
    { english: 'The Book of Good Manners', arabic: 'كتاب الأدب', count: 47, urlSlug: '1' },
    { english: 'The Book About the Etiquette of Eating', arabic: 'كتاب أدب الطعام', count: 51, urlSlug: '2' },
    { english: 'The Book of Dress', arabic: 'كتاب اللباس', count: 35, urlSlug: '3' },
    { english: 'The Book of the Etiquette of Sleeping, Lying and Sitting', arabic: 'كتاب آداب النوم والاضطجاع والجلوس', count: 31, urlSlug: '4' },
    { english: 'The Book of Greetings', arabic: 'كتاب السلام', count: 50, urlSlug: '5' },
    { english: 'The Book of Visiting the Sick', arabic: 'كتاب عيادة المريض', count: 62, urlSlug: '6' },
    { english: 'The Book of Etiquette of Traveling', arabic: 'كتاب آداب السفر', count: 35, urlSlug: '7' },
    { english: 'The Book of Virtues', arabic: 'كتاب الفضائل', count: 277, urlSlug: '8' },
    { english: "The Book of I'tikaf", arabic: 'كتاب الاعتكاف', count: 3, urlSlug: '9' },
    { english: 'The Book of Hajj', arabic: 'كتاب الحج', count: 14, urlSlug: '10' },
    { english: 'The Book of Jihad', arabic: 'كتاب الجهاد', count: 91, urlSlug: '11' },
    { english: 'The Book of Knowledge', arabic: 'كتاب العلم', count: 17, urlSlug: '12' },
    { english: 'The Book of Praise and Gratitude to Allah', arabic: 'كتاب الحمد لله والشكر', count: 4, urlSlug: '13' },
    { english: "The Book of Supplicating Allah to Exalt the Mention of Allah's Messenger", arabic: 'كتاب الصلاة على رسول الله ﷺ', count: 11, urlSlug: '14' },
    { english: 'The Book of the Remembrance of Allah', arabic: 'كتاب الأذكار', count: 57, urlSlug: '15' },
    { english: "The Book of Du'a (Supplications)", arabic: 'كتاب الدعوات', count: 46, urlSlug: '16' },
    { english: 'The Book of the Prohibited Actions', arabic: 'كتاب الأمور المنهي عنها', count: 297, urlSlug: '17' },
    { english: 'The Book of Miscellaneous Ahadith of Significant Values', arabic: 'كتاب المنثورات والملح', count: 61, urlSlug: '18' },
    { english: 'The Book of Forgiveness', arabic: 'كتاب الاستغفار', count: 28, urlSlug: '19' },
  ],
};

// Hardcoded book/section metadata for CDN collections (instant, no network required)
// Data sourced from fawazahmed0/hadith-api. Section 0 is excluded when empty/unnamed.
const CDN_COLLECTION_BOOKS: Record<string, { bookNumber: number; bookTitle: string; hadithCount: number }[]> = {
  bukhari: [
    { bookNumber: 1, bookTitle: 'Revelation', hadithCount: 7 },
    { bookNumber: 2, bookTitle: 'Belief', hadithCount: 51 },
    { bookNumber: 3, bookTitle: 'Knowledge', hadithCount: 76 },
    { bookNumber: 4, bookTitle: "Ablutions (Wudu')", hadithCount: 113 },
    { bookNumber: 5, bookTitle: 'Bathing (Ghusl)', hadithCount: 46 },
    { bookNumber: 6, bookTitle: 'Menstrual Periods', hadithCount: 37 },
    { bookNumber: 7, bookTitle: 'Rubbing hands and feet with dust (Tayammum)', hadithCount: 15 },
    { bookNumber: 8, bookTitle: 'Prayers (Salat)', hadithCount: 167 },
    { bookNumber: 9, bookTitle: 'Times of the Prayers', hadithCount: 77 },
    { bookNumber: 10, bookTitle: 'Call to Prayers (Adhaan)', hadithCount: 266 },
    { bookNumber: 11, bookTitle: 'Friday Prayer', hadithCount: 65 },
    { bookNumber: 12, bookTitle: 'Fear Prayer', hadithCount: 6 },
    { bookNumber: 13, bookTitle: 'The Two Festivals (Eids)', hadithCount: 37 },
    { bookNumber: 14, bookTitle: 'Witr Prayer', hadithCount: 15 },
    { bookNumber: 15, bookTitle: 'Invoking Allah for Rain (Istisqaa)', hadithCount: 34 },
    { bookNumber: 16, bookTitle: 'Eclipses', hadithCount: 24 },
    { bookNumber: 17, bookTitle: "Prostration During Recital of Qur'an", hadithCount: 13 },
    { bookNumber: 18, bookTitle: 'Shortening the Prayers (At-Taqseer)', hadithCount: 39 },
    { bookNumber: 19, bookTitle: 'Prayer at Night (Tahajjud)', hadithCount: 63 },
    { bookNumber: 20, bookTitle: 'Virtues of Prayer at Masjid Makkah and Madinah', hadithCount: 9 },
    { bookNumber: 21, bookTitle: 'Actions while Praying', hadithCount: 27 },
    { bookNumber: 22, bookTitle: 'Forgetfulness in Prayer', hadithCount: 14 },
    { bookNumber: 23, bookTitle: "Funerals (Al-Janaa'iz)", hadithCount: 148 },
    { bookNumber: 24, bookTitle: 'Obligatory Charity Tax (Zakat)', hadithCount: 112 },
    { bookNumber: 25, bookTitle: 'Hajj (Pilgrimage)', hadithCount: 247 },
    { bookNumber: 26, bookTitle: '`Umrah (Minor pilgrimage)', hadithCount: 30 },
    { bookNumber: 27, bookTitle: 'Pilgrims Prevented from Completing the Pilgrimage', hadithCount: 15 },
    { bookNumber: 28, bookTitle: 'Penalty of Hunting while on Pilgrimage', hadithCount: 46 },
    { bookNumber: 29, bookTitle: 'Virtues of Madinah', hadithCount: 24 },
    { bookNumber: 30, bookTitle: 'Fasting', hadithCount: 112 },
    { bookNumber: 31, bookTitle: 'Praying at Night in Ramadaan (Taraweeh)', hadithCount: 6 },
    { bookNumber: 32, bookTitle: 'Virtues of the Night of Qadr', hadithCount: 11 },
    { bookNumber: 33, bookTitle: "Retiring to a Mosque for Remembrance of Allah (I'tikaf)", hadithCount: 21 },
    { bookNumber: 34, bookTitle: 'Sales and Trade', hadithCount: 184 },
    { bookNumber: 35, bookTitle: 'Sales in which a Price is paid for Goods to be Delivered Later (As-Salam)', hadithCount: 16 },
    { bookNumber: 36, bookTitle: "Shuf'a", hadithCount: 3 },
    { bookNumber: 37, bookTitle: 'Hiring', hadithCount: 25 },
    { bookNumber: 38, bookTitle: 'Transferance of a Debt from One Person to Another (Al-Hawaala)', hadithCount: 3 },
    { bookNumber: 39, bookTitle: 'Kafalah', hadithCount: 9 },
    { bookNumber: 40, bookTitle: 'Representation, Authorization, Business by Proxy', hadithCount: 18 },
    { bookNumber: 41, bookTitle: 'Agriculture', hadithCount: 28 },
    { bookNumber: 42, bookTitle: 'Distribution of Water', hadithCount: 31 },
    { bookNumber: 43, bookTitle: 'Loans, Payment of Loans, Freezing of Property, Bankruptcy', hadithCount: 24 },
    { bookNumber: 44, bookTitle: 'Khusoomaat', hadithCount: 15 },
    { bookNumber: 45, bookTitle: 'Lost Things Picked up by Someone (Luqatah)', hadithCount: 15 },
    { bookNumber: 46, bookTitle: 'Oppressions', hadithCount: 43 },
    { bookNumber: 47, bookTitle: 'Partnership', hadithCount: 22 },
    { bookNumber: 48, bookTitle: 'Mortgaging', hadithCount: 8 },
    { bookNumber: 49, bookTitle: 'Manumission of Slaves', hadithCount: 41 },
    { bookNumber: 50, bookTitle: 'Makaatib', hadithCount: 6 },
    { bookNumber: 51, bookTitle: 'Gifts', hadithCount: 68 },
    { bookNumber: 52, bookTitle: 'Witnesses', hadithCount: 50 },
    { bookNumber: 53, bookTitle: 'Peacemaking', hadithCount: 20 },
    { bookNumber: 54, bookTitle: 'Conditions', hadithCount: 24 },
    { bookNumber: 55, bookTitle: 'Wills and Testaments (Wasaayaa)', hadithCount: 44 },
    { bookNumber: 56, bookTitle: 'Fighting for the Cause of Allah (Jihaad)', hadithCount: 294 },
    { bookNumber: 57, bookTitle: 'One-fifth of Booty to the Cause of Allah (Khumus)', hadithCount: 63 },
    { bookNumber: 58, bookTitle: "Jizyah and Mawaada'ah", hadithCount: 30 },
    { bookNumber: 59, bookTitle: 'Beginning of Creation', hadithCount: 131 },
    { bookNumber: 60, bookTitle: 'Prophets', hadithCount: 154 },
    { bookNumber: 61, bookTitle: 'Virtues and Merits of the Prophet (pbuh) and his Companions', hadithCount: 151 },
    { bookNumber: 62, bookTitle: 'Companions of the Prophet', hadithCount: 120 },
    { bookNumber: 63, bookTitle: 'Merits of the Helpers in Madinah (Ansaar)', hadithCount: 172 },
    { bookNumber: 64, bookTitle: 'Military Expeditions led by the Prophet (pbuh) (Al-Maghaazi)', hadithCount: 488 },
    { bookNumber: 65, bookTitle: "Prophetic Commentary on the Qur'an (Tafseer of the Prophet (pbuh))", hadithCount: 499 },
    { bookNumber: 66, bookTitle: "Virtues of the Qur'an", hadithCount: 87 },
    { bookNumber: 67, bookTitle: 'Wedlock, Marriage (Nikaah)', hadithCount: 183 },
    { bookNumber: 68, bookTitle: 'Divorce', hadithCount: 95 },
    { bookNumber: 69, bookTitle: 'Supporting the Family', hadithCount: 22 },
    { bookNumber: 70, bookTitle: 'Food, Meals', hadithCount: 95 },
    { bookNumber: 71, bookTitle: 'Sacrifice on Occasion of Birth (`Aqiqa)', hadithCount: 9 },
    { bookNumber: 72, bookTitle: 'Hunting, Slaughtering', hadithCount: 69 },
    { bookNumber: 73, bookTitle: 'Al-Adha Festival Sacrifice (Adaahi)', hadithCount: 30 },
    { bookNumber: 74, bookTitle: 'Drinks', hadithCount: 65 },
    { bookNumber: 75, bookTitle: 'Patients', hadithCount: 37 },
    { bookNumber: 76, bookTitle: 'Medicine', hadithCount: 93 },
    { bookNumber: 77, bookTitle: 'Dress', hadithCount: 185 },
    { bookNumber: 78, bookTitle: 'Good Manners and Form (Al-Adab)', hadithCount: 250 },
    { bookNumber: 79, bookTitle: 'Asking Permission', hadithCount: 75 },
    { bookNumber: 80, bookTitle: 'Invocations', hadithCount: 106 },
    { bookNumber: 81, bookTitle: 'To make the Heart Tender (Ar-Riqaq)', hadithCount: 181 },
    { bookNumber: 82, bookTitle: 'Divine Will (Al-Qadar)', hadithCount: 26 },
    { bookNumber: 83, bookTitle: 'Oaths and Vows', hadithCount: 84 },
    { bookNumber: 84, bookTitle: 'Expiation for Unfulfilled Oaths', hadithCount: 15 },
    { bookNumber: 85, bookTitle: "Laws of Inheritance (Al-Faraa'id)", hadithCount: 47 },
    { bookNumber: 86, bookTitle: 'Limits and Punishments set by Allah (Hudood)', hadithCount: 81 },
    { bookNumber: 87, bookTitle: 'Blood Money (Ad-Diyat)', hadithCount: 55 },
    { bookNumber: 88, bookTitle: 'Apostates', hadithCount: 21 },
    { bookNumber: 89, bookTitle: '(Statements made under) Coercion', hadithCount: 13 },
    { bookNumber: 90, bookTitle: 'Tricks', hadithCount: 28 },
    { bookNumber: 91, bookTitle: 'Interpretation of Dreams', hadithCount: 61 },
    { bookNumber: 92, bookTitle: 'Afflictions and the End of the World', hadithCount: 83 },
    { bookNumber: 93, bookTitle: 'Judgments (Ahkaam)', hadithCount: 84 },
    { bookNumber: 94, bookTitle: 'Wishes', hadithCount: 20 },
    { bookNumber: 95, bookTitle: 'Accepting Information Given by a Truthful Person', hadithCount: 21 },
    { bookNumber: 96, bookTitle: "Holding Fast to the Qur'an and Sunnah", hadithCount: 97 },
    { bookNumber: 97, bookTitle: 'Oneness, Uniqueness of Allah (Tawheed)', hadithCount: 188 },
  ],
  muslim: [
    { bookNumber: 1, bookTitle: 'The Book of Faith', hadithCount: 436 },
    { bookNumber: 2, bookTitle: 'The Book of Purification', hadithCount: 143 },
    { bookNumber: 3, bookTitle: 'The Book of Menstruation', hadithCount: 157 },
    { bookNumber: 4, bookTitle: 'The Book of Prayers', hadithCount: 321 },
    { bookNumber: 5, bookTitle: 'The Book of Mosques and Places of Prayer', hadithCount: 396 },
    { bookNumber: 6, bookTitle: 'The Book of Prayer - Travellers', hadithCount: 377 },
    { bookNumber: 7, bookTitle: 'The Book of Prayer - Friday', hadithCount: 93 },
    { bookNumber: 8, bookTitle: 'The Book of Prayer - Two Eids', hadithCount: 22 },
    { bookNumber: 9, bookTitle: 'The Book of Prayer - Rain', hadithCount: 19 },
    { bookNumber: 10, bookTitle: 'The Book of Prayer - Eclipses', hadithCount: 29 },
    { bookNumber: 11, bookTitle: 'The Book of Prayer - Funerals', hadithCount: 135 },
    { bookNumber: 12, bookTitle: 'The Book of Zakat', hadithCount: 229 },
    { bookNumber: 13, bookTitle: 'The Book of Fasting', hadithCount: 285 },
    { bookNumber: 14, bookTitle: "The Book of I'tikaf", hadithCount: 11 },
    { bookNumber: 15, bookTitle: 'The Book of Pilgrimage', hadithCount: 583 },
    { bookNumber: 16, bookTitle: 'The Book of Marriage', hadithCount: 168 },
    { bookNumber: 17, bookTitle: 'The Book of Suckling', hadithCount: 84 },
    { bookNumber: 18, bookTitle: 'The Book of Divorce', hadithCount: 86 },
    { bookNumber: 19, bookTitle: 'The Book of Invoking Curses', hadithCount: 27 },
    { bookNumber: 20, bookTitle: 'The Book of Emancipating Slaves', hadithCount: 30 },
    { bookNumber: 21, bookTitle: 'The Book of Transactions', hadithCount: 158 },
    { bookNumber: 22, bookTitle: 'The Book of Musaqah', hadithCount: 178 },
    { bookNumber: 23, bookTitle: 'The Book of the Rules of Inheritance', hadithCount: 23 },
    { bookNumber: 24, bookTitle: 'The Book of Gifts', hadithCount: 41 },
    { bookNumber: 25, bookTitle: 'The Book of Wills', hadithCount: 31 },
    { bookNumber: 26, bookTitle: 'The Book of Vows', hadithCount: 17 },
    { bookNumber: 27, bookTitle: 'The Book of Oaths', hadithCount: 88 },
    { bookNumber: 28, bookTitle: 'The Book of Oaths, Muharibin, Qasas and Diyat', hadithCount: 56 },
    { bookNumber: 29, bookTitle: 'The Book of Legal Punishments', hadithCount: 70 },
    { bookNumber: 30, bookTitle: 'The Book of Judicial Decisions', hadithCount: 28 },
    { bookNumber: 31, bookTitle: 'The Book of Lost Property', hadithCount: 19 },
    { bookNumber: 32, bookTitle: 'The Book of Jihad and Expeditions', hadithCount: 178 },
    { bookNumber: 33, bookTitle: 'The Book on Government', hadithCount: 257 },
    { bookNumber: 34, bookTitle: 'The Book of Hunting, Slaughter, and what may be Eaten', hadithCount: 92 },
    { bookNumber: 35, bookTitle: 'The Book of Sacrifices', hadithCount: 59 },
    { bookNumber: 36, bookTitle: 'The Book of Drinks', hadithCount: 255 },
    { bookNumber: 37, bookTitle: 'The Book of Clothes and Adornment', hadithCount: 184 },
    { bookNumber: 38, bookTitle: 'The Book of Manners and Etiquette', hadithCount: 59 },
    { bookNumber: 39, bookTitle: 'The Book of Greetings', hadithCount: 210 },
    { bookNumber: 40, bookTitle: 'The Book Concerning the Use of Correct Words', hadithCount: 23 },
    { bookNumber: 41, bookTitle: 'The Book of Poetry', hadithCount: 10 },
    { bookNumber: 42, bookTitle: 'The Book of Dreams', hadithCount: 40 },
    { bookNumber: 43, bookTitle: 'The Book of Virtues', hadithCount: 217 },
    { bookNumber: 44, bookTitle: 'The Book of the Merits of the Companions', hadithCount: 324 },
    { bookNumber: 45, bookTitle: 'The Book of Virtue, Good Manners and Joining of the Ties of Kinship', hadithCount: 210 },
    { bookNumber: 46, bookTitle: 'The Book of Destiny', hadithCount: 52 },
    { bookNumber: 47, bookTitle: 'The Book of Knowledge', hadithCount: 29 },
    { bookNumber: 48, bookTitle: 'The Book of Remembrance of Allah, Supplication, Repentance and Seeking Forgiveness', hadithCount: 124 },
    { bookNumber: 49, bookTitle: 'The Book of Heart-Melting Traditions', hadithCount: 15 },
    { bookNumber: 50, bookTitle: 'The Book of Repentance', hadithCount: 63 },
    { bookNumber: 51, bookTitle: 'Characteristics of The Hypocrites', hadithCount: 21 },
    { bookNumber: 52, bookTitle: 'Characteristics of the Day of Judgment, Paradise, and Hell', hadithCount: 79 },
    { bookNumber: 53, bookTitle: 'The Book of Paradise, its Description and Inhabitants', hadithCount: 102 },
    { bookNumber: 54, bookTitle: 'The Book of Tribulations and Portents of the Last Hour', hadithCount: 158 },
    { bookNumber: 55, bookTitle: 'The Book of Zuhd and Softening of Hearts', hadithCount: 79 },
    { bookNumber: 56, bookTitle: "The Book of Commentary on the Qur'an", hadithCount: 39 },
  ],
  tirmidhi: [
    { bookNumber: 1, bookTitle: 'The Book on Purification', hadithCount: 148 },
    { bookNumber: 2, bookTitle: 'The Book on Salat (Prayer)', hadithCount: 304 },
    { bookNumber: 3, bookTitle: 'The Book on Al-Witr', hadithCount: 36 },
    { bookNumber: 4, bookTitle: 'The Book on the Day of Friday', hadithCount: 42 },
    { bookNumber: 5, bookTitle: 'The Book on the Two Eids', hadithCount: 14 },
    { bookNumber: 6, bookTitle: 'The Book on Traveling', hadithCount: 73 },
    { bookNumber: 7, bookTitle: 'The Book on Zakat', hadithCount: 65 },
    { bookNumber: 8, bookTitle: 'The Book on Fasting', hadithCount: 127 },
    { bookNumber: 9, bookTitle: 'The Book on Hajj', hadithCount: 157 },
    { bookNumber: 10, bookTitle: "The Book on Jana'iz (Funerals)", hadithCount: 115 },
    { bookNumber: 11, bookTitle: 'The Book on Marriage', hadithCount: 67 },
    { bookNumber: 12, bookTitle: 'The Book on Suckling', hadithCount: 29 },
    { bookNumber: 13, bookTitle: "The Book on Divorce and Li'an", hadithCount: 31 },
    { bookNumber: 14, bookTitle: 'The Book on Business', hadithCount: 117 },
    { bookNumber: 15, bookTitle: 'Chapters On Judgements', hadithCount: 64 },
    { bookNumber: 16, bookTitle: 'The Book on Blood Money', hadithCount: 37 },
    { bookNumber: 17, bookTitle: 'The Book on Legal Punishments (Al-Hudud)', hadithCount: 45 },
    { bookNumber: 18, bookTitle: 'The Book on Hunting', hadithCount: 29 },
    { bookNumber: 19, bookTitle: 'The Book on Sacrifices', hadithCount: 31 },
    { bookNumber: 20, bookTitle: 'The Book on Vows and Oaths', hadithCount: 24 },
    { bookNumber: 21, bookTitle: 'The Book on Military Expeditions', hadithCount: 72 },
    { bookNumber: 22, bookTitle: 'The Book on Virtues of Jihad', hadithCount: 51 },
    { bookNumber: 23, bookTitle: 'The Book on Jihad', hadithCount: 50 },
    { bookNumber: 24, bookTitle: 'The Book on Clothing', hadithCount: 68 },
    { bookNumber: 25, bookTitle: 'The Book on Food', hadithCount: 73 },
    { bookNumber: 26, bookTitle: 'The Book on Drinks', hadithCount: 37 },
    { bookNumber: 27, bookTitle: 'Chapters on Righteousness and Maintaining Good Relations', hadithCount: 141 },
    { bookNumber: 28, bookTitle: 'Chapters on Medicine', hadithCount: 54 },
    { bookNumber: 29, bookTitle: 'Chapters On Inheritance', hadithCount: 26 },
    { bookNumber: 30, bookTitle: 'Chapters On Wills and Testament', hadithCount: 9 },
    { bookNumber: 31, bookTitle: "Chapters On Wala' And Gifts", hadithCount: 8 },
    { bookNumber: 32, bookTitle: 'Chapters On Al-Qadar', hadithCount: 26 },
    { bookNumber: 33, bookTitle: 'Chapters On Al-Fitan', hadithCount: 112 },
    { bookNumber: 34, bookTitle: 'Chapters On Dreams', hadithCount: 25 },
    { bookNumber: 35, bookTitle: 'Chapters On Witnesses', hadithCount: 9 },
    { bookNumber: 36, bookTitle: 'Chapters On Zuhd', hadithCount: 111 },
    { bookNumber: 37, bookTitle: "Chapters on the Description of the Day of Judgement, Ar-Riqaq, and Al-Wara'", hadithCount: 108 },
    { bookNumber: 38, bookTitle: 'Chapters on the Description of Paradise', hadithCount: 51 },
    { bookNumber: 39, bookTitle: 'The Book on the Description of Hellfire', hadithCount: 34 },
    { bookNumber: 40, bookTitle: 'The Book on Faith', hadithCount: 39 },
    { bookNumber: 41, bookTitle: 'Chapters on Knowledge', hadithCount: 43 },
    { bookNumber: 42, bookTitle: 'Chapters on Seeking Permission', hadithCount: 47 },
    { bookNumber: 43, bookTitle: 'Chapters on Manners', hadithCount: 138 },
    { bookNumber: 44, bookTitle: 'Chapters on Parables', hadithCount: 17 },
    { bookNumber: 45, bookTitle: "Chapters on The Virtues of the Qur'an", hadithCount: 52 },
    { bookNumber: 46, bookTitle: 'Chapters on Recitation', hadithCount: 23 },
    { bookNumber: 47, bookTitle: 'Chapters on Tafsir', hadithCount: 424 },
    { bookNumber: 48, bookTitle: 'Chapters on Supplication', hadithCount: 244 },
    { bookNumber: 49, bookTitle: 'Chapters on Virtues', hadithCount: 351 },
  ],
  abudawud: [
    { bookNumber: 1, bookTitle: 'Purification (Kitab Al-Taharah)', hadithCount: 390 },
    { bookNumber: 2, bookTitle: 'Prayer (Kitab Al-Salat)', hadithCount: 770 },
    { bookNumber: 3, bookTitle: "The Book Of The Prayer For Rain (Kitab al-Istisqa')", hadithCount: 37 },
    { bookNumber: 4, bookTitle: 'Prayer: Detailed Rules about the Prayer during Journey', hadithCount: 52 },
    { bookNumber: 5, bookTitle: 'Prayer: Voluntary Prayers', hadithCount: 121 },
    { bookNumber: 6, bookTitle: 'Prayer: Detailed Injunctions about Ramadan', hadithCount: 30 },
    { bookNumber: 7, bookTitle: "Prayer: Prostration while reciting the Qur'an", hadithCount: 15 },
    { bookNumber: 8, bookTitle: 'Prayer: Detailed Injunctions about Witr', hadithCount: 140 },
    { bookNumber: 9, bookTitle: 'Zakat (Kitab Al-Zakat)', hadithCount: 145 },
    { bookNumber: 10, bookTitle: 'The Book of Lost and Found Items', hadithCount: 20 },
    { bookNumber: 11, bookTitle: "The Rites of Hajj (Kitab Al-Manasik Wa'l-Hajj)", hadithCount: 325 },
    { bookNumber: 12, bookTitle: 'Marriage (Kitab Al-Nikah)', hadithCount: 129 },
    { bookNumber: 13, bookTitle: 'Divorce (Kitab Al-Talaq)', hadithCount: 138 },
    { bookNumber: 14, bookTitle: 'Fasting (Kitab Al-Siyam)', hadithCount: 164 },
    { bookNumber: 15, bookTitle: 'Jihad (Kitab Al-Jihad)', hadithCount: 311 },
    { bookNumber: 16, bookTitle: 'Sacrifice (Kitab Al-Dahaya)', hadithCount: 56 },
    { bookNumber: 17, bookTitle: 'Game (Kitab Al-Said)', hadithCount: 18 },
    { bookNumber: 18, bookTitle: 'Wills (Kitab Al-Wasaya)', hadithCount: 23 },
    { bookNumber: 19, bookTitle: "Shares of Inheritance (Kitab Al-Fara'id)", hadithCount: 43 },
    { bookNumber: 20, bookTitle: "Tribute, Spoils, and Rulership (Kitab Al-Kharaj, Wal-Fai' Wal-Imarah)", hadithCount: 161 },
    { bookNumber: 21, bookTitle: "Funerals (Kitab Al-Jana'iz)", hadithCount: 153 },
    { bookNumber: 22, bookTitle: 'Oaths and Vows (Kitab Al-Aiman Wa Al-Nudhur)', hadithCount: 84 },
    { bookNumber: 23, bookTitle: 'Commercial Transactions (Kitab Al-Buyu)', hadithCount: 90 },
    { bookNumber: 24, bookTitle: 'Wages (Kitab Al-Ijarah)', hadithCount: 155 },
    { bookNumber: 25, bookTitle: 'The Office of the Judge (Kitab Al-Aqdiyah)', hadithCount: 70 },
    { bookNumber: 26, bookTitle: 'Knowledge (Kitab Al-Ilm)', hadithCount: 28 },
    { bookNumber: 27, bookTitle: 'Drinks (Kitab Al-Ashribah)', hadithCount: 67 },
    { bookNumber: 28, bookTitle: "Foods (Kitab Al-At'imah)", hadithCount: 119 },
    { bookNumber: 29, bookTitle: 'Medicine (Kitab Al-Tibb)', hadithCount: 49 },
    { bookNumber: 30, bookTitle: 'Divination and Omens', hadithCount: 22 },
    { bookNumber: 31, bookTitle: 'The Book of Manumission of Slaves', hadithCount: 43 },
    { bookNumber: 32, bookTitle: "Dialects and Readings of the Qur'an", hadithCount: 40 },
    { bookNumber: 33, bookTitle: 'Hot Baths (Kitab Al-Hammam)', hadithCount: 11 },
    { bookNumber: 34, bookTitle: 'Clothing (Kitab Al-Libas)', hadithCount: 139 },
    { bookNumber: 35, bookTitle: 'Combing the Hair (Kitab Al-Tarajjul)', hadithCount: 55 },
    { bookNumber: 36, bookTitle: 'Signet-Rings (Kitab Al-Khatam)', hadithCount: 26 },
    { bookNumber: 37, bookTitle: 'Trials and Fierce Battles (Kitab Al-Fitan)', hadithCount: 39 },
    { bookNumber: 38, bookTitle: 'The Promised Deliverer (Kitab Al-Mahdi)', hadithCount: 12 },
    { bookNumber: 39, bookTitle: 'Battles (Kitab Al-Malahim)', hadithCount: 60 },
    { bookNumber: 40, bookTitle: 'Prescribed Punishments (Kitab Al-Hudud)', hadithCount: 143 },
    { bookNumber: 41, bookTitle: 'Types of Blood-Wit (Kitab Al-Diyat)', hadithCount: 102 },
    { bookNumber: 42, bookTitle: 'Model Behavior of the Prophet (Kitab Al-Sunnah)', hadithCount: 177 },
    { bookNumber: 43, bookTitle: 'General Behavior (Kitab Al-Adab)', hadithCount: 502 },
  ],
  nasai: [
    { bookNumber: 1, bookTitle: 'The Book of Purification', hadithCount: 324 },
    { bookNumber: 2, bookTitle: 'The Book of Water', hadithCount: 23 },
    { bookNumber: 3, bookTitle: 'The Book of Menstruation and Istihadah', hadithCount: 49 },
    { bookNumber: 4, bookTitle: 'The Book of Ghusl and Tayammum', hadithCount: 53 },
    { bookNumber: 5, bookTitle: 'The Book of Salah', hadithCount: 46 },
    { bookNumber: 6, bookTitle: 'The Book of the Times (of Prayer)', hadithCount: 132 },
    { bookNumber: 7, bookTitle: 'The Book of the Adhan', hadithCount: 62 },
    { bookNumber: 8, bookTitle: 'The Book of the Masjids', hadithCount: 54 },
    { bookNumber: 9, bookTitle: 'The Book of the Qiblah', hadithCount: 35 },
    { bookNumber: 10, bookTitle: 'The Book of Leading the Prayer (Al-Imamah)', hadithCount: 99 },
    { bookNumber: 11, bookTitle: 'The Book of the Commencement of the Prayer', hadithCount: 153 },
    { bookNumber: 12, bookTitle: 'The Book of The At-Tatbiq', hadithCount: 150 },
    { bookNumber: 13, bookTitle: 'The Book of Forgetfulness (In Prayer)', hadithCount: 188 },
    { bookNumber: 14, bookTitle: "The Book of Jumu'ah (Friday Prayer)", hadithCount: 66 },
    { bookNumber: 15, bookTitle: 'The Book of Shortening the Prayer When Traveling', hadithCount: 26 },
    { bookNumber: 16, bookTitle: 'The Book of Eclipses', hadithCount: 45 },
    { bookNumber: 17, bookTitle: "The Book of Praying for Rain (Al-Istisqa')", hadithCount: 25 },
    { bookNumber: 18, bookTitle: 'The Book of the Fear Prayer', hadithCount: 27 },
    { bookNumber: 19, bookTitle: "The Book of the Prayer for the Two 'Eids", hadithCount: 42 },
    { bookNumber: 20, bookTitle: 'The Book of Qiyam Al-Lail and Voluntary Prayers During the Day', hadithCount: 220 },
    { bookNumber: 21, bookTitle: 'The Book of Funerals', hadithCount: 272 },
    { bookNumber: 22, bookTitle: 'The Book of Fasting', hadithCount: 345 },
    { bookNumber: 23, bookTitle: 'The Book of Zakah', hadithCount: 184 },
    { bookNumber: 24, bookTitle: 'The Book of Hajj', hadithCount: 467 },
    { bookNumber: 25, bookTitle: 'The Book of Jihad', hadithCount: 111 },
    { bookNumber: 26, bookTitle: 'The Book of Marriage', hadithCount: 193 },
    { bookNumber: 27, bookTitle: 'The Book of Divorce', hadithCount: 174 },
    { bookNumber: 28, bookTitle: 'The Book of Horses, Races and Shooting', hadithCount: 33 },
    { bookNumber: 29, bookTitle: 'The Book of Endowments', hadithCount: 17 },
    { bookNumber: 30, bookTitle: 'The Book of Wills', hadithCount: 61 },
    { bookNumber: 31, bookTitle: 'The Book of Presents', hadithCount: 16 },
    { bookNumber: 32, bookTitle: 'The Book of Gifts', hadithCount: 18 },
    { bookNumber: 33, bookTitle: 'The Book of ar-Ruqba', hadithCount: 14 },
    { bookNumber: 34, bookTitle: "The Book of 'Umra", hadithCount: 42 },
    { bookNumber: 35, bookTitle: 'The Book of Agriculture', hadithCount: 96 },
    { bookNumber: 36, bookTitle: 'The Book of the Kind Treatment of Women', hadithCount: 27 },
    { bookNumber: 37, bookTitle: 'The Book of Fighting', hadithCount: 167 },
    { bookNumber: 38, bookTitle: "The Book of Distribution of Al-Fay'", hadithCount: 16 },
    { bookNumber: 39, bookTitle: "The Book of al-Bay'ah", hadithCount: 63 },
    { bookNumber: 40, bookTitle: "The Book of al-'Aqiqah", hadithCount: 10 },
    { bookNumber: 41, bookTitle: "The Book of al-Fara' and al-'Atirah", hadithCount: 41 },
    { bookNumber: 42, bookTitle: 'The Book of Hunting and Slaughtering', hadithCount: 98 },
    { bookNumber: 43, bookTitle: 'The Book of ad-Dahaya (Sacrifices)', hadithCount: 88 },
    { bookNumber: 44, bookTitle: 'The Book of Financial Transactions', hadithCount: 257 },
    { bookNumber: 45, bookTitle: 'The Book of Oaths, Retaliation and Blood Money', hadithCount: 164 },
    { bookNumber: 46, bookTitle: 'The Book of Cutting off the Hand of the Thief', hadithCount: 115 },
    { bookNumber: 47, bookTitle: 'The Book Of Faith and its Signs', hadithCount: 55 },
    { bookNumber: 48, bookTitle: 'The Book of Adornment', hadithCount: 339 },
    { bookNumber: 49, bookTitle: 'The Book of the Etiquette of Judges', hadithCount: 49 },
    { bookNumber: 50, bookTitle: 'The Book of Seeking Refuge with Allah', hadithCount: 112 },
    { bookNumber: 51, bookTitle: 'The Book of Drinks', hadithCount: 220 },
  ],
  ibnmajah: [
    { bookNumber: 1, bookTitle: 'The Book of Purification and its Sunnah', hadithCount: 400 },
    { bookNumber: 2, bookTitle: 'The Book of the Prayer', hadithCount: 39 },
    { bookNumber: 3, bookTitle: 'The Book of the Adhan and the Sunnah Regarding It', hadithCount: 29 },
    { bookNumber: 4, bookTitle: 'The Book On The Mosques And The Congregations', hadithCount: 68 },
    { bookNumber: 5, bookTitle: 'Establishing the Prayer and the Sunnah Regarding Them', hadithCount: 630 },
    { bookNumber: 6, bookTitle: 'Chapters Regarding Funerals', hadithCount: 205 },
    { bookNumber: 7, bookTitle: 'Fasting', hadithCount: 145 },
    { bookNumber: 8, bookTitle: 'The Chapters Regarding Zakat', hadithCount: 62 },
    { bookNumber: 9, bookTitle: 'The Chapters on Marriage', hadithCount: 171 },
    { bookNumber: 10, bookTitle: 'The Chapters on Divorce', hadithCount: 78 },
    { bookNumber: 11, bookTitle: 'The Chapters on Expiation', hadithCount: 47 },
    { bookNumber: 12, bookTitle: 'The Chapters on Business Transactions', hadithCount: 171 },
    { bookNumber: 13, bookTitle: 'The Chapters on Rulings', hadithCount: 67 },
    { bookNumber: 14, bookTitle: 'The Chapters on Gifts', hadithCount: 15 },
    { bookNumber: 15, bookTitle: 'The Chapters on Charity', hadithCount: 46 },
    { bookNumber: 16, bookTitle: 'The Chapters on Pawning', hadithCount: 53 },
    { bookNumber: 17, bookTitle: 'The Chapters on Pre-emption', hadithCount: 10 },
    { bookNumber: 18, bookTitle: 'The Chapters on Lost Property', hadithCount: 10 },
    { bookNumber: 19, bookTitle: 'The Chapters on Manumission (of Slaves)', hadithCount: 20 },
    { bookNumber: 20, bookTitle: 'The Chapters on Legal Punishments', hadithCount: 82 },
    { bookNumber: 21, bookTitle: 'The Chapters on Blood Money', hadithCount: 80 },
    { bookNumber: 22, bookTitle: 'The Chapters on Wills', hadithCount: 24 },
    { bookNumber: 23, bookTitle: 'Chapters on Shares of Inheritance', hadithCount: 34 },
    { bookNumber: 24, bookTitle: 'The Chapters on Jihad', hadithCount: 129 },
    { bookNumber: 25, bookTitle: 'Chapters on Hajj Rituals', hadithCount: 238 },
    { bookNumber: 26, bookTitle: 'Chapters on Sacrifices', hadithCount: 42 },
    { bookNumber: 27, bookTitle: 'Chapters on Slaughtering', hadithCount: 38 },
    { bookNumber: 28, bookTitle: 'Chapters on Hunting', hadithCount: 51 },
    { bookNumber: 29, bookTitle: 'Chapters on Food', hadithCount: 120 },
    { bookNumber: 30, bookTitle: 'Chapters on Drinks', hadithCount: 65 },
    { bookNumber: 31, bookTitle: 'Chapters on Medicine', hadithCount: 114 },
    { bookNumber: 32, bookTitle: 'Chapters on Dress', hadithCount: 107 },
    { bookNumber: 33, bookTitle: 'Etiquette', hadithCount: 170 },
    { bookNumber: 34, bookTitle: 'Supplication', hadithCount: 66 },
    { bookNumber: 35, bookTitle: 'Interpretation of Dreams', hadithCount: 34 },
    { bookNumber: 36, bookTitle: 'Tribulations', hadithCount: 175 },
    { bookNumber: 37, bookTitle: 'Zuhd', hadithCount: 242 },
  ],
  malik: [
    { bookNumber: 1, bookTitle: 'The Times of Prayer', hadithCount: 31 },
    { bookNumber: 2, bookTitle: 'Purity', hadithCount: 114 },
    { bookNumber: 3, bookTitle: 'Prayer', hadithCount: 75 },
    { bookNumber: 4, bookTitle: 'Forgetfulness in Prayer', hadithCount: 3 },
    { bookNumber: 5, bookTitle: "Jumu'a", hadithCount: 21 },
    { bookNumber: 6, bookTitle: 'Prayer in Ramadan', hadithCount: 8 },
    { bookNumber: 7, bookTitle: 'Tahajjud', hadithCount: 33 },
    { bookNumber: 8, bookTitle: 'Prayer in Congregation', hadithCount: 39 },
    { bookNumber: 9, bookTitle: 'Shortening the Prayer', hadithCount: 102 },
    { bookNumber: 10, bookTitle: "The Two 'Ids", hadithCount: 13 },
    { bookNumber: 11, bookTitle: 'The Fear Prayer', hadithCount: 4 },
    { bookNumber: 12, bookTitle: 'The Eclipse Prayer', hadithCount: 4 },
    { bookNumber: 13, bookTitle: 'Asking for Rain', hadithCount: 6 },
    { bookNumber: 14, bookTitle: 'The Qibla', hadithCount: 15 },
    { bookNumber: 15, bookTitle: "The Qur'an", hadithCount: 50 },
    { bookNumber: 16, bookTitle: 'Burials', hadithCount: 58 },
    { bookNumber: 17, bookTitle: 'Zakat', hadithCount: 52 },
    { bookNumber: 18, bookTitle: 'Fasting', hadithCount: 59 },
    { bookNumber: 19, bookTitle: "I'tikaf in Ramadan", hadithCount: 15 },
    { bookNumber: 20, bookTitle: 'Hajj', hadithCount: 251 },
    { bookNumber: 21, bookTitle: 'Jihad', hadithCount: 50 },
    { bookNumber: 22, bookTitle: 'Vows and Oaths', hadithCount: 18 },
    { bookNumber: 23, bookTitle: 'Sacrificial Animals', hadithCount: 13 },
    { bookNumber: 24, bookTitle: 'Slaughtering Animals', hadithCount: 10 },
    { bookNumber: 25, bookTitle: 'Game', hadithCount: 15 },
    { bookNumber: 26, bookTitle: "The 'Aqiqa", hadithCount: 7 },
    { bookNumber: 27, bookTitle: "Fara'id", hadithCount: 16 },
    { bookNumber: 28, bookTitle: 'Marriage', hadithCount: 59 },
    { bookNumber: 29, bookTitle: 'Divorce', hadithCount: 118 },
    { bookNumber: 30, bookTitle: 'Suckling', hadithCount: 18 },
    { bookNumber: 31, bookTitle: 'Business Transactions', hadithCount: 95 },
    { bookNumber: 32, bookTitle: 'Qirad', hadithCount: 2 },
    { bookNumber: 33, bookTitle: 'Sharecropping', hadithCount: 2 },
    { bookNumber: 34, bookTitle: 'Renting Land', hadithCount: 5 },
    { bookNumber: 35, bookTitle: 'Pre-emption in Property', hadithCount: 4 },
    { bookNumber: 36, bookTitle: 'Judgements', hadithCount: 56 },
    { bookNumber: 37, bookTitle: 'Wills and Testaments', hadithCount: 9 },
    { bookNumber: 38, bookTitle: "Setting Free and Wala'", hadithCount: 25 },
    { bookNumber: 39, bookTitle: 'The Mukatab', hadithCount: 7 },
    { bookNumber: 40, bookTitle: 'The Mudabbar', hadithCount: 3 },
    { bookNumber: 41, bookTitle: 'Hudud', hadithCount: 35 },
    { bookNumber: 42, bookTitle: 'Drinks', hadithCount: 15 },
    { bookNumber: 43, bookTitle: 'Blood-Money', hadithCount: 43 },
    { bookNumber: 44, bookTitle: 'The Oath of Qasama', hadithCount: 2 },
    { bookNumber: 45, bookTitle: 'Madina', hadithCount: 25 },
    { bookNumber: 46, bookTitle: 'The Decree', hadithCount: 10 },
    { bookNumber: 47, bookTitle: 'Good Character', hadithCount: 18 },
    { bookNumber: 48, bookTitle: 'Dress', hadithCount: 20 },
    { bookNumber: 49, bookTitle: 'The Description of the Prophet', hadithCount: 40 },
    { bookNumber: 50, bookTitle: 'The Evil Eye', hadithCount: 19 },
    { bookNumber: 51, bookTitle: 'Hair', hadithCount: 17 },
    { bookNumber: 52, bookTitle: 'Visions', hadithCount: 8 },
    { bookNumber: 53, bookTitle: 'Greetings', hadithCount: 7 },
    { bookNumber: 54, bookTitle: 'General Subjects', hadithCount: 45 },
    { bookNumber: 55, bookTitle: 'The Oath of Allegiance', hadithCount: 3 },
    { bookNumber: 56, bookTitle: 'Speech', hadithCount: 28 },
    { bookNumber: 57, bookTitle: 'Jahannam', hadithCount: 2 },
    { bookNumber: 58, bookTitle: 'Sadaqa', hadithCount: 15 },
    { bookNumber: 59, bookTitle: 'Knowledge', hadithCount: 1 },
    { bookNumber: 60, bookTitle: 'The Supplication of the Unjustly Wronged', hadithCount: 1 },
    { bookNumber: 61, bookTitle: 'The Names of the Prophet', hadithCount: 1 },
  ],
  nawawi40: [
    { bookNumber: 1, bookTitle: 'Forty Hadith of an-Nawawi', hadithCount: 42 },
  ],
  qudsi40: [
    { bookNumber: 1, bookTitle: 'Forty Hadith Qudsi', hadithCount: 40 },
  ],
};

// In-memory cache for collection data to avoid re-downloading
const collectionCache = new Map<string, any>();

/**
 * FAST: Fetch hadiths for a specific section/book using per-section CDN endpoint.
 * Downloads only ~5-50KB instead of entire collection (~5MB).
 * URL pattern: /editions/{lang}-{collection}/sections/{bookNumber}.json
 */
async function fetchFromCDNPerSection(
  collectionId: string,
  bookNumber: number
): Promise<TranslatedHadith[]> {
  if (CDN_UNAVAILABLE.has(collectionId)) {
    throw new Error(`Collection "${collectionId}" not available on CDN`);
  }

  const cdnId = CDN_COLLECTION_MAP[collectionId] ?? collectionId;
  const cacheKey = `section-${cdnId}-${bookNumber}`;

  // Check cache first
  const cachedSection = collectionCache.get(cacheKey);
  if (cachedSection) {
    return cachedSection;
  }

  console.log(`Fetching ${cdnId} section ${bookNumber} from CDN (per-section)...`);

  // Fetch English, Arabic, and French per-section data in parallel (~5-50KB each)
  const [engResponse, araResponse, fraResponse] = await Promise.all([
    fetchWithTimeout(`${CDN_BASE}/eng-${cdnId}/sections/${bookNumber}.json`),
    fetchWithTimeout(`${CDN_BASE}/ara-${cdnId}/sections/${bookNumber}.json`).catch(() => null),
    fetchWithTimeout(`${CDN_BASE}/fra-${cdnId}/sections/${bookNumber}.json`).catch(() => null),
  ]);

  if (!engResponse.ok) {
    throw new Error(`CDN per-section error: ${engResponse.status} ${engResponse.statusText}`);
  }

  const engData = await engResponse.json();
  const engHadiths = engData.hadiths || [];

  if (engHadiths.length === 0) {
    throw new Error(`No hadiths found for book ${bookNumber} in ${collectionId}`);
  }

  // Build Arabic lookup map
  const arabicMap = new Map<number, string>();
  if (araResponse?.ok) {
    try {
      const araData = await araResponse.json();
      for (const h of araData.hadiths || []) {
        arabicMap.set(h.hadithnumber, h.text);
      }
    } catch { /* ignore parse errors */ }
  }

  // Build French lookup map
  const frenchMap = new Map<number, string>();
  if (fraResponse?.ok) {
    try {
      const fraData = await fraResponse.json();
      for (const h of fraData.hadiths || []) {
        frenchMap.set(h.hadithnumber, h.text);
      }
    } catch { /* ignore parse errors */ }
  }

  const sectionName = engData.metadata?.section?.[String(bookNumber)]
    ?? engData.metadata?.sections?.[String(bookNumber)]
    ?? `Book ${bookNumber}`;

  const result = engHadiths.map((h: any, index: number) => ({
    hadithNumber: String(h.reference?.hadith ?? h.hadithnumber ?? index + 1),
    arabicText: arabicMap.get(h.hadithnumber) ?? '',
    englishText: h.text ?? '',
    frenchText: frenchMap.get(h.hadithnumber) ?? '',
    reference: `${collectionId} ${h.hadithnumber}`,
    book: sectionName,
    chapter: '',
  }));

  // Cache the result
  collectionCache.set(cacheKey, result);
  return result;
}

/**
 * SLOW FALLBACK: Downloads ENTIRE collection JSON (~5MB for Bukhari).
 * Only used when per-section endpoint fails.
 */
async function fetchFromFreeCDN(
  collectionId: string,
  bookNumber: number
): Promise<TranslatedHadith[]> {
  if (CDN_UNAVAILABLE.has(collectionId)) {
    throw new Error(`Collection "${collectionId}" not available on CDN`);
  }

  const cdnId = CDN_COLLECTION_MAP[collectionId] ?? collectionId;

  let engData = collectionCache.get(`eng-${cdnId}`);
  let araData = collectionCache.get(`ara-${cdnId}`);
  let fraData = collectionCache.get(`fra-${cdnId}`);

  if (!engData) {
    console.log(`Downloading ${cdnId} full collection from CDN (fallback)...`);

    // Use longer timeout for full collection downloads (can be 5MB+)
    const [engResponse, araResponse, fraResponse] = await Promise.all([
      fetchWithTimeout(`${CDN_BASE}/eng-${cdnId}.min.json`, undefined, 30000),
      fetchWithTimeout(`${CDN_BASE}/ara-${cdnId}.min.json`, undefined, 30000).catch(() => null),
      fetchWithTimeout(`${CDN_BASE}/fra-${cdnId}.min.json`, undefined, 30000).catch(() => null),
    ]);

    if (!engResponse.ok) {
      throw new Error(`CDN API error: ${engResponse.status} ${engResponse.statusText}`);
    }

    engData = await engResponse.json();
    collectionCache.set(`eng-${cdnId}`, engData);

    if (araResponse?.ok) {
      araData = await araResponse.json();
      collectionCache.set(`ara-${cdnId}`, araData);
    }

    if (fraResponse?.ok) {
      fraData = await fraResponse.json();
      collectionCache.set(`fra-${cdnId}`, fraData);
    }
  }

  // Filter hadiths to the requested book number
  const bookHadiths = (engData.hadiths || []).filter(
    (h: any) => h.reference?.book === bookNumber
  );

  if (bookHadiths.length === 0) {
    throw new Error(`No hadiths found for book ${bookNumber} in ${collectionId}`);
  }

  // Build Arabic and French lookup maps by hadith number
  const arabicMap = new Map<number, string>();
  if (araData?.hadiths) {
    for (const h of araData.hadiths) {
      arabicMap.set(h.hadithnumber, h.text);
    }
  }

  const frenchMap = new Map<number, string>();
  if (fraData?.hadiths) {
    for (const h of fraData.hadiths) {
      frenchMap.set(h.hadithnumber, h.text);
    }
  }

  const sectionName = engData.metadata?.sections?.[String(bookNumber)] ?? `Book ${bookNumber}`;

  return bookHadiths.map((h: any, index: number) => ({
    hadithNumber: String(h.reference?.hadith ?? h.hadithnumber ?? index + 1),
    arabicText: arabicMap.get(h.hadithnumber) ?? '',
    englishText: h.text ?? '',
    frenchText: frenchMap.get(h.hadithnumber) ?? '',
    reference: `${collectionId} ${h.hadithnumber}`,
    book: sectionName,
    chapter: '',
  }));
}

async function fetchFromAltCDN(
  collectionId: string,
  bookNumber: number
): Promise<TranslatedHadith[]> {
  const collectionPath = ALT_CDN_COLLECTION_MAP[collectionId];
  if (!collectionPath) {
    throw new Error(`Collection "${collectionId}" not available on alt CDN`);
  }

  // Get the URL slug for this chapter (bookNumber is 1-indexed)
  const chapters = ALT_CDN_CHAPTERS[collectionId];
  const chapterIndex = bookNumber - 1;
  const chapterMeta = chapters?.[chapterIndex];
  const urlSlug = chapterMeta?.urlSlug ?? String(chapterIndex);
  const chapterName = chapterMeta?.english ?? `Chapter ${bookNumber}`;

  const cacheKey = `alt-chapter-${collectionId}-${urlSlug}`;
  let data = collectionCache.get(cacheKey);

  if (!data) {
    console.log(`Fetching ${collectionId} chapter ${urlSlug} from alt CDN...`);
    const url = `${ALT_CDN_CHAPTER_BASE}/${collectionPath}/${urlSlug}.json`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error(`Alt CDN error: ${response.status} ${response.statusText}`);
    }
    data = await response.json();
    collectionCache.set(cacheKey, data);
  }

  const hadiths = data.hadiths || [];
  if (hadiths.length === 0) {
    throw new Error(`No hadiths found for book ${bookNumber} in ${collectionId}`);
  }

  return hadiths.map((h: any, index: number) => ({
    hadithNumber: String(h.idInBook || index + 1),
    arabicText: h.arabic || '',
    englishText: typeof h.english === 'object'
      ? `${h.english.narrator || ''} ${h.english.text || ''}`.trim()
      : (h.english || ''),
    frenchText: '',
    reference: `${collectionId} ${h.idInBook || ''}`,
    book: chapterName,
    chapter: '',
  }));
}

async function translateTextWithClaude(text: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'sk-ant-api03-YOUR_ANTHROPIC_API_KEY_HERE') {
    console.warn('Anthropic API key not configured, trying OpenAI fallback');
    return translateTextWithOpenAI(text);
  }

  try {
    console.log('Translating with Claude AI...');
    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
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
    }, 15000);

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
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
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
    }, 15000);

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

/**
 * Translate hadiths to French, processing in small batches to avoid
 * overwhelming API rate limits on mobile devices.
 */
async function translateToFrench(
  hadiths: TranslatedHadith[]
): Promise<TranslatedHadith[]> {
  const BATCH_SIZE = 3; // Translate 3 hadiths at a time to avoid rate limits
  const results: TranslatedHadith[] = [];

  for (let i = 0; i < hadiths.length; i += BATCH_SIZE) {
    const batch = hadiths.slice(i, i + BATCH_SIZE);

    const translatedBatch = await Promise.all(
      batch.map(async (hadith) => {
        try {
          if (hadith.frenchText && hadith.frenchText !== hadith.englishText && hadith.frenchText !== '') {
            return hadith;
          }

          if (!hadith.englishText) {
            return hadith;
          }

          const cacheKey = `hadith_${hadith.reference.replace(/\s+/g, '_')}`;
          const cached = await getCachedTranslation('hadith', cacheKey, 'fr');

          if (cached) {
            return { ...hadith, frenchText: cached };
          }

          const frenchText = await translateTextWithClaude(hadith.englishText);

          if (frenchText !== hadith.englishText) {
            // Cache in background, don't block
            supabaseClient.from('translation_cache').insert({
              source_text: hadith.englishText,
              source_language: 'en',
              target_language: 'fr',
              translated_text: frenchText,
              source_type: 'hadith',
              source_id: cacheKey,
              translation_provider: 'claude',
            }).then(() => {}).catch(() => {});
          }

          return { ...hadith, frenchText };
        } catch (error) {
          // If translation fails for one hadith, keep English text
          console.warn('Translation failed for hadith:', hadith.reference, error);
          return hadith;
        }
      })
    );

    results.push(...translatedBatch);
  }

  return results;
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
      console.warn('Error caching hadiths:', error);
    }
  } catch (error) {
    console.warn('Error in cacheHadiths:', error);
  }
}

export async function getBookHadiths(
  collectionId: string,
  bookNumber: number
): Promise<TranslatedHadith[]> {
  console.log(`[getBookHadiths] Fetching hadiths for ${collectionId}, book ${bookNumber}`);

  // Strategy 1: Database cache (fastest)
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

  // Strategy 2: Per-section CDN (fast, ~5-50KB download)
  if (hadiths.length === 0 && !CDN_UNAVAILABLE.has(collectionId)) {
    try {
      console.log('Strategy 2: Trying per-section CDN (fast)...');
      hadiths = await fetchFromCDNPerSection(collectionId, bookNumber);
      console.log(`Fetched ${hadiths.length} hadiths from per-section CDN`);
    } catch (cdnSectionError) {
      console.warn('Per-section CDN failed:', cdnSectionError);
      lastError = cdnSectionError as Error;
    }
  }

  // Strategy 3: Alt CDN for collections not on fawazahmed0
  if (hadiths.length === 0 && ALT_CDN_COLLECTION_MAP[collectionId]) {
    try {
      console.log('Strategy 3: Trying alt CDN (AhmedBaset/hadith-json)...');
      hadiths = await fetchFromAltCDN(collectionId, bookNumber);
      console.log(`Fetched ${hadiths.length} hadiths from alt CDN`);
    } catch (altCdnError) {
      console.warn('Alt CDN failed:', altCdnError);
      lastError = altCdnError as Error;
    }
  }

  // Strategy 4: Sunnah.com API (requires API key)
  if (hadiths.length === 0 && SUNNAH_API_KEY) {
    try {
      console.log('Strategy 4: Trying Sunnah.com API...');
      hadiths = await retryWithBackoff(() =>
        fetchFromSunnahAPI(collectionId, bookNumber)
      );
      console.log(`Fetched ${hadiths.length} hadiths from Sunnah API`);
    } catch (apiError) {
      console.warn('Sunnah API failed:', apiError);
      lastError = apiError as Error;
    }
  }

  // Strategy 5: Full collection CDN download (slow fallback, ~5MB)
  if (hadiths.length === 0 && !CDN_UNAVAILABLE.has(collectionId)) {
    try {
      console.log('Strategy 5: Trying full collection CDN download (slow)...');
      hadiths = await fetchFromFreeCDN(collectionId, bookNumber);
      console.log(`Fetched ${hadiths.length} hadiths from full CDN`);
    } catch (cdnError) {
      console.warn('Full CDN failed:', cdnError);
      lastError = cdnError as Error;
    }
  }

  // Strategy 6: Edge function scraper (last resort)
  if (hadiths.length === 0) {
    try {
      console.log('Strategy 6: Trying edge function scraper...');
      const url = getSunnahComUrl(collectionId, bookNumber);
      hadiths = await retryWithBackoff(() => fetchFromEdgeFunction(url), 1);
      console.log(`Fetched ${hadiths.length} hadiths from edge function`);
    } catch (edgeError) {
      console.warn('Edge function failed:', edgeError);
      lastError = edgeError as Error;
    }
  }

  if (hadiths.length === 0) {
    const errorMessage = lastError
      ? `Impossible de charger les hadiths. Vérifiez votre connexion internet et réessayez.`
      : 'Aucun hadith trouvé pour ce livre.';
    throw new Error(errorMessage);
  }

  // Translate to French (non-blocking, batched)
  try {
    console.log(`Translating ${hadiths.length} hadiths to French...`);
    hadiths = await translateToFrench(hadiths);
  } catch (translateError) {
    console.warn('Translation failed, using available text:', translateError);
  }

  // Cache in background (don't block the response)
  cacheHadiths(collectionId, bookNumber, hadiths).catch(() => {});

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
      console.warn('Error fetching cached translation:', error);
      return null;
    }

    return data?.translated_text || null;
  } catch (error) {
    console.warn('Error fetching cached translation:', error);
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
    // Check hardcoded metadata first (instant, no network) for CDN collections
    const cdnMeta = CDN_COLLECTION_BOOKS[collectionId];
    if (cdnMeta) {
      const totalHadiths = cdnMeta.reduce((sum, b) => sum + b.hadithCount, 0);
      return {
        collectionId,
        totalBooks: cdnMeta.length,
        totalHadiths,
      };
    }

    // Check hardcoded metadata for alt CDN collections
    const chapters = ALT_CDN_CHAPTERS[collectionId];
    if (chapters) {
      const totalHadiths = chapters.reduce((sum, ch) => sum + ch.count, 0);
      return {
        collectionId,
        totalBooks: chapters.length,
        totalHadiths,
      };
    }

    // Try database (silently — table may not exist)
    try {
      const { data } = await supabaseClient
        .from('hadith_collections_metadata')
        .select('*')
        .eq('collection_id', collectionId)
        .maybeSingle();

      if (data) {
        return {
          collectionId: data.collection_id,
          totalBooks: data.total_books,
          totalHadiths: data.total_hadiths,
          lastSyncedAt: data.last_synced_at,
        };
      }
    } catch {
      // Table may not exist — that's OK, fall through
    }

    // Try Sunnah API if configured
    if (SUNNAH_API_KEY) {
      try {
        const response = await fetchWithTimeout(`${SUNNAH_API_BASE}/collections/${collectionId}`, {
          headers: { 'X-API-Key': SUNNAH_API_KEY },
        }, 10000);

        if (response.ok) {
          const apiData = await response.json();
          return {
            collectionId,
            totalBooks: apiData.data?.totalBooks || 0,
            totalHadiths: apiData.data?.totalHadith || 0,
          };
        }
      } catch {
        // API unavailable, fall through
      }
    }

    console.log('[getCollectionMetadata] Using default metadata for', collectionId);
    return {
      collectionId,
      totalBooks: 50,
      totalHadiths: 5000,
    };
  } catch (error) {
    console.warn('[getCollectionMetadata] Exception:', error);
    return {
      collectionId,
      totalBooks: 50,
      totalHadiths: 5000,
    };
  }
}

export async function getCollectionBooks(collectionId: string): Promise<HadithBook[]> {
  try {
    // 1. Check hardcoded CDN collection metadata (instant, no network)
    const cdnBooks = CDN_COLLECTION_BOOKS[collectionId];
    if (cdnBooks) {
      console.log(`[getCollectionBooks] Using hardcoded metadata for ${collectionId} (${cdnBooks.length} books)`);
      return cdnBooks;
    }

    // 2. Check hardcoded alt CDN chapter metadata (instant, no network)
    const chapters = ALT_CDN_CHAPTERS[collectionId];
    if (chapters) {
      console.log(`[getCollectionBooks] Using hardcoded alt CDN metadata for ${collectionId}`);
      return chapters.map((ch, index) => ({
        bookNumber: index + 1,
        bookTitle: ch.english,
        bookTitleArabic: ch.arabic,
        hadithCount: ch.count,
      }));
    }

    // 3. Check database cache (may have data from previous fetches)
    try {
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
            booksMap.get(row.book_number)!.hadithCount++;
          }
        });
        const books = Array.from(booksMap.values());
        console.log(`[getCollectionBooks] Found ${books.length} books in database`);
        return books;
      }
    } catch {
      // Database query failed (table may not exist), fall through
    }

    // 4. Try Sunnah.com API (requires API key)
    if (SUNNAH_API_KEY) {
      try {
        const response = await fetchWithTimeout(
          `${SUNNAH_API_BASE}/collections/${collectionId}/books`,
          { headers: { 'X-API-Key': SUNNAH_API_KEY } },
          15000
        );

        if (response.ok) {
          const apiData = await response.json();
          const apiBooks: SunnahAPIBook[] = apiData.data || [];
          console.log(`[getCollectionBooks] Found ${apiBooks.length} books in API`);
          return apiBooks.map((book) => ({
            bookNumber: parseInt(book.bookNumber),
            bookTitle: book.book.find(b => b.lang === 'eng')?.name || `Book ${book.bookNumber}`,
            bookTitleArabic: book.book.find(b => b.lang === 'ara')?.name,
            hadithCount: book.numberOfHadith || 0,
          }));
        }
      } catch {
        // API unavailable, fall through
      }
    }

    // 5. Default fallback
    console.log('[getCollectionBooks] Using default book list for', collectionId);
    return Array.from({ length: 50 }, (_, i) => ({
      bookNumber: i + 1,
      bookTitle: `Book ${i + 1}`,
      hadithCount: 50,
    }));
  } catch (error) {
    console.warn('[getCollectionBooks] Exception:', error);
    return Array.from({ length: 50 }, (_, i) => ({
      bookNumber: i + 1,
      bookTitle: `Book ${i + 1}`,
      hadithCount: 50,
    }));
  }
}
