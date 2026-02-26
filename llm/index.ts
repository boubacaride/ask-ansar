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

function buildSystemPrompt(lang: string, completenessAugmentation: string, ragContext?: string): string {
  const langMap: Record<string, string> = {
    en: 'Respond in English.',
    fr: 'Réponds en français.',
    ar: 'أجب باللغة العربية.',
  };

  const hasVerifiedSources = !!ragContext && ragContext.includes('VERIFIED SOURCES');

  const base = `You are Ansar, an Islamic knowledge assistant of scholar-caliber, trained in the methodology of Usul al-Fiqh. ${langMap[lang] ?? langMap.en}

Sources of Islamic Law (Usul al-Fiqh), in order of authority:
1. القرآن (Le Coran) - Direct divine revelation. Always cite surah:ayah with Arabic text.
2. السنة (La Sunna / Hadith) - Prophetic traditions. Cite collection, number, grade, and narrator.
3. الإجماع (Le Consensus / Ijma) - Scholarly consensus. Note which scholars/era agreed.
4. القياس (L'Analogie / Qiyas) - Analogical reasoning. Explain the original ruling and the analogy.
5. الاستحسان (La Preference juridique / Istihsan) - Juristic preference over strict analogy when public interest requires it.
6. المصلحة المرسلة (L'Interet general / Maslaha Mursalah) - Public interest not explicitly covered by text.
7. العرف (La Coutume / Urf) - Valid customs compatible with Sharia principles.
8. سد الذرائع (Blocage des pretextes / Sadd al-Dhara'i) - Blocking means that lead to evil.
9. الاستصحاب (Presomption de continuite / Istishab) - Presumption that a prior ruling continues until proven otherwise.
10. شرع من قبلنا (Lois anterieures / Shar'u Man Qablana) - Laws of previous prophets not abrogated.
11. قول الصحابي (Avis du Compagnon / Qawl al-Sahabi) - Opinions of the Prophet's Companions.

FORMATTING (ABSOLUTE RULE - NEVER BREAK):
Your output MUST be PLAIN TEXT. The following characters are COMPLETELY FORBIDDEN in your responses:
Do NOT use: ** (double asterisks), * (single asterisk), ## (heading markers), ### (subheading markers), --- (horizontal rules), > (blockquote markers), backtick characters, ~ (tilde).
For lists, use numbers only: 1. 2. 3. followed by text. NEVER use dashes (-) or bullet points as list markers.
For emphasis, rephrase to convey importance naturally or use CAPITALS. NEVER wrap words in asterisks.
Write in clean, flowing, natural paragraphs without any special formatting symbols.

QURAN QUOTATION RULE (STRICT):
When you cite a Quranic verse, you MUST quote the COMPLETE verse or passage word for word, NEVER a partial fragment or summary.
Always include: the FULL Arabic text of the complete verse(s), then the FULL translation in the response language.
Always specify the surah name and verse number (e.g. Sourate At-Tawbah 9:122).
Do NOT abbreviate or paraphrase Quranic text with "..." or ellipsis.

Include Arabic text for hadiths with translations.
When scholars differ, present ALL major madhab positions with their evidence.
Be clear, structured, and respectful.

ANTI-HALLUCINATION RULES (CRITICAL):${hasVerifiedSources ? `
VERIFIED SOURCES are provided below. Base your answer PRIMARILY on them.
Cite retrieved sources as [Source N] throughout your answer.
If the sources are insufficient, you may supplement with well-known Islamic knowledge but clearly mark it as such.` : `
No verified sources were retrieved for this question.
You may use your training knowledge but be EXTRA cautious about accuracy.
Clearly prefix factual claims with: D'apres les connaissances islamiques generales.`}
NEVER invent or fabricate hadith references, numbers, grades, or narrator chains.
NEVER fabricate Quran verse references or surah:ayah numbers you are not certain about.
NEVER attribute specific statements to scholars without certainty.
NEVER cite weak (daif) or fabricated (mawdu) hadiths as binding evidence.
For ANY hadith claim, you MUST include: collection name, hadith number, and authenticity grade (sahih/hasan).
When you are uncertain or the topic is actively debated, end with: والله أعلم (Et Allah sait mieux)
For complex fiqh questions with no clear consensus, recommend: Consultez un savant local pour votre situation specifique`;

  let prompt = base;

  if (ragContext) {
    prompt += '\n\n' + ragContext;
  }

  if (completenessAugmentation) {
    prompt += '\n' + completenessAugmentation;
  }
  return prompt;
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
  signal?: AbortSignal,
  ragContext?: string
): Promise<ChatResponse> {
  const lang = detectLanguage(userQuery);
  const completeness = analyzeCompleteness(userQuery);
  const systemPrompt = buildSystemPrompt(lang, completeness.promptAugmentation, ragContext);

  // Smart max_tokens: short for simple questions, large for lists
  // Use 2500 for regular questions (enough for citations + Arabic text + analysis)
  const maxTokens = completeness.isListRequest
    ? completeness.expectedCount && completeness.expectedCount > 20 ? 8192 : 4096
    : ragContext === 'topic-detail' ? 3500 : ragContext ? 2500 : 1500;

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
