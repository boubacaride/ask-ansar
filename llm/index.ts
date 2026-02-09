/**
 * LLM Orchestrator — with streaming support.
 *
 * Strategy: Claude-first + OpenAI fallback. Streaming by default.
 * For list requests with known counts, verify and auto-continue if needed.
 */
import { claudeClient } from './claude';
import { openaiClient } from './openai';
import { detectLanguage } from './languageDetect';
import {
  analyzeCompleteness,
  verifyCompleteness,
  buildContinuationPrompt,
} from './completenessGuard';
import type { LLMClient, LLMResponse, LLMRequestOptions, LLMStreamRequestOptions } from './types';
import { KNOWLEDGE_SOURCES } from '@/app/api/chat';
import type { KnowledgeSource } from '@/types/chat';

export { detectLanguage } from './languageDetect';
export type { LLMResponse } from './types';

// ---------------------------------------------------------------------------
// System prompt builder — concise for speed, detailed only when needed
// ---------------------------------------------------------------------------

function buildSystemPrompt(lang: string, completenessAugmentation: string): string {
  const langMap: Record<string, string> = {
    en: 'Respond in English.',
    fr: 'Réponds en français.',
    ar: 'أجب باللغة العربية.',
  };

  const base = `You are Ansar, an Islamic knowledge assistant. ${langMap[lang] ?? langMap.en}

Rules:
- Cite Quran/Hadith sources with authenticity grades
- Include Arabic text for verses/hadiths with translations
- Be clear, structured, and respectful
- Format with **bold** key terms, numbered lists, and ## headings when appropriate`;

  if (completenessAugmentation) {
    return base + '\n' + completenessAugmentation;
  }
  return base;
}

// ---------------------------------------------------------------------------
// Source matching
// ---------------------------------------------------------------------------

