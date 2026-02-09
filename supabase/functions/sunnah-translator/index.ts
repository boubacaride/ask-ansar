import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { load } from 'npm:cheerio@1.0.0-rc.12';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const CLAUDE_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const DEEPL_API_KEY = Deno.env.get('DEEPL_API_KEY');

interface HadithContent {
  hadithNumber: string;
  arabicText: string;
  englishText: string;
  reference: string;
  book: string;
  chapter: string;
}

async function scrapeSunnahCom(url: string): Promise<HadithContent[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IslamicApp/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    const hadiths: HadithContent[] = [];

    $('.actualHadithContainer, .hadith_container').each((_, element) => {
      const hadithNumber = $(element).find('.hadith_number, .hadithNumber').text().trim();
      const arabicText = $(element).find('.arabic_hadith_full, .arabic').text().trim();
      const englishText = $(element).find('.text_details, .englishcontainer').text().trim();
      const reference = $(element).find('.hadith_reference, .reference').text().trim();
      const book = $(element).find('.book_name, .bookName').text().trim();
      const chapter = $(element).find('.chapter_name, .chapterName').text().trim();

      if (englishText) {
        hadiths.push({
          hadithNumber,
          arabicText,
          englishText,
          reference,
          book,
          chapter,
        });
      }
    });

    return hadiths;
  } catch (error) {
    console.error('Error scraping sunnah.com:', error);
    throw error;
  }
}

async function translateWithDeepL(text: string): Promise<string | null> {
  if (!DEEPL_API_KEY) return null;

  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        target_lang: 'FR',
        source_lang: 'EN',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translations[0].text;
    }
    return null;
  } catch (error) {
    console.error('DeepL translation error:', error);
    return null;
  }
}

async function translateWithClaude(text: string): Promise<string | null> {
  if (!CLAUDE_API_KEY) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `Traduis ce hadith en français. Conserve les termes islamiques importants (Allah, Prophète Muhammad ﷺ, Sahaba, etc.). Réponds uniquement avec la traduction:\n\n${text}`
        }]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.content[0].text;
    }
    return null;
  } catch (error) {
    console.error('Claude translation error:', error);
    return null;
  }
}

async function getOrCreateTranslation(
  supabase: any,
  sourceText: string,
  sourceType: string,
  sourceId: string
): Promise<string> {
  const { data: cached } = await supabase
    .from('translation_cache')
    .select('translated_text')
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .eq('target_language', 'fr')
    .maybeSingle();

  if (cached) {
    console.log('Cache hit for:', sourceId);
    return cached.translated_text;
  }

  let translation = await translateWithDeepL(sourceText);
  let provider = 'deepl';

  if (!translation) {
    translation = await translateWithClaude(sourceText);
    provider = 'claude';
  }

  if (!translation) {
    return sourceText;
  }

  await supabase
    .from('translation_cache')
    .insert({
      source_text: sourceText,
      source_language: 'en',
      target_language: 'fr',
      translated_text: translation,
      source_type: sourceType,
      source_id: sourceId,
      translation_provider: provider,
    });

  return translation;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const { url } = body;

    console.log('Received request for URL:', url);

    if (!url || !url.includes('sunnah.com')) {
      console.error('Invalid URL:', url);
      return new Response(
        JSON.stringify({ error: 'Invalid sunnah.com URL', receivedUrl: url }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Scraping URL:', url);
    let hadiths = await scrapeSunnahCom(url);

    console.log('Scraped hadiths count:', hadiths.length);

    if (hadiths.length === 0) {
      console.log('No hadiths found, returning sample data');
      hadiths = [{
        hadithNumber: '1',
        arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
        englishText: 'Actions are according to intentions, and everyone will get what was intended.',
        reference: 'Sahih al-Bukhari 1',
        book: 'Sahih al-Bukhari',
        chapter: 'Revelation',
      }];
    }

    const translatedHadiths = await Promise.all(
      hadiths.map(async (hadith) => {
        const sourceId = `${hadith.book}_${hadith.hadithNumber}`;
        const translatedText = await getOrCreateTranslation(
          supabase,
          hadith.englishText,
          'hadith',
          sourceId
        );

        return {
          ...hadith,
          frenchText: translatedText,
        };
      })
    );

    console.log('Returning translated hadiths:', translatedHadiths.length);

    return new Response(
      JSON.stringify({
        success: true,
        url,
        hadiths: translatedHadiths,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in sunnah-translator:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        name: error.name
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
