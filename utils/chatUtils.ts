import { generateAIResponse, KNOWLEDGE_SOURCES } from '@/app/api/chat';
import { useSettings } from '@/store/settingsStore';
import { supabase } from '@/utils/supabase';
import { ChatMessage, HadithMetadata } from '@/types/chat';

export async function generateResponse(query: string): Promise<{ 
  text: string;
  arabicText?: string;
  translation?: string;
}> {
  const { language } = useSettings.getState();
  
  try {
    // First check if the query is related to Hadith
    if (isHadithQuery(query)) {
      const hadithResponse = await searchHadithDatabase(query);
      if (hadithResponse) {
        return {
          text: formatHadithResponse(hadithResponse),
          arabicText: hadithResponse.arabicText,
          translation: hadithResponse.translation,
        };
      }
    }

    // If no Hadith found or not a Hadith query, proceed with general AI response
    const response = await generateAIResponse(query, language);
    return {
      text: formatAIResponse(response.text),
      arabicText: response.arabicText,
      translation: response.translation,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      text: getErrorMessage(language),
    };
  }
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
  // Remove URL patterns
  text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  
  // Remove "Source:" or "Reference:" lines
  text = text.replace(/\n*(Source|Reference)s?:.*$/gm, '');
  
  // Clean up any double newlines
  text = text.replace(/\n\s*\n/g, '\n\n');
  
  return text.trim();
}

function isHadithQuery(query: string): boolean {
  const hadithKeywords = [
    'hadith',
    'حديث',
    'bukhari',
    'muslim',
    'tirmidhi',
    'abu dawood',
    'ibn majah',
    'sahih',
    'prophet said',
    'messenger of allah',
    'رسول الله',
    'النبي',
    'narrated',
    'reported',
    'authentic',
    'collection',
    'compilation'
  ];

  return hadithKeywords.some(keyword => 
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
        language: 'english'
      })
      .order('metadata->grade', { ascending: false })
      .limit(3);

    if (error || !data || data.length === 0) {
      return null;
    }

    // Sort results by relevance and authenticity
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
        chapter: hadith.metadata.chapter
      },
      arabicText: hadith.original_text,
      translation: hadith.translation
    };
  } catch (error) {
    console.error('Error searching Hadith database:', error);
    return null;
  }
}

function getHadithGradeScore(grade: string = ''): number {
  const grades: { [key: string]: number } = {
    'sahih': 5,
    'صحيح': 5,
    'hasan': 4,
    'حسن': 4,
    'authentic': 5,
    'good': 4,
    'weak': 2,
    'ضعيف': 2,
    'fabricated': 0,
    'موضوع': 0
  };

  const normalizedGrade = grade.toLowerCase();
  for (const [key, score] of Object.entries(grades)) {
    if (normalizedGrade.includes(key)) {
      return score;
    }
  }
  return 1;
}

function getErrorMessage(language: string): string {
  const messages = {
    en: "I apologize, but I encountered an error. Please try again.",
    fr: "Je m'excuse, mais j'ai rencontré une erreur. Veuillez réessayer.",
    ar: "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى."
  };
  return messages[language as keyof typeof messages] || messages.en;
}

export { generateResponse }