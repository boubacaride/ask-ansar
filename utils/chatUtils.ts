import { generateChatResponseStream, getOfflineMessage, detectLanguage } from '@/llm';
import { validateResponse } from '@/llm/responseValidator';
import { supabase } from '@/utils/supabase';
import { processQuery, writeSemanticCache, classifyQuestion } from '@/utils/ragPipeline';
import type { ChatMessage, HadithMetadata, SourceBadge } from '@/types/chat';

// Utility function to limit and filter images in conversation messages
interface Message {
  role: string;
  content: string | Array<{ type: string; [key: string]: any }>;
}

export function limitImagesInConversation(messages: Message[], maxImages: number = 95): Message[] {
  let imageCount = 0;
  const processedMessages: Message[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];

    if (Array.isArray(message.content)) {
      const filteredContent = message.content.filter((block) => {
        if (block.type === 'image') {
          if (imageCount >= maxImages) {
            return false;
          }
          imageCount++;
          return true;
        }
        return true;
      });

      if (filteredContent.length > 0) {
        processedMessages.unshift({
          ...message,
          content: filteredContent,
        });
      }
    } else {
      processedMessages.unshift(message);
    }
  }

  return processedMessages;
}

/**
 * Strip markdown characters from text — used both during streaming and on final text.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')               // **bold** → bold
    .replace(/(?<!\w)\*([^*\n]+?)\*(?!\w)/g, '$1')  // *italic* → italic
    .replace(/^#{1,4}\s+/gm, '')                     // ## heading → heading
    .replace(/^>\s*/gm, '')                           // > blockquote → text
    .replace(/^[-*_]{3,}\s*$/gm, '')                  // --- rules → remove
    .replace(/\s*—\s*/g, ', ')                        // em-dash → comma
    .replace(/\s*–\s*/g, ' - ')                       // en-dash → dash
    .replace(/`([^`]+)`/g, '$1');                     // `code` → code
}

/**
 * Creates a streaming-safe onToken wrapper that strips markdown in real-time.
 * Accumulates text, cleans it, and only emits the clean delta to the original callback.
 */
function createCleanStreamingCallback(originalOnToken: (token: string) => void) {
  let rawAccumulated = '';
  let lastCleanLength = 0;

  return (token: string) => {
    rawAccumulated += token;
    const cleaned = stripMarkdown(rawAccumulated);
    // Only emit the new clean characters since last flush
    if (cleaned.length > lastCleanLength) {
      const delta = cleaned.slice(lastCleanLength);
      originalOnToken(delta);
      lastCleanLength = cleaned.length;
    }
  };
}

/**
 * Streaming response generator with RAG pipeline.
 * Flow: embed → cache check → source search → LLM with context → cache write.
 * Falls back gracefully to the existing LLM flow if RAG fails.
 */
export async function generateResponseStream(
  query: string,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<{
  text: string;
  arabicText?: string;
  translation?: string;
  sources?: SourceBadge[];
}> {
  try {
    // Step 1: Run RAG pipeline (embed + cache check + source search)
    const ragResult = await processQuery(query);

    // Step 2: If semantic cache hit, return instantly (already clean from cache)
    if (ragResult.cacheHit && ragResult.cachedAnswer) {
      onToken(ragResult.cachedAnswer);
      return {
        text: ragResult.cachedAnswer,
        sources: ragResult.cachedSources ?? ragResult.sources,
      };
    }

    // Step 3: Legacy hadith search fallback when RAG found no sources
    if (ragResult.sources.length === 0 && isHadithQuery(query)) {
      const hadithResponse = await searchHadithDatabase(query);
      if (hadithResponse) {
        const formatted = formatHadithResponse(hadithResponse);
        onToken(formatted);
        return {
          text: formatted,
          arabicText: hadithResponse.arabicText,
          translation: hadithResponse.translation,
          sources: [{
            type: 'hadith',
            label: hadithResponse.hadithMetadata.book,
            reference: `${hadithResponse.hadithMetadata.book} #${hadithResponse.hadithMetadata.number}`,
            grade: hadithResponse.hadithMetadata.grade,
            gradeColor: getGradeColor(hadithResponse.hadithMetadata.grade),
          }],
        };
      }
    }

    // Step 4: LLM generation with RAG context
    // Wrap onToken to strip markdown in real-time during streaming
    const cleanOnToken = createCleanStreamingCallback(onToken);

    const response = await generateChatResponseStream(
      query,
      cleanOnToken,
      signal,
      ragResult.context || undefined,
    );

    const cleanedText = formatAIResponse(response.text);

    // Step 5: Validate response (anti-hallucination guard)
    const category = classifyQuestion(query);
    const avgSimilarity = ragResult.sources.length > 0
      ? ragResult.sources.reduce((sum, s) => sum + (s.similarity ?? 0), 0) / ragResult.sources.length
      : 0;

    const validation = validateResponse(
      cleanedText,
      ragResult.sources.length,
      avgSimilarity,
      category,
    );

    const finalText = validation.text;

    // Log warnings for monitoring / debugging
    if (validation.warnings.length > 0) {
      console.warn('[RAG-Validator] Warnings:', validation.warnings);
    }
    if (validation.confidence === 'low') {
      console.info(`[RAG-Validator] Low-confidence answer for: "${query.slice(0, 80)}..."`);
    }

    // If the validator appended a disclaimer, stream it to the user
    if (finalText.length > cleanedText.length) {
      const appendedText = finalText.slice(cleanedText.length);
      onToken(appendedText);
    }

    // Step 6: Write to semantic cache in background (only medium+ confidence)
    if (ragResult.embedding && finalText && validation.confidence !== 'low') {
      const lang = detectLanguage(query);
      writeSemanticCache(
        ragResult.embedding,
        query,
        finalText,
        ragResult.sources,
        lang,
      ).catch(() => {});
    }

    return {
      text: finalText,
      arabicText: response.arabicText,
      translation: response.translation,
      sources: ragResult.sources.length > 0 ? ragResult.sources : undefined,
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error;
    console.error('Error generating response:', error);
    const lang = detectLanguage(query);
    const errorHint = error?.message ?? String(error);
    const msg = getOfflineMessage(lang, errorHint);
    onToken(msg);
    return { text: msg };
  }
}

