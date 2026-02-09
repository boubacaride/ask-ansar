import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

let Speech: any = null;
if (Platform.OS !== 'web') {
  Speech = require('expo-speech');
}

export interface SeerahBookmark {
  id: string;
  user_id: string;
  page_number: number;
  page_title?: string;
  note?: string;
  created_at: string;
}

export interface SeerahNote {
  id: string;
  user_id: string;
  page_number: number;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export interface SeerahPreferences {
  id: string;
  user_id: string;
  last_page_read: number;
  voice_language: string;
  voice_speed: number;
  voice_pitch: number;
  night_mode: boolean;
  updated_at: string;
}

export interface VoiceOption {
  language: string;
  identifier: string;
  name: string;
  quality: string;
}

export interface SeerahEvent {
  id: number;
  year: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  historical_significance: string;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEYS = {
  LAST_PAGE: 'seerah_last_page',
  PREFERENCES: 'seerah_preferences',
};

export const seerahUtils = {
  async getAvailableVoices(): Promise<VoiceOption[]> {
    if (!Speech || Platform.OS === 'web') {
      return [];
    }
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.filter((voice) =>
        voice.language.startsWith('fr-') ||
        voice.language.startsWith('ar-') ||
        voice.language.startsWith('en-')
      );
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  },

  async speak(
    text: string,
    options: {
      language?: string;
      pitch?: number;
      rate?: number;
      onDone?: () => void;
      onError?: (error: any) => void;
    } = {}
  ) {
    if (!Speech || Platform.OS === 'web') {
      console.log('Speech is not available on web platform');
      options.onError?.(new Error('Speech not available on web'));
      return;
    }
    try {
      await Speech.speak(text, {
        language: options.language || 'fr-FR',
        pitch: options.pitch || 1.0,
        rate: options.rate || 1.0,
        onDone: options.onDone,
        onError: options.onError,
      });
    } catch (error) {
      console.error('Error speaking:', error);
      options.onError?.(error);
    }
  },

  async stopSpeaking() {
    if (!Speech || Platform.OS === 'web') {
      return;
    }
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  },

  async pauseSpeaking() {
    if (!Speech || Platform.OS === 'web') {
      return;
    }
    try {
      await Speech.pause();
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  },

  async resumeSpeaking() {
    if (!Speech || Platform.OS === 'web') {
      return;
    }
    try {
      await Speech.resume();
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  },

  async isSpeaking(): Promise<boolean> {
    if (!Speech || Platform.OS === 'web') {
      return false;
    }
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('Error checking if speaking:', error);
      return false;
    }
  },

  async saveLastPage(pageNumber: number, userId?: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_PAGE, pageNumber.toString());

      if (userId) {
        const { error } = await supabase
          .from('seerah_preferences')
          .upsert({
            user_id: userId,
            last_page_read: pageNumber,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (error) {
          console.error('Error saving last page to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error saving last page:', error);
    }
  },

  async getLastPage(userId?: string): Promise<number> {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('seerah_preferences')
          .select('last_page_read')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return data.last_page_read;
        }
      }

      const localPage = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PAGE);
      return localPage ? parseInt(localPage, 10) : 13;
    } catch (error) {
      console.error('Error getting last page:', error);
      return 13;
    }
  },

  async savePreferences(
    preferences: Partial<SeerahPreferences>,
    userId?: string
  ) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(preferences)
      );

      if (userId) {
        const { error } = await supabase
          .from('seerah_preferences')
          .upsert({
            user_id: userId,
            ...preferences,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (error) {
          console.error('Error saving preferences to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  },

  async getPreferences(userId?: string): Promise<Partial<SeerahPreferences>> {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from('seerah_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      }

      const localPrefs = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return localPrefs ? JSON.parse(localPrefs) : {
        voice_language: 'fr-FR',
        voice_speed: 1.0,
        voice_pitch: 1.0,
        night_mode: false,
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {
        voice_language: 'fr-FR',
        voice_speed: 1.0,
        voice_pitch: 1.0,
        night_mode: false,
      };
    }
  },

  async addBookmark(
    pageNumber: number,
    userId: string,
    pageTitle?: string,
    note?: string
  ): Promise<SeerahBookmark | null> {
    try {
      const { data, error } = await supabase
        .from('seerah_bookmarks')
        .insert({
          user_id: userId,
          page_number: pageNumber,
          page_title: pageTitle,
          note: note,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding bookmark:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return null;
    }
  },

  async getBookmarks(userId: string): Promise<SeerahBookmark[]> {
    try {
      const { data, error } = await supabase
        .from('seerah_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting bookmarks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  },

  async deleteBookmark(bookmarkId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('seerah_bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) {
        console.error('Error deleting bookmark:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }
  },

  async checkBookmarkExists(userId: string, pageNumber: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('seerah_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('page_number', pageNumber)
        .maybeSingle();

      if (error) {
        console.error('Error checking bookmark:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  },

  getArchiveUrl(pageNumber: number): string {
    return `https://archive.org/details/le-nectar-cachete-ar-raheeq-al-makhtoum-la-biographie-du-prophete-www.-the-choice.one/page/${pageNumber}/mode/1up`;
  },

  getArchiveEmbedUrl(pageNumber: number): string {
    return `https://archive.org/embed/le-nectar-cachete-ar-raheeq-al-makhtoum-la-biographie-du-prophete-www.-the-choice.one?page=${pageNumber}`;
  },

  async addNote(
    pageNumber: number,
    noteText: string,
    userId: string
  ): Promise<SeerahNote | null> {
    try {
      const { data, error } = await supabase
        .from('seerah_notes')
        .insert({
          user_id: userId,
          page_number: pageNumber,
          note_text: noteText,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding note:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  },

  async updateNote(
    noteId: string,
    noteText: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('seerah_notes')
        .update({
          note_text: noteText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) {
        console.error('Error updating note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  },

  async getNotes(userId: string): Promise<SeerahNote[]> {
    try {
      const { data, error } = await supabase
        .from('seerah_notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error getting notes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('seerah_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  getTableOfContents() {
    return [
      { title: 'Introduction', page: 13 },
      { title: 'Préface', page: 15 },
      { title: "L'Arabie avant la mission prophétique", page: 20 },
      { title: 'La généalogie et la famille', page: 35 },
      { title: 'La naissance et la petite enfance', page: 45 },
      { title: "L'enfance et la jeunesse", page: 55 },
      { title: 'Le mariage avec Khadija', page: 65 },
      { title: 'Les débuts de la révélation', page: 75 },
      { title: 'Les premières étapes de la mission', page: 85 },
      { title: "L'appel public à l'Islam", page: 95 },
      { title: 'La persécution des musulmans', page: 110 },
      { title: "L'émigration en Abyssinie", page: 125 },
      { title: "Le boycott et l'année de la tristesse", page: 140 },
      { title: "L'Hégire vers Médine", page: 160 },
      { title: 'La construction de la société musulmane', page: 180 },
      { title: 'Les batailles et expéditions', page: 200 },
      { title: 'La conquête de La Mecque', page: 350 },
      { title: 'Le pèlerinage d\'adieu', page: 400 },
      { title: 'La maladie et le décès', page: 430 },
    ];
  },

  async getSeerahEvents(): Promise<SeerahEvent[]> {
    try {
      const { data, error } = await supabase
        .from('seerah_events')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching seerah events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching seerah events:', error);
      return [];
    }
  },
};
