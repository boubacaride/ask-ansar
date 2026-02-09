import { cheerio } from "npm:cheerio@1.0.0-rc.12";
import { parse as parseUrl } from "node:url";
import { throttle } from "npm:lodash@4.17.21";
import { Readability } from "npm:@mozilla/readability@0.5.0";
import { JSDOM } from "npm:jsdom@24.0.0";

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  language: string;
  type: string;
  metadata: {
    author?: string;
    date?: string;
    category?: string;
    source: string;
    hadithGrade?: string;
    hadithNumber?: string;
    hadithBook?: string;
    surahNumber?: number;
    ayahNumber?: number;
    narrator?: string;
    references?: string[];
    tags?: string[];
  };
  originalText?: string;
  translation?: string;
}

const LANGUAGES = {
  AR: 'ar',
  EN: 'en',
  FR: 'fr'
} as const;

const CONTENT_TYPES = {
  DUA: 'dua',
  HADITH: 'hadith',
  FATWA: 'fatwa',
  QURAN: 'quran',
  TAFSIR: 'tafsir',
  ARTICLE: 'article',
  BOOK: 'book'
} as const;

// Rate limiting configuration
const REQUESTS_PER_SECOND = 1;
const DELAY_BETWEEN_REQUESTS = 1000 / REQUESTS_PER_SECOND;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const throttledFetch = throttle(async (url: string, retryCount = 0): Promise<Response> => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IslamicContentBot/1.0; +http://example.com/bot)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return throttledFetch(url, retryCount + 1);
    }
    throw error;
  }
}, DELAY_BETWEEN_REQUESTS);

async function scrapeWebsite(url: string): Promise<ScrapedContent[]> {
  try {
    const response = await throttledFetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const parsedUrl = parseUrl(url);
    const hostname = parsedUrl.hostname || '';

    const results: ScrapedContent[] = [];

    switch (hostname) {
      case 'www.islamicity.org':
        await scrapeIslamicityContent($, url, results);
        break;
      case 'sunnah.com':
        await scrapeSunnahDotCom($, url, results);
        break;
      case 'hadeethenc.com':
        await scrapeHadeethEnc($, url, results);
        break;
      case 'quranexplorer.com':
        await scrapeQuranExplorer($, url, results);
        break;
      case 'islamqa.info':
        await scrapeIslamQA($, url, results);
        break;
      case 'duas.com':
        await scrapeDuas($, url, results);
        break;
      case 'islamweb.net':
        await scrapeIslamWeb($, url, results);
        break;
      default:
        await scrapeGenericContent($, url, results);
    }

    return results;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  }
}

async function scrapeSunnahDotCom($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  $('div.hadithBox').each((_, element) => {
    const hadith: ScrapedContent = {
      url,
      title: $(element).find('.hadithTitle').text().trim(),
      content: $(element).find('.hadithText').text().trim(),
      language: detectLanguage($(element).text()),
      type: CONTENT_TYPES.HADITH,
      metadata: {
        hadithNumber: $(element).find('.hadithNumber').text().trim(),
        hadithGrade: $(element).find('.hadithGrade').text().trim(),
        hadithBook: $(element).find('.bookName').text().trim(),
        narrator: $(element).find('.hadithNarrator').text().trim(),
        source: 'sunnah.com',
        references: [],
        tags: []
      },
      originalText: $(element).find('.arabic').text().trim(),
      translation: $(element).find('.english').text().trim()
    };

    // Extract references
    $(element).find('.reference').each((_, ref) => {
      hadith.metadata.references?.push($(ref).text().trim());
    });

    // Extract tags
    $(element).find('.hadithTag').each((_, tag) => {
      hadith.metadata.tags?.push($(tag).text().trim());
    });

    results.push(hadith);
  });
}

async function scrapeQuranExplorer($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  $('.quran-verse').each((_, element) => {
    const verse: ScrapedContent = {
      url,
      title: $(element).find('.verse-title').text().trim(),
      content: $(element).find('.verse-text').text().trim(),
      language: LANGUAGES.AR,
      type: CONTENT_TYPES.QURAN,
      metadata: {
        surahNumber: parseInt($(element).attr('data-surah') || '0'),
        ayahNumber: parseInt($(element).attr('data-ayah') || '0'),
        source: 'quranexplorer.com'
      },
      originalText: $(element).find('.arabic-text').text().trim(),
      translation: $(element).find('.translation').text().trim()
    };
    results.push(verse);
  });
}

async function scrapeIslamQA($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  const fatwa: ScrapedContent = {
    url,
    title: $('h1').first().text().trim(),
    content: $('.question_details').text().trim(),
    language: url.includes('/fr/') ? LANGUAGES.FR : LANGUAGES.EN,
    type: CONTENT_TYPES.FATWA,
    metadata: {
      date: $('.date').text().trim(),
      category: $('.category').text().trim(),
      author: $('.scholar').text().trim(),
      source: 'islamqa.info',
      tags: []
    }
  };

  // Extract tags
  $('.tags .tag').each((_, tag) => {
    fatwa.metadata.tags?.push($(tag).text().trim());
  });

  results.push(fatwa);
}

