import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuranBookmark {
  id: string;
  type: 'mushaf' | 'surah';
  // For mushaf bookmarks
  page?: number;
  surahName?: string;
  surahArabicName?: string;
  // For surah/verse bookmarks
  surahNumber?: number;
  verseNumber?: number;
  // Common
  label?: string;
  createdAt: number;
}

interface LastReadPosition {
  // Mushaf reader position
  mushafPage: number;
  // QuranViewer position
  surahNumber: number | null;
  surahName: string | null;
}

type QuranBookmarkStore = {
  bookmarks: QuranBookmark[];
  lastRead: LastReadPosition;
  addBookmark: (bookmark: Omit<QuranBookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isPageBookmarked: (page: number) => boolean;
  setLastReadMushafPage: (page: number) => void;
  setLastReadSurah: (surahNumber: number, surahName: string) => void;
};

export const useQuranBookmarks = create<QuranBookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      lastRead: {
        mushafPage: 1,
        surahNumber: null,
        surahName: null,
      },
      addBookmark: (bookmark) => {
        const id = `${bookmark.type}-${bookmark.page || bookmark.surahNumber}-${Date.now()}`;
        set((state) => ({
          bookmarks: [
            { ...bookmark, id, createdAt: Date.now() },
            ...state.bookmarks,
          ],
        }));
      },
      removeBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
      },
      isPageBookmarked: (page) => {
        return get().bookmarks.some((b) => b.type === 'mushaf' && b.page === page);
      },
      setLastReadMushafPage: (page) => {
        set((state) => ({
          lastRead: { ...state.lastRead, mushafPage: page },
        }));
      },
      setLastReadSurah: (surahNumber, surahName) => {
        set((state) => ({
          lastRead: { ...state.lastRead, surahNumber, surahName },
        }));
      },
    }),
    {
      name: 'quran-bookmarks-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
