import { generateChatResponseStream, getOfflineMessage, detectLanguage } from '@/llm';
import { useSettings } from '@/store/settingsStore';
import { supabase } from '@/utils/supabase';
import { ChatMessage, HadithMetadata } from '@/types/chat';

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
 * Streaming response generator. Calls `onToken` for each chunk.
 * Returns the final complete response.
 */
export async function generateResponseStream(
  query: string,
  onToken: (token: string) => void,
  signal?: AbortSignal
): Promise<{
  text: string;
  arabicText?: string;
  translation?: string;
}> {
  try {
    // First check if the query is related to Hadith
    if (isHadithQuery(query)) {
      const hadithResponse = await searchHadithDatabase(query);
      if (hadithResponse) {
        const formatted = formatHadithResponse(hadithResponse);
        onToken(formatted);
        return {
          text: formatted,
          arabicText: hadithResponse.arabicText,
          translation: hadithResponse.translation,
        };
      }
    }

    // Use the streaming LLM orchestrator
    const response = await generateChatResponseStream(query, onToken, signal);
    return {
      text: formatAIResponse(response.text),
      arabicText: response.arabicText,
      translation: response.translation,
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
  text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  text = text.replace(/\n*(Source|Reference)s?:.*$/gm, '');
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

export { generateResponse as default };