async function scrapeDuas($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  $('.dua-container').each((_, element) => {
    const dua: ScrapedContent = {
      url,
      title: $(element).find('.dua-title').text().trim(),
      content: $(element).find('.dua-text').text().trim(),
      language: LANGUAGES.AR,
      type: CONTENT_TYPES.DUA,
      metadata: {
        category: $(element).find('.dua-category').text().trim(),
        source: 'duas.com',
        references: []
      },
      originalText: $(element).find('.arabic-text').text().trim(),
      translation: $(element).find('.translation').text().trim()
    };

    $(element).find('.reference').each((_, ref) => {
      dua.metadata.references?.push($(ref).text().trim());
    });

    results.push(dua);
  });
}

async function scrapeIslamWeb($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  const article: ScrapedContent = {
    url,
    title: $('.article-title').text().trim(),
    content: $('.article-content').text().trim(),
    language: detectLanguage($('html').attr('lang') || ''),
    type: CONTENT_TYPES.ARTICLE,
    metadata: {
      author: $('.author-name').text().trim(),
      date: $('.publish-date').text().trim(),
      category: $('.article-category').text().trim(),
      source: 'islamweb.net',
      tags: []
    }
  };

  $('.article-tags .tag').each((_, tag) => {
    article.metadata.tags?.push($(tag).text().trim());
  });

  results.push(article);
}

async function scrapeHadeethEnc($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  $('.hadith-entry').each((_, element) => {
    const hadith: ScrapedContent = {
      url,
      title: $(element).find('.hadith-title').text().trim(),
      content: $(element).find('.hadith-text').text().trim(),
      language: detectLanguage($(element).text()),
      type: CONTENT_TYPES.HADITH,
      metadata: {
        hadithNumber: $(element).find('.hadith-number').text().trim(),
        hadithGrade: $(element).find('.hadith-grade').text().trim(),
        hadithBook: $(element).find('.book-name').text().trim(),
        narrator: $(element).find('.narrator').text().trim(),
        source: 'hadeethenc.com',
        references: []
      },
      originalText: $(element).find('.arabic-text').text().trim(),
      translation: $(element).find('.translation').text().trim()
    };

    results.push(hadith);
  });
}

async function scrapeIslamicityContent($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  // Handle Hadith content
  if (url.includes('/hadith/')) {
    $('.hadith-entry').each((_, element) => {
      const hadith: ScrapedContent = {
        url,
        title: $(element).find('.hadith-title').text().trim(),
        content: $(element).find('.hadith-text').text().trim(),
        language: detectLanguage($(element).text()),
        type: CONTENT_TYPES.HADITH,
        metadata: {
          hadithNumber: $(element).find('.hadith-number').text().trim(),
          hadithGrade: $(element).find('.hadith-grade').text().trim(),
          hadithBook: $(element).find('.book-name').text().trim(),
          narrator: $(element).find('.narrator').text().trim(),
          source: 'islamicity.org',
          references: [],
          tags: []
        },
        originalText: $(element).find('.arabic-text').text().trim(),
        translation: $(element).find('.translation').text().trim()
      };

      // Extract references if available
      $(element).find('.reference').each((_, ref) => {
        hadith.metadata.references?.push($(ref).text().trim());
      });

      results.push(hadith);
    });
  }

  // Handle Dua content
  if (url.includes('/dua/')) {
    $('.dua-entry').each((_, element) => {
      const dua: ScrapedContent = {
        url,
        title: $(element).find('.dua-title').text().trim(),
        content: $(element).find('.dua-text').text().trim(),
        language: detectLanguage($(element).text()),
        type: CONTENT_TYPES.DUA,
        metadata: {
          category: $(element).find('.dua-category').text().trim(),
          occasion: $(element).find('.dua-occasion').text().trim(),
          source: 'islamicity.org',
          references: []
        },
        originalText: $(element).find('.arabic-text').text().trim(),
        translation: $(element).find('.translation').text().trim()
      };

      // Extract references if available
      $(element).find('.reference').each((_, ref) => {
        dua.metadata.references?.push($(ref).text().trim());
      });

      results.push(dua);
    });
  }
}

async function scrapeGenericContent($: cheerio.CheerioAPI, url: string, results: ScrapedContent[]) {
  // Use Readability for better content extraction
  const dom = new JSDOM($.html());
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (article) {
    const content: ScrapedContent = {
      url,
      title: article.title || $('h1').first().text().trim(),
      content: article.content,
      language: detectLanguage($('html').attr('lang') || ''),
      type: CONTENT_TYPES.ARTICLE,
      metadata: {
        author: $('.author, .writer, [rel="author"]').first().text().trim(),
        date: $('time, .date, .published').first().text().trim(),
        source: new URL(url).hostname,
        tags: []
      }
    };

    // Extract tags/categories
    $('.tags .tag, .categories .category, [rel="tag"]').each((_, tag) => {
      content.metadata.tags?.push($(tag).text().trim());
    });

    results.push(content);
  }
}

function detectLanguage(text: string): string {
  const arabicPattern = /[\u0600-\u06FF]/;
  const frenchPattern = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿ]/i;
  
  if (arabicPattern.test(text)) return LANGUAGES.AR;
  if (frenchPattern.test(text)) return LANGUAGES.FR;
  return LANGUAGES.EN;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { url } = await req.json();
    if (!url) {
      throw new Error('URL is required');
    }

    const scrapedContent = await scrapeWebsite(url);

    return new Response(
      JSON.stringify(scrapedContent),
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