function getRelevantSources(query: string, language: string): KnowledgeSource[] {
  const q = query.toLowerCase();
  const langSources = KNOWLEDGE_SOURCES.filter((s) => s.languages.includes(language));
  const sources: KnowledgeSource[] = [];

  if (/hadith|sunnah|prophet|حديث/.test(q))
    sources.push(...langSources.filter((s) => s.type === 'hadith'));
  if (/quran|verse|surah|قرآن|coran|sourate/.test(q))
    sources.push(...langSources.filter((s) => s.type === 'quran'));
  if (/ruling|halal|haram|حكم|licite|illicite/.test(q))
    sources.push(...langSources.filter((s) => s.type === 'fatwa'));
  if (/scholar|opinion|fatwa|فتوى|savant|avis/.test(q))
    sources.push(...langSources.filter((s) => s.type === 'scholar'));

  if (sources.length === 0) {
    sources.push(...langSources.filter((s) => s.type === 'education' || s.type === 'general'));
  }

  return sources.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Client selection
// ---------------------------------------------------------------------------

function getClients(): LLMClient[] {
  const clients: LLMClient[] = [];
  if (claudeClient.isAvailable()) clients.push(claudeClient);
  if (openaiClient.isAvailable()) clients.push(openaiClient);

  if (clients.length === 0) {
    console.warn(
      '[LLM] No LLM client available.\n' +
      '  - EXPO_PUBLIC_ANTHROPIC_API_KEY: ' + (process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ? 'set but invalid' : 'missing') + '\n' +
      '  - EXPO_PUBLIC_OPENAI_API_KEY: ' + (process.env.EXPO_PUBLIC_OPENAI_API_KEY ? 'set but invalid' : 'missing')
    );
  } else {
    console.log('[LLM] Available clients:', clients.map(c => c.name).join(', '));
  }

  return clients;
}

async function callWithFallback(options: LLMRequestOptions): Promise<LLMResponse> {
  const clients = getClients();
  if (clients.length === 0) {
    throw new Error('No LLM client available. Check API keys.');
  }

  let lastError: unknown;
  for (const client of clients) {
    try {
      return await client.generate(options);
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      console.warn(`[LLM] ${client.name} failed, trying next...`, err?.message);
      lastError = err;
    }
  }
  throw lastError;
}

async function streamWithFallback(options: LLMStreamRequestOptions): Promise<LLMResponse> {
  const clients = getClients();
  if (clients.length === 0) {
    throw new Error('No LLM client available. Check API keys.');
  }

  let lastError: unknown;

  // Phase 1: Try streaming on each client
  for (const client of clients) {
    try {
      if (client.generateStream) {
        console.log(`[LLM] Trying streaming with ${client.name}...`);
        return await client.generateStream(options);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      console.warn(`[LLM] ${client.name} streaming failed:`, err?.message ?? err);
      lastError = err;
    }
  }

  // Phase 2: Streaming failed for all — try non-streaming as final fallback
  console.log('[LLM] All streaming attempts failed. Falling back to non-streaming...');
  for (const client of clients) {
    try {
      console.log(`[LLM] Trying non-streaming with ${client.name}...`);
      const resp = await client.generate(options);
      options.onToken(resp.text);
      return resp;
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      console.warn(`[LLM] ${client.name} non-streaming also failed:`, err?.message ?? err);
      lastError = err;
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Main orchestrator — streaming version (primary API)
// ---------------------------------------------------------------------------

export interface ChatResponse {
  text: string;
  language: string;
  model: string;
  sources: string;
  arabicText?: string;
  translation?: string;
}

/**
 * Stream a chat response. `onToken` is called for each chunk as it arrives.
 * Returns the final complete response when done.
 */
export async function generateChatResponseStream(
  userQuery: string,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const lang = detectLanguage(userQuery);
  const completeness = analyzeCompleteness(userQuery);
  const systemPrompt = buildSystemPrompt(lang, completeness.promptAugmentation);

  // Smart max_tokens: short for simple questions, large for lists
  const maxTokens = completeness.isListRequest
    ? completeness.expectedCount && completeness.expectedCount > 20 ? 8192 : 4096
    : 1500;

  const response = await streamWithFallback({
    systemPrompt,
    userPrompt: userQuery,
    maxTokens,
    temperature: completeness.isListRequest ? 0.3 : 0.5,
    signal,
    onToken,
  });

  // Post-response completeness check for known-count lists
  if (completeness.isListRequest && completeness.expectedCount !== null) {
    const verification = verifyCompleteness(response.text, completeness.expectedCount);

    if (!verification.isComplete && verification.itemCount > 0) {
      const continuationPrompt = buildContinuationPrompt(
        verification.itemCount,
        completeness.expectedCount,
        completeness.label
      );

      try {
        onToken('\n');
        const continuation = await streamWithFallback({
          systemPrompt: buildSystemPrompt(lang, completeness.promptAugmentation),
          userPrompt: continuationPrompt,
          maxTokens: 4096,
          temperature: 0.3,
          signal,
          onToken,
        });

        return {
          text: response.text.trimEnd() + '\n' + continuation.text.trim(),
          language: lang,
          model: `${response.model}+continuation`,
          sources: buildSourceString(userQuery, lang),
        };
      } catch {
        // Return what we have
      }
    }
  }

  return {
    text: response.text,
    language: lang,
    model: response.model,
    sources: buildSourceString(userQuery, lang),
  };
}

/**
 * Non-streaming version (backward compat).
 */
export async function generateChatResponse(
  userQuery: string,
  signal?: AbortSignal
): Promise<ChatResponse> {
  return generateChatResponseStream(userQuery, () => {}, signal);
}

function buildSourceString(query: string, lang: string): string {
  const relevantSources = getRelevantSources(query, lang);
  return relevantSources.length > 0
    ? `Sources : ${relevantSources.map((s) => s.name).join(', ')}`
    : '';
}

// ---------------------------------------------------------------------------
// Offline fallback messages
// ---------------------------------------------------------------------------

export function getOfflineMessage(lang: string, errorHint?: string): string {
  // If no clients are available at all, it's a config issue, not a network issue
  const clients = getClients();
  if (clients.length === 0) {
    const noKeyMsgs: Record<string, string> = {
      en: 'No API key configured. Please add EXPO_PUBLIC_ANTHROPIC_API_KEY or EXPO_PUBLIC_OPENAI_API_KEY to your .env file.',
      fr: 'Aucune clé API configurée. Veuillez ajouter EXPO_PUBLIC_ANTHROPIC_API_KEY ou EXPO_PUBLIC_OPENAI_API_KEY dans votre fichier .env',
      ar: 'لم يتم تكوين مفتاح API. يرجى إضافة EXPO_PUBLIC_ANTHROPIC_API_KEY أو EXPO_PUBLIC_OPENAI_API_KEY في ملف .env',
    };
    return noKeyMsgs[lang] ?? noKeyMsgs.en;
  }

  // If hint mentions 401/403/authentication, it's an auth issue
  if (errorHint && /401|403|auth|unauthorized|invalid.*key/i.test(errorHint)) {
    const authMsgs: Record<string, string> = {
      en: 'API authentication failed. Please check your API keys in the .env file.',
      fr: "Erreur d'authentification API. Veuillez vérifier vos clés API dans le fichier .env",
      ar: 'فشل مصادقة API. يرجى التحقق من مفاتيح API في ملف .env',
    };
    return authMsgs[lang] ?? authMsgs.en;
  }

  const msgs: Record<string, string> = {
    en: 'I apologize, but I am currently unable to connect. Please check your internet connection and try again.',
    fr: "Je m'excuse, mais je ne parviens pas à me connecter. Veuillez vérifier votre connexion internet et réessayer.",
    ar: 'عذراً، لا أستطيع الاتصال حالياً. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
  };
  return msgs[lang] ?? msgs.en;
}
