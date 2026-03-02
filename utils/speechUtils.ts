import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  gender?: 'female' | 'male' | 'mishari';
}

// Current sound/audio for stop/cleanup
let currentSound: Audio.Sound | null = null;
let currentAudioEl: HTMLAudioElement | null = null;
let _stopRequested = false; // Flag to interrupt chunked playback

// Mishari TTS backend URL (Coqui XTTS-v2 voice cloning server)
// Update this to your deployed server URL in production
const MISHARI_TTS_URL = process.env.EXPO_PUBLIC_MISHARI_TTS_URL || 'http://localhost:8765';

/**
 * Remove Arabic diacritical marks (tashkeel/harakat) from text.
 * TTS engines handle pronunciation better without explicit diacritics
 * — the diacritics can make the voice sound robotic / non-native.
 * Unicode range: \u0610-\u061A, \u064B-\u065F, \u0670, \u06D6-\u06DC, \u06DF-\u06E4, \u06E7-\u06E8, \u06EA-\u06ED
 */
function stripArabicDiacritics(text: string): string {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED]/g, '');
}

/**
 * Splits text into chunks for TTS URL limits (~200 chars).
 */
function splitTextForTTS(text: string, maxLen = 180): string[] {
  const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return [cleaned];

  const chunks: string[] = [];
  let remaining = cleaned;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let breakIdx = remaining.lastIndexOf(' ', maxLen);
    if (breakIdx <= 0) breakIdx = maxLen;
    chunks.push(remaining.substring(0, breakIdx).trim());
    remaining = remaining.substring(breakIdx).trim();
  }
  return chunks;
}

/**
 * Splits Arabic text into smaller chunks for XTTS-v2 voice cloning.
 * XTTS-v2 quality degrades on long texts — it skips/mispronounces words
 * especially at the end. We split on Arabic sentence boundaries first
 * (۝ verse separator, periods, commas), then by word boundaries.
 * Smaller chunks (~100 chars) produce much more accurate pronunciation.
 */
function splitTextForXTTS(text: string, maxLen = 100): string[] {
  const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return [cleaned];

  // First, try splitting on Arabic verse separators (۝) and sentence punctuation
  const sentenceSplitters = /([۝\u06DD\.،؛\u061B])\s*/;
  const segments = cleaned.split(sentenceSplitters).reduce((acc: string[], part, i, arr) => {
    // Rejoin delimiter with its preceding segment
    if (sentenceSplitters.test(part) && acc.length > 0) {
      acc[acc.length - 1] += part;
    } else if (part.trim()) {
      acc.push(part.trim());
    }
    return acc;
  }, []);

  // Now merge small segments and split large ones
  const chunks: string[] = [];
  let current = '';

  for (const segment of segments) {
    if (segment.length > maxLen) {
      // Flush current buffer first
      if (current.trim()) {
        chunks.push(current.trim());
        current = '';
      }
      // Split oversized segment by word boundary
      let remaining = segment;
      while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
          current = remaining;
          break;
        }
        let breakIdx = remaining.lastIndexOf(' ', maxLen);
        if (breakIdx <= 0) breakIdx = maxLen;
        chunks.push(remaining.substring(0, breakIdx).trim());
        remaining = remaining.substring(breakIdx).trim();
      }
    } else if ((current + ' ' + segment).trim().length > maxLen) {
      // Adding this segment would exceed limit — flush and start new chunk
      if (current.trim()) {
        chunks.push(current.trim());
      }
      current = segment;
    } else {
      current = current ? current + ' ' + segment : segment;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter(c => c.length > 0);
}

/**
 * Build a Google TTS URL for a text chunk.
 * Uses the speech-api/v1/synthesize endpoint which supports CORS for media elements.
 */
function buildTTSUrl(text: string, lang: string, speed: number = 0.5): string {
  const encoded = encodeURIComponent(text);
  return `https://www.google.com/speech-api/v1/synthesize?text=${encoded}&enc=mpeg&lang=${lang}&speed=${speed}&client=lr-language-tts`;
}

/**
 * Main speak function.
 * - Web: HTML5 <audio> element with Google Translate TTS (bypasses CORS/ORB)
 * - Native: expo-av Audio.Sound with Google Translate TTS
 * - Fallback: Web Speech API / expo-speech
 */
