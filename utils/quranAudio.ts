import { Platform } from 'react-native';

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

        this.audio = new Audio(audioUrl);
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
          const errorMsg = 'Erreur lors du chargement de l\'audio';
          console.error('Audio loading error:', e, audioUrl);
          if (this.onErrorCallback) {
            this.onErrorCallback(errorMsg);
          }
          reject(new Error(errorMsg));
        });

        this.audio.addEventListener('canplaythrough', () => {
          this._isLoading = false;
          resolve();
        }, { once: true });

        this.audio.addEventListener('loadeddata', () => {
          this._isLoading = false;
        });

        this.audio.load();
      } catch (error) {
        this._isLoading = false;
        const errorMsg = 'Erreur lors du chargement de l\'audio';
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
      const errorMsg = 'Erreur lors de la lecture de l\'audio';
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

let audioPlayerInstance: QuranAudioPlayer | null = null;

export function getQuranAudioPlayer(): QuranAudioPlayer {
  if (!audioPlayerInstance) {
    if (Platform.OS === 'web') {
      audioPlayerInstance = new WebAudioPlayer();
    } else {
      audioPlayerInstance = new WebAudioPlayer();
    }
  }
  return audioPlayerInstance;
}

export function cleanupQuranAudioPlayer(): void {
  if (audioPlayerInstance) {
    audioPlayerInstance.cleanup();
    audioPlayerInstance = null;
  }
}
