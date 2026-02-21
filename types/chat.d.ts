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
};