export async function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  if (!text || text.trim().length === 0) {
    console.warn('[Speech] Empty text provided');
    return;
  }

  console.log('[Speech] speak() called, platform:', Platform.OS, 'text length:', text.length, 'gender:', options.gender || 'female');
  await stop();

  const lang = options.language || 'ar';
  const langCode = lang.startsWith('ar') ? 'ar' : lang.split('-')[0];

  // Strip Arabic diacritics for Google TTS (more natural sounding)
  // but keep diacritics for Mishari/XTTS-v2 — the model uses them for correct pronunciation
  const isMishari = options.gender === 'mishari';
  const cleanText = (langCode === 'ar' && !isMishari) ? stripArabicDiacritics(text) : text;

  // Speed: 0.3 = slow, 0.5 = medium (default), 0.7 = fast
  const speed = options.rate || 0.5;

  // Voice routing:
  // - 'mishari': Coqui XTTS-v2 voice cloning backend (Mishari Alafasy)
  // - 'male': Google TTS with playbackRate 0.82 (deeper pitch)
  // - 'female': Google TTS with normal playbackRate 1.0
  const isMale = options.gender === 'male';
  const playbackRate = isMale ? 0.82 : 1.0;

  try {
    if (isMishari) {
      // Mishari voice: Coqui XTTS-v2 voice cloning
      console.log('[Speech] Mishari voice: using XTTS-v2 backend...');
      await speakMishariTTS(cleanText, langCode, speed);
      return;
    }

    if (Platform.OS === 'web') {
      await speakWebAudio(cleanText, langCode, speed, playbackRate);
    } else {
      await speakNativeAudio(cleanText, langCode, speed, options, playbackRate);
    }
  } catch (error) {
    console.warn('[Speech] Primary audio failed:', error);
    try {
      // For Mishari voice, fallback to Google TTS with male pitch-shift
      if (isMishari) {
        console.log('[Speech] Mishari TTS failed, falling back to pitch-shifted Google TTS');
        if (Platform.OS === 'web') {
          await speakWebAudio(cleanText, langCode, speed, 0.82);
        } else {
          await speakNativeAudio(cleanText, langCode, speed, options, 0.82);
        }
        return;
      }

      if (Platform.OS === 'web') {
        await speakWebSpeechAPI(cleanText, { ...options, rate: speed });
      } else {
        await speakExpoSpeech(cleanText, { ...options, rate: speed });
      }
    } catch (fallbackError) {
      console.error('[Speech] All methods failed:', fallbackError);
    }
  }
}

// ─── QURAN.COM PRE-RECORDED AUDIO (Mishari Alafasy) ─────────────────

const QURAN_AUDIO_BASE = 'https://verses.quran.com/Alafasy/mp3';

/**
 * Build the quran.com audio URL for a specific verse.
 * Format: https://verses.quran.com/Alafasy/mp3/{SSS}{AAA}.mp3
 * where SSS = 3-digit surah number, AAA = 3-digit ayah number.
 */
function buildVerseAudioUrl(verseRef: string): string {
  const [surah, ayah] = verseRef.split(':').map(Number);
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `${QURAN_AUDIO_BASE}/${s}${a}.mp3`;
}

/**
 * Play pre-recorded Quran recitation (Mishari Alafasy) for a list of verse references.
 * Each verse is played sequentially from quran.com CDN.
 * Used for Quranic duas that have `verseRefs` — replaces TTS for much better quality.
 */
export async function playQuranVerseAudio(verseRefs: string[]): Promise<void> {
  console.log(`[Speech] Quran audio: playing ${verseRefs.length} verse(s) from quran.com`);
  await stop();
  _stopRequested = false;

  for (let i = 0; i < verseRefs.length; i++) {
    if (_stopRequested) {
      console.log('[Speech] Quran audio: stop requested, aborting');
      return;
    }

    const url = buildVerseAudioUrl(verseRefs[i]);
    console.log(`[Speech] Quran verse ${i + 1}/${verseRefs.length}: ${verseRefs[i]} → ${url}`);

    if (Platform.OS === 'web') {
      await playHtmlAudio(url);
    } else {
      // Native: play via expo-av
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 1.0 }
      );
      currentSound = sound;

      await new Promise<void>((resolve) => {
        let resolved = false;
        const done = () => { if (!resolved) { resolved = true; resolve(); } };

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            console.log(`[Speech] Quran verse ${i + 1} finished`);
            done();
          }
          if (!status.isLoaded && (status as any).error) {
            console.warn('[Speech] Quran playback error:', (status as any).error);
            done();
          }
        });

        setTimeout(() => done(), 30000);
      });

      try { await sound.unloadAsync(); } catch (e) { /* ignore */ }
      currentSound = null;
    }
  }

  console.log('[Speech] Quran audio: all verses finished');
}