/**
 * Non-streaming version (backward compat).
 */
export async function generateResponse(
  query: string,
  signal?: AbortSignal
): Promise<{
  text: string;
  arabicText?: string;
  translation?: string;
  sources?: SourceBadge[];
}> {
  return generateResponseStream(query, () => {}, signal);
}

function formatHadithResponse(response: any): string {
  let formattedText = response.text;

  if (response.hadithMetadata) {
    const { book, number, grade } = response.hadithMetadata;
    formattedText = `${formattedText}\n\nNarrated in ${book}${number ? ` #${number}` : ''}${grade ? ` (${grade})` : ''}`;
  }

  return formattedText;
}

function formatAIResponse(text: string): string {
  // Remove URLs
  text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  // Remove trailing source/reference lines
  text = text.replace(/\n*(Source|Reference)s?:.*$/gm, '');

  // Strip markdown formatting characters
  // Remove heading markers: ## or ### at start of line
  text = text.replace(/^#{1,4}\s+/gm, '');
  // Remove bold markers: **text** → text
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  // Remove italic markers: *text* → text (but not mid-word asterisks)
  text = text.replace(/(?<!\w)\*([^*\n]+?)\*(?!\w)/g, '$1');
  // Remove blockquote markers: > at start of line
  text = text.replace(/^>\s*/gm, '');
  // Remove horizontal rules: --- or *** or ___
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');
  // Replace em-dashes (—) with commas
  text = text.replace(/\s*—\s*/g, ', ');
  // Replace en-dashes (–) with simple dashes
  text = text.replace(/\s*–\s*/g, ' - ');
  // Remove backtick code markers: `text` → text
  text = text.replace(/`([^`]+)`/g, '$1');

  // Clean up excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function isHadithQuery(query: string): boolean {
  const hadithKeywords = [
    'hadith', 'حديث', 'bukhari', 'muslim', 'tirmidhi',
    'abu dawood', 'ibn majah', 'sahih', 'prophet said',
    'messenger of allah', 'رسول الله', 'النبي',
    'narrated', 'reported', 'authentic', 'collection', 'compilation',
  ];

  return hadithKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );
}

async function searchHadithDatabase(query: string): Promise<{
  text: string;
  hadithMetadata: HadithMetadata;
  arabicText?: string;
  translation: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('islamic_content')
      .select('*')
      .eq('type', 'hadith')
      .textSearch('content', query, {
        config: 'english',
        type: 'websearch',
        language: 'english',
      })
      .order('metadata->grade', { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) {
      return null;
    }

    const sortedResults = data.sort((a, b) => {
      const gradeA = getHadithGradeScore(a.metadata?.grade);
      const gradeB = getHadithGradeScore(b.metadata?.grade);
      return gradeB - gradeA;
    });

    const hadith = sortedResults[0];

    return {
      text: hadith.content,
      hadithMetadata: {
        book: hadith.metadata.book,
        number: hadith.metadata.reference,
        grade: hadith.metadata.grade,
        narrator: hadith.metadata.narrator,
        chapter: hadith.metadata.chapter,
      },
      arabicText: hadith.original_text,
      translation: hadith.translation,
    };
  } catch (error) {
    console.error('Error searching Hadith database:', error);
    return null;
  }
}

function getHadithGradeScore(grade: string = ''): number {
  const grades: Record<string, number> = {
    sahih: 5, 'صحيح': 5, hasan: 4, 'حسن': 4,
    authentic: 5, good: 4, weak: 2, 'ضعيف': 2,
    fabricated: 0, 'موضوع': 0,
  };

  const normalizedGrade = grade.toLowerCase();
  for (const [key, score] of Object.entries(grades)) {
    if (normalizedGrade.includes(key)) return score;
  }
  return 1;
}

function getGradeColor(grade?: string): string | undefined {
  if (!grade) return undefined;
  const colors: Record<string, string> = {
    sahih: '#10B981',
    hasan: '#F59E0B',
    authentic: '#10B981',
    good: '#F59E0B',
  };
  const g = grade.toLowerCase();
  for (const [key, color] of Object.entries(colors)) {
    if (g.includes(key)) return color;
  }
  return undefined;
}

export { generateResponse as default };
