import OpenAI from 'openai';
import { KnowledgeSource } from '@/types/chat';

const createOpenAIClient = () => {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key is missing. Using fallback responses.');
    return null;
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

const openai = createOpenAIClient();

export const WELCOME_MESSAGE = "Assalamou alaykoum wa rahmatoullah wa barakatouh, posez vos questions à Ansar Voyage.";

export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    name: 'HadeethEnc',
    url: 'https://hadeethenc.com',
    type: 'hadith',
    languages: ['en', 'ar'],
  },
  {
    name: 'QuranExplorer',
    url: 'https://www.quranexplorer.com/quran',
    type: 'quran',
    languages: ['en', 'ar'],
  },
  {
    name: 'IslamQA (English)',
    url: 'https://islamqa.info/en',
    type: 'fatwa',
    languages: ['en'],
  },
  {
    name: 'IslamQA (French)',
    url: 'https://islamqa.info/fr',
    type: 'fatwa',
    languages: ['fr'],
  },
  {
    name: 'Siyar',
    url: 'https://siyar.fr',
    type: 'education',
    languages: ['fr'],
  },
  {
    name: 'IslamWeb',
    url: 'https://www.islamweb.net',
    type: 'general',
    languages: ['en', 'ar'],
  },
  {
    name: 'Maison Islam',
    url: 'https://www.maison-islam.com',
    type: 'education',
    languages: ['fr'],
  },
  {
    name: 'Islamophile',
    url: 'http://islamophile.org',
    type: 'education',
    languages: ['fr'],
  },
  {
    name: 'Mashhoor',
    url: 'https://www.mashhoor.net',
    type: 'scholar',
    languages: ['ar'],
  },
  {
    name: 'Bin Othaimeen',
    url: 'https://binothaimeen.net',
    type: 'scholar',
    languages: ['ar'],
  },
  {
    name: 'Al Mosleh',
    url: 'https://www.almosleh.com',
    type: 'scholar',
    languages: ['ar'],
  },
  {
    name: 'IslamiCity',
    url: 'https://www.islamicity.org',
    type: 'general',
    languages: ['en', 'ar'],
  },
];

export async function generateAIResponse(prompt: string, language: string = 'en') {
  if (!openai) {
    return {
      text: getOfflineResponse(language),
      source: "Local Knowledge Base"
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an Islamic knowledge assistant specializing in providing accurate information from authentic sources. Your responses should:

1. Be based on authentic Islamic sources including:
- Quran (via QuranExplorer)
- Hadith collections (primarily from HadeethEnc)
- Scholarly works and fatwas (from IslamQA, IslamWeb)
- Educational resources (from Siyar.fr, Maison-Islam)
- Contemporary scholar opinions (from verified sources)

2. Follow these guidelines:
- Always cite sources for Quranic verses and Hadiths
- Mention the authenticity grade for Hadiths (sahih, hasan, etc.)
- Provide complete references (book, chapter, number)
- Use respectful and clear language
- Avoid speculation or personal interpretation
- Recommend consulting local scholars for complex issues

3. Format responses with:
- Clear structure and headings
- Original Arabic text when relevant
- Translations in the requested language
- References to multiple sources when available

4. Language preferences:
- Respond in the user's preferred language (${language})
- Include Arabic text for Quran and Hadith
- Provide translations for all Arabic text

Remember to maintain utmost accuracy and respect when discussing Islamic topics.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content || getOfflineResponse(language);
    const relevantSources = getRelevantSources(prompt, language);

    return {
      text: response,
      source: `Sources: ${relevantSources.map(s => s.name).join(', ')}\nFor more information, visit: ${relevantSources.map(s => s.url).join(', ')}`
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      text: getOfflineResponse(language),
      source: "Error Handler"
    };
  }
}

function getOfflineResponse(language: string): string {
  const responses = {
    en: "I apologize, but I'm currently operating in offline mode. Please try again later or consult the provided Islamic resources directly.",
    fr: "Je m'excuse, mais je fonctionne actuellement en mode hors ligne. Veuillez réessayer plus tard ou consulter directement les ressources islamiques fournies.",
    ar: "عذراً، أنا أعمل حالياً في وضع عدم الاتصال. يرجى المحاولة مرة أخرى لاحقاً أو الرجوع مباشرة إلى المصادر الإسلامية المتوفرة."
  };
  return responses[language as keyof typeof responses] || responses.en;
}

function getRelevantSources(query: string, language: string): KnowledgeSource[] {
  const normalizedQuery = query.toLowerCase();
  const sources: KnowledgeSource[] = [];

  // Filter sources by language
  const languageSpecificSources = KNOWLEDGE_SOURCES.filter(
    source => source.languages.includes(language)
  );

  // Add Hadith sources for hadith-related queries
  if (normalizedQuery.includes('hadith') || normalizedQuery.includes('sunnah') || 
      normalizedQuery.includes('prophet') || normalizedQuery.includes('حديث')) {
    sources.push(...languageSpecificSources.filter(s => s.type === 'hadith'));
  }

  // Add Quran sources for Quran-related queries
  if (normalizedQuery.includes('quran') || normalizedQuery.includes('verse') || 
      normalizedQuery.includes('surah') || normalizedQuery.includes('قرآن')) {
    sources.push(...languageSpecificSources.filter(s => s.type === 'quran'));
  }

  // Add Fatwa sources for legal/ruling queries
  if (normalizedQuery.includes('ruling') || normalizedQuery.includes('halal') || 
      normalizedQuery.includes('haram') || normalizedQuery.includes('حكم')) {
    sources.push(...languageSpecificSources.filter(s => s.type === 'fatwa'));
  }

  // Add scholar sources for scholarly opinions
  if (normalizedQuery.includes('scholar') || normalizedQuery.includes('opinion') || 
      normalizedQuery.includes('fatwa') || normalizedQuery.includes('فتوى')) {
    sources.push(...languageSpecificSources.filter(s => s.type === 'scholar'));
  }

  // If no specific sources are found, return general educational sources
  if (sources.length === 0) {
    sources.push(...languageSpecificSources.filter(s => 
      s.type === 'education' || s.type === 'general'
    ));
  }

  // Return a maximum of 3 most relevant sources
  return sources.slice(0, 3);
}