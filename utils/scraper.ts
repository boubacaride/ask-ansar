import { supabaseClient } from '@/utils/supabase';

interface ScrapingProgress {
  total: number;
  current: number;
  success: number;
  failed: number;
  errors: Array<{ url: string; error: string }>;
}

export async function scrapeIslamicContent(url: string) {
  try {
    const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/scraper`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to scrape content: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store the scraped content in Supabase
    const { error } = await supabaseClient
      .from('islamic_content')
      .insert(data);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error scraping content:', error);
    throw error;
  }
}

// New function to specifically scrape IslamiCity content
export async function scrapeIslamicityContent(type: 'hadith' | 'dua') {
  const baseUrl = 'https://www.islamicity.org';
  const urls = [];

  if (type === 'hadith') {
    // Scrape hadith collection pages
    urls.push(
      `${baseUrl}/hadith/sahih-bukhari`,
      `${baseUrl}/hadith/sahih-muslim`,
      `${baseUrl}/hadith/abu-dawood`,
      `${baseUrl}/hadith/tirmidhi`,
      `${baseUrl}/hadith/nasai`,
      `${baseUrl}/hadith/ibn-majah`
    );
  } else if (type === 'dua') {
    // Scrape dua collection pages
    urls.push(
      `${baseUrl}/dua/morning-evening`,
      `${baseUrl}/dua/daily-life`,
      `${baseUrl}/dua/special-occasions`,
      `${baseUrl}/dua/prophetic-prayers`
    );
  }

  const progress = await batchScrapeContent(urls);
  return progress;
}

export async function batchScrapeContent(urls: string[], onProgress?: (progress: ScrapingProgress) => void) {
  const progress: ScrapingProgress = {
    total: urls.length,
    current: 0,
    success: 0,
    failed: 0,
    errors: []
  };

  for (const url of urls) {
    try {
      await scrapeIslamicContent(url);
      progress.success++;
    } catch (error) {
      progress.failed++;
      progress.errors.push({
        url,
        error: error.message
      });
    }

    progress.current++;
    onProgress?.(progress);

    // Add delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return progress;
}

export async function getContentByType(type: string, language?: string) {
  const query = supabaseClient
    .from('islamic_content')
    .select('*')
    .eq('type', type);

  if (language) {
    query.eq('language', language);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function searchContent(query: string, language?: string) {
  const { data, error } = await supabaseClient
    .from('islamic_content')
    .select('*')
    .textSearch('content', query)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (language) {
    return data.filter(item => item.language === language);
  }

  return data;
}