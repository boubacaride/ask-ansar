import { cheerio } from "npm:cheerio@1.0.0-rc.12";
import { throttle } from "npm:lodash@4.17.21";

const HADITH_SOURCES = {
  AHADITH_UK: 'https://ahadith.co.uk',
  HADITH_COLLECTION: 'https://hadithcollection.com'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiting configuration
const REQUESTS_PER_SECOND = 1;
const DELAY_BETWEEN_REQUESTS = 1000 / REQUESTS_PER_SECOND;

const throttledFetch = throttle(async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; IslamicContentBot/1.0)',
    },
  });
  return response;
}, DELAY_BETWEEN_REQUESTS);

async function scrapeAhadithUK(url: string) {
  try {
    const response = await throttledFetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const hadithData = [];

    $('.hadith-box').each((_, element) => {
      const hadith = {
        text: $(element).find('.arabic-text').text().trim(),
        translation: $(element).find('.english-text').text().trim(),
        reference: $(element).find('.reference').text().trim(),
        grade: $(element).find('.grade').text().trim(),
        narrator: $(element).find('.narrator').text().trim(),
        book: $(element).find('.book-name').text().trim(),
        chapter: $(element).find('.chapter').text().trim(),
        url: url
      };
      hadithData.push(hadith);
    });

    return hadithData;
  } catch (error) {
    console.error('Error scraping Ahadith UK:', error);
    return [];
  }
}

async function scrapeHadithCollection(url: string) {
  try {
    const response = await throttledFetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const hadithData = [];

    $('.hadith-container').each((_, element) => {
      const hadith = {
        text: $(element).find('.arabic').text().trim(),
        translation: $(element).find('.translation').text().trim(),
        reference: $(element).find('.reference').text().trim(),
        grade: $(element).find('.authenticity').text().trim(),
        narrator: $(element).find('.narrator').text().trim(),
        book: $(element).find('.collection').text().trim(),
        chapter: $(element).find('.chapter').text().trim(),
        url: url
      };
      hadithData.push(hadith);
    });

    return hadithData;
  } catch (error) {
    console.error('Error scraping Hadith Collection:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, source } = await req.json();
    
    let hadithData = [];
    
    if (url.includes(HADITH_SOURCES.AHADITH_UK)) {
      hadithData = await scrapeAhadithUK(url);
    } else if (url.includes(HADITH_SOURCES.HADITH_COLLECTION)) {
      hadithData = await scrapeHadithCollection(url);
    }

    // Store in Supabase
    if (hadithData.length > 0) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      for (const hadith of hadithData) {
        await supabaseClient
          .from('islamic_content')
          .upsert({
            url: hadith.url,
            type: 'hadith',
            content: hadith.translation,
            original_text: hadith.text,
            translation: hadith.translation,
            metadata: {
              reference: hadith.reference,
              grade: hadith.grade,
              narrator: hadith.narrator,
              book: hadith.book,
              chapter: hadith.chapter
            },
            language: 'en'
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: hadithData.length }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});