// ─── MISHARI TTS: Coqui XTTS-v2 voice cloning backend ──────────────

async function speakMishariTTS(text: string, lang: string, speed: number): Promise<void> {
  // Convert speed scale: 0.3 (slow) → 0.7, 0.5 (medium) → 1.0, 0.7 (fast) → 1.4
  const mishariSpeed = speed * 2;

  // Split text into smaller chunks for better XTTS-v2 quality
  // Long texts cause word-skipping and mispronunciation, especially at the end
  const chunks = splitTextForXTTS(text);
  console.log(`[Speech] Mishari TTS: ${chunks.length} chunk(s), speed: ${mishariSpeed}, server: ${MISHARI_TTS_URL}`);

  _stopRequested = false;

  for (let i = 0; i < chunks.length; i++) {
    // Check if stop was requested between chunks
    if (_stopRequested) {
      console.log('[Speech] Mishari TTS: stop requested, aborting remaining chunks');
      return;
    }

    const chunk = chunks[i];
    console.log(`[Speech] Mishari TTS chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

    const response = await fetch(`${MISHARI_TTS_URL}/generate-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: chunk,
        language: lang,
        speed: mishariSpeed,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Mishari TTS server error (${response.status}): ${errorText}`);
    }

    if (_stopRequested) return;

    const audioBlob = await response.blob();
    console.log(`[Speech] Mishari TTS chunk ${i + 1}: received ${audioBlob.size} bytes`);

    if (Platform.OS === 'web') {
      // Web: play blob via HTML5 audio
      const audioUrl = URL.createObjectURL(audioBlob);
      try {
        await playHtmlAudio(audioUrl);
      } finally {
        URL.revokeObjectURL(audioUrl);
      }
    } else {
      // Native: play via expo-av with base64 data URI
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const uri = `data:audio/wav;base64,${base64}`;

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );
      currentSound = sound;

      await new Promise<void>((resolve) => {
        let resolved = false;
        const done = () => { if (!resolved) { resolved = true; resolve(); } };

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            console.log(`[Speech] Mishari TTS chunk ${i + 1} finished`);
            done();
          }
          if (!status.isLoaded && status.error) {
            console.warn('[Speech] Mishari playback error:', status.error);
            done();
          }
        });

        setTimeout(() => done(), 60000);
      });

      try { await sound.unloadAsync(); } catch (e) { /* ignore */ }
      currentSound = null;
    }
  }

  console.log('[Speech] Mishari TTS: all chunks finished');
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // Node.js fallback
  return Buffer.from(buffer).toString('base64');
}

// ─── WEB: HTML5 <audio> element (bypasses CORS/ORB) ────────────────

function speakWebAudio(text: string, lang: string, speed: number, playbackRate: number = 1.0): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    const chunks = splitTextForTTS(text);
    console.log('[Speech] Web audio: playing', chunks.length, 'chunk(s)', 'playbackRate:', playbackRate);

    try {
      for (let i = 0; i < chunks.length; i++) {
        const url = buildTTSUrl(chunks[i], lang, speed);
        console.log('[Speech] Playing chunk', i + 1, '/', chunks.length);

        await playHtmlAudio(url, playbackRate);
      }
      console.log('[Speech] All chunks finished');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function playHtmlAudio(url: string, playbackRate: number = 1.0): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('No document available'));
      return;
    }

    // Clean up previous audio element
    if (currentAudioEl) {
      currentAudioEl.pause();
      currentAudioEl.removeAttribute('src');
      currentAudioEl.load();
      currentAudioEl = null;
    }

    const audio = new window.Audio();
    currentAudioEl = audio;

    let settled = false;
    const finish = (success: boolean, err?: any) => {
      if (settled) return;
      settled = true;
      currentAudioEl = null;
      if (success) resolve();
      else reject(err || new Error('Audio playback failed'));
    };

    audio.onended = () => {
      console.log('[Speech] HTML audio ended');
      finish(true);
    };

    audio.onerror = (e) => {
      console.warn('[Speech] HTML audio error:', audio.error?.message || e);
      finish(false, new Error(audio.error?.message || 'Audio load error'));
    };

    audio.oncanplaythrough = () => {
      // Set playbackRate AFTER load (< 1.0 = deeper/male, 1.0 = normal/female)
      // preservesPitch=false allows pitch to shift with rate change
      audio.playbackRate = playbackRate;
      (audio as any).preservesPitch = false;
      console.log('[Speech] HTML audio ready, playing... playbackRate:', audio.playbackRate);
      audio.play().catch((playErr) => {
        console.warn('[Speech] HTML audio play() rejected:', playErr);
        finish(false, playErr);
      });
    };

    // Do NOT set crossOrigin — the opaque response is fine for audio playback
    audio.src = url;
    audio.load();

    // Safety timeout
    setTimeout(() => finish(true), 30000);
  });
}

// ─── NATIVE: expo-av Audio.Sound ────────────────────────────────────

async function speakNativeAudio(text: string, lang: string, speed: number, options: SpeechOptions, playbackRate: number = 1.0): Promise<void> {
  const chunks = splitTextForTTS(text);
  console.log('[Speech] Native audio: playing', chunks.length, 'chunk(s)', 'playbackRate:', playbackRate);

  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });

  for (let i = 0; i < chunks.length; i++) {
    const url = buildTTSUrl(chunks[i], lang, speed);
    console.log('[Speech] Playing chunk', i + 1, '/', chunks.length);

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: options.volume || 1.0, rate: playbackRate, shouldCorrectPitch: false }
    );
    currentSound = sound;

    await new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => { if (!resolved) { resolved = true; resolve(); } };

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('[Speech] Chunk', i + 1, 'finished');
          done();
        }
        if (!status.isLoaded && status.error) {
          console.warn('[Speech] Playback error:', status.error);
          done();
        }
      });

      setTimeout(() => done(), 30000);
    });

    try { await sound.unloadAsync(); } catch (e) { /* ignore */ }
    currentSound = null;
  }
}

// ─── FALLBACK: Web Speech API ───────────────────────────────────────

function speakWebSpeechAPI(text: string, options: SpeechOptions, preferMale: boolean = false): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      console.warn('[Speech] Web Speech API not available');
      reject(new Error('Web Speech API not available'));
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    try {
      const utterance = new window.SpeechSynthesisUtterance!(text);
      if (options.language) utterance.lang = options.language;

      // Convert Google TTS speed scale (0.3–0.7) to Web Speech API rate (0.6–1.4)
      const webRate = options.rate ? options.rate * 2 : 1.0;
      utterance.rate = webRate;

      const voices = synth.getVoices();
      const arabicVoices = voices.filter((v: any) => v.lang && v.lang.startsWith('ar'));

      if (arabicVoices.length > 0) {
        if (preferMale) {
          // Try to find a male Arabic voice by name
          const maleVoice = arabicVoices.find((v: any) =>
            /male|homme|maged/i.test(v.name) && !/female|femme/i.test(v.name)
          );
          if (maleVoice) {
            utterance.voice = maleVoice;
          } else if (arabicVoices.length > 1) {
            // Use second Arabic voice (often a different gender)
            utterance.voice = arabicVoices[1];
          } else {
            utterance.voice = arabicVoices[0];
          }
          // Lower pitch for more masculine sound
          utterance.pitch = 0.7;
        } else {
          utterance.voice = arabicVoices[0];
        }
      }

      let done = false;
      const finish = (success: boolean, err?: any) => {
        if (!done) {
          done = true;
          if (success) resolve();
          else reject(err || new Error('Speech failed'));
        }
      };

      utterance.onend = () => { console.log('[Speech] WebSpeech onend'); finish(true); };
      utterance.onerror = (e: any) => {
        console.warn('[Speech] WebSpeech error:', e?.error);
        finish(false, new Error(e?.error || 'Speech error'));
      };

      console.log('[Speech] WebSpeech:', preferMale ? 'male' : 'female', 'rate:', webRate);
      synth.speak(utterance);
      setTimeout(() => finish(true), 60000);
    } catch (err) {
      console.error('[Speech] WebSpeech error:', err);
      reject(err);
    }
  });
}

// ─── FALLBACK: expo-speech (native) ─────────────────────────────────

function speakExpoSpeech(text: string, options: SpeechOptions, preferMale: boolean = false): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let voiceId: string | undefined;

      if (preferMale || options.gender === 'male') {
        const voices = await Speech.getAvailableVoicesAsync();
        const arabicVoices = voices.filter(v => v.language?.startsWith('ar'));
        // Try to find a male Arabic voice
        const maleVoice = arabicVoices.find(v =>
          /male|homme|maged/i.test(v.name || v.identifier)
        );
        if (maleVoice) {
          voiceId = maleVoice.identifier;
        } else if (arabicVoices.length > 1) {
          voiceId = arabicVoices[1].identifier;
        } else if (arabicVoices.length > 0) {
          voiceId = arabicVoices[0].identifier;
        }
      }

      // Convert Google TTS speed scale (0.3–0.7) to expo-speech rate (0.6–1.4)
      const speechRate = options.rate ? options.rate * 2 : 1.0;

      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };

      console.log('[Speech] expo-speech:', preferMale ? 'male' : 'female', 'rate:', speechRate, 'voice:', voiceId || 'default');
      Speech.speak(text, {
        language: options.language,
        pitch: preferMale ? 0.7 : options.pitch,
        rate: speechRate,
        voice: voiceId,
        onDone: () => finish(),
        onError: () => finish(),
        onStopped: () => finish(),
      });

      setTimeout(() => finish(), 60000);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Controls ───────────────────────────────────────────────────────

export async function stop(): Promise<void> {
  _stopRequested = true; // Interrupt any chunked playback in progress
  try {
    // Stop HTML audio (web)
    if (currentAudioEl) {
      currentAudioEl.pause();
      currentAudioEl.removeAttribute('src');
      currentAudioEl.load();
      currentAudioEl = null;
    }

    // Stop expo-av sound (native)
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch (e) { /* ignore */ }
      currentSound = null;
    }

    // Stop native TTS
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      await Speech.stop();
    }
  } catch (error) {
    console.error('[Speech] Error in stop:', error);
  }
}

export async function pause(): Promise<void> {
  try {
    if (currentAudioEl) { currentAudioEl.pause(); }
    else if (currentSound) { await currentSound.pauseAsync(); }
    else if (Platform.OS === 'web' && window.speechSynthesis) { window.speechSynthesis.pause(); }
    else { await Speech.pause(); }
  } catch (error) {
    console.error('[Speech] Error in pause:', error);
  }
}

export async function resume(): Promise<void> {
  try {
    if (currentAudioEl) { currentAudioEl.play(); }
    else if (currentSound) { await currentSound.playAsync(); }
    else if (Platform.OS === 'web' && window.speechSynthesis) { window.speechSynthesis.resume(); }
    else { await Speech.resume(); }
  } catch (error) {
    console.error('[Speech] Error in resume:', error);
  }
}

export function isSpeechAvailable(): boolean {
  return true; // Audio playback is always available
}

/**
 * Check if the Mishari TTS backend is available and ready.
 * Returns the health status or null if unreachable.
 */
export async function checkMishariTTSHealth(): Promise<{ model_loaded: boolean; reference_audio_available: boolean } | null> {
  try {
    const response = await fetch(`${MISHARI_TTS_URL}/health`, { method: 'GET' });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAvailableVoices(): Promise<string[]> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        return window.speechSynthesis.getVoices().map((v: any) => v.name);
      }
      return [];
    } else {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.map((v) => v.name || v.identifier);
    }
  } catch (error) {
    return [];
  }
}

// Global type declarations for Web Speech API
declare global {
  interface Window {
    speechSynthesis?: {
      speak: (utterance: any) => void;
      cancel: () => void;
      pause: () => void;
      resume: () => void;
      getVoices: () => any[];
      speaking: boolean;
      paused: boolean;
      pending: boolean;
      addEventListener?: (event: string, handler: () => void, options?: any) => void;
    };
    SpeechSynthesisUtterance?: new (text: string) => any;
    Audio: new () => HTMLAudioElement & { preservesPitch?: boolean };
  }
}
