import { Platform } from 'react-native';

// Conditionally import expo-av for native platforms
let Audio: any;
if (Platform.OS !== 'web') {
  Audio = require('expo-av').Audio;
}

export interface QuranAudioPlayer {
  load: (surahNumber: number, verseNumber: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  isPlaying: () => boolean;
  isLoading: () => boolean;
  onEnded: (callback: () => void) => void;
  onError: (callback: (error: string) => void) => void;
  cleanup: () => void;
}

// ─── Web Audio Player (HTMLAudioElement) ───────────────────────────

class WebAudioPlayer implements QuranAudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private _isLoading = false;
  private _isPlaying = false;
  private onEndedCallback?: () => void;
  private onErrorCallback?: (error: string) => void;

  async load(surahNumber: number, verseNumber: number): Promise<void> {
    this._isLoading = true;
    this.stop();

    return new Promise((resolve, reject) => {
      try {
        const paddedSurah = String(surahNumber).padStart(3, '0');
        const paddedVerse = String(verseNumber).padStart(3, '0');
        const audioUrl = `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${paddedSurah}${paddedVerse}.mp3`;

        this.audio = new window.Audio(audioUrl);
        this.audio.preload = 'auto';
        this.audio.crossOrigin = 'anonymous';

        this.audio.addEventListener('ended', () => {
          this._isPlaying = false;
          if (this.onEndedCallback) {
            this.onEndedCallback();
          }
        });

        this.audio.addEventListener('error', (e) => {
          this._isLoading = false;
          this._isPlaying = false;
          const errorMsg = "Erreur lors du chargement de l'audio";
          console.error('Audio loading error:', e, audioUrl);
          if (this.onErrorCallback) {
            this.onErrorCallback(errorMsg);
          }
          reject(new Error(errorMsg));
        });

        this.audio.addEventListener(
          'canplaythrough',
          () => {
            this._isLoading = false;
            resolve();
          },
          { once: true }
        );

        this.audio.addEventListener('loadeddata', () => {
          this._isLoading = false;
        });

        this.audio.load();
      } catch (error) {
        this._isLoading = false;
        const errorMsg = "Erreur lors du chargement de l'audio";
        console.error('Audio load error:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(errorMsg);
        }
        reject(error);
      }
    });
  }

  async play(): Promise<void> {
    if (!this.audio) {
      const errorMsg = 'Audio not loaded';
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMsg);
      }
      throw new Error(errorMsg);
    }

    try {
      if (this.audio.readyState < 2) {
        await new Promise<void>((resolve, reject) => {
          const onCanPlay = () => {
            this.audio?.removeEventListener('canplay', onCanPlay);
            this.audio?.removeEventListener('error', onError);
            resolve();
          };
          const onError = () => {
            this.audio?.removeEventListener('canplay', onCanPlay);
            this.audio?.removeEventListener('error', onError);
            reject(new Error('Audio failed to load'));
          };
          this.audio?.addEventListener('canplay', onCanPlay);
          this.audio?.addEventListener('error', onError);
        });
      }

      await this.audio.play();
      this._isPlaying = true;
    } catch (error) {
      this._isPlaying = false;
      const errorMsg = "Erreur lors de la lecture de l'audio";
      console.error('Audio play error:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMsg);
      }
      throw error;
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this._isPlaying = false;
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this._isPlaying = false;
    }
  }

  isPlaying(): boolean {
    return this._isPlaying;
  }

  isLoading(): boolean {
    return this._isLoading;
  }

  onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  cleanup(): void {
    this.stop();
    if (this.audio) {
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    this.onEndedCallback = undefined;
    this.onErrorCallback = undefined;
  }
}

// ─── Native Audio Player (expo-av) ────────────────────────────────

class NativeAudioPlayer implements QuranAudioPlayer {
  private sound: any = null; // Audio.Sound
  private _isLoading = false;
  private _isPlaying = false;
  private onEndedCallback?: () => void;
  private onErrorCallback?: (error: string) => void;

  async load(surahNumber: number, verseNumber: number): Promise<void> {
    this._isLoading = true;
    await this.cleanupSound();

    try {
      const paddedSurah = String(surahNumber).padStart(3, '0');
      const paddedVerse = String(verseNumber).padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${paddedSurah}${paddedVerse}.mp3`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        (status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            this._isPlaying = false;
            this.onEndedCallback?.();
          }
          if (!status.isLoaded && status.error) {
            this._isLoading = false;
            this._isPlaying = false;
            this.onErrorCallback?.(status.error);
          }
        }
      );

      this.sound = sound;
      this._isLoading = false;
    } catch (error) {
      this._isLoading = false;
      const errorMsg = "Erreur lors du chargement de l'audio";
      console.error('Native audio load error:', error);
      this.onErrorCallback?.(errorMsg);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (!this.sound) {
      const errorMsg = 'Audio not loaded';
      this.onErrorCallback?.(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      await this.sound.playAsync();
      this._isPlaying = true;
    } catch (error) {
      this._isPlaying = false;
      const errorMsg = "Erreur lors de la lecture de l'audio";
      console.error('Native audio play error:', error);
      this.onErrorCallback?.(errorMsg);
      throw error;
    }
  }

  pause(): void {
    if (this.sound) {
      this.sound.pauseAsync().catch(console.error);
      this._isPlaying = false;
    }
  }

  stop(): void {
    if (this.sound) {
      this.sound.stopAsync().catch(console.error);
      this._isPlaying = false;
    }
  }

  isPlaying(): boolean {
    return this._isPlaying;
  }

  isLoading(): boolean {
    return this._isLoading;
  }

  onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  cleanup(): void {
    this.cleanupSound().catch(console.error);
    this.onEndedCallback = undefined;
    this.onErrorCallback = undefined;
  }

  private async cleanupSound(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (e) {
        console.error('Error unloading sound:', e);
      }
      this.sound = null;
      this._isPlaying = false;
    }
  }
}

// ─── Factory & Initialization ─────────────────────────────────────

let audioPlayerInstance: QuranAudioPlayer | null = null;
let audioModeInitialized = false;

/**
 * Initialize audio mode for native platforms.
 * Must be called once before any audio playback on iOS/Android.
 * Enables playback in silent mode on iOS.
 */
export async function initializeAudioMode(): Promise<void> {
  if (audioModeInitialized || Platform.OS === 'web') return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioModeInitialized = true;
  } catch (error) {
    console.error('Failed to initialize audio mode:', error);
  }
}

export function getQuranAudioPlayer(): QuranAudioPlayer {
  if (!audioPlayerInstance) {
    audioPlayerInstance =
      Platform.OS === 'web' ? new WebAudioPlayer() : new NativeAudioPlayer();
  }
  return audioPlayerInstance;
}

export function cleanupQuranAudioPlayer(): void {
  if (audioPlayerInstance) {
    audioPlayerInstance.cleanup();
    audioPlayerInstance = null;
  }
}
