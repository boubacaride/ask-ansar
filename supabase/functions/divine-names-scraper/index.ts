import { cheerio } from "npm:cheerio@1.0.0-rc.12";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function scrapeDivineNames(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IslamicContentBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const names = [];

    // Specific to ahadith.co.uk structure
    $('.divine-name').each((_, element) => {
      const name = {
        name: $(element).find('.arabic-name').text().trim(),
        transliteration: $(element).find('.transliteration').text().trim(),
        meaning: $(element).find('.meaning').text().trim(),
        explanation: $(element).find('.explanation').text().trim(),
        category: $(element).find('.category').text().trim(),
      };
      names.push(name);
    });

    return names;
  } catch (error) {
    console.error('Error scraping divine names:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    const names = await scrapeDivineNames(url);

    // Store in Supabase
    if (names.length > 0) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      for (const name of names) {
        await supabaseClient
          .from('divine_names')
          .upsert({
            name: name.name,
            transliteration: name.transliteration,
            meaning: name.meaning,
            explanation: name.explanation,
            category: name.category,
          }, {
            onConflict: 'name'
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: names.length }),
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