export type KnowledgeSource = {
  name: string;
  url: string;
  type: 'hadith' | 'quran' | 'fatwa' | 'education' | 'scholar' | 'general';
  languages: string[];
};

export type HadithMetadata = {
  book: string;
  number: string;
  grade?: string;
  narrator?: string;
  chapter?: string;
};

export type SourceBadge = {
  type: 'quran' | 'hadith' | 'fiqh' | 'aqeedah' | 'seerah' | 'tafsir' | 'general';
  label: string;
  reference?: string;
  grade?: string;
  gradeColor?: string;
  verseKey?: string;
  similarity?: number;
};

export type RAGResult = {
  context: string;
  sources: SourceBadge[];
  cacheHit: boolean;
  cachedAnswer?: string;
  cachedSources?: SourceBadge[];
  embedding: number[] | null;
};

export type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  source?: string;
  language?: string;
  hadithMetadata?: HadithMetadata;
  arabicText?: string;
  translation?: string;
  sources?: SourceBadge[];
  fromCache?: boolean;
};
