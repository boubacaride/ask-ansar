/** Shape for seed entries — matches the islamic_sources table schema. */
export interface SeedSource {
  source_type: 'quran' | 'hadith' | 'fiqh' | 'aqeedah' | 'seerah' | 'tafsir' | 'general';
  title: string;
  content: string;
  arabic_text?: string;
  french_text?: string;
  english_text?: string;
  reference?: string;
  verse_key?: string;
  book_name?: string;
  narrator?: string;
  hadith_grade?: 'sahih' | 'hasan' | 'daif' | 'mawdu' | 'sahih_li_ghayrihi' | 'hasan_li_ghayrihi';
  chain_of_narration?: string;
  scholar?: string;
  chapter?: string;
  language: string;
}
