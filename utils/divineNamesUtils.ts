import { supabase } from './supabase';

export async function getDivineNames() {
  try {
    const { data, error } = await supabase
      .from('divine_names')
      .select('*')
      .order('transliteration');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching divine names:', error);
    throw error;
  }
}

export async function searchDivineNames(query: string) {
  try {
    const { data, error } = await supabase
      .from('divine_names')
      .select('*')
      .or(`
        name.ilike.%${query}%,
        transliteration.ilike.%${query}%,
        meaning.ilike.%${query}%
      `)
      .order('transliteration');

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error searching divine names:', error);
    throw error;
  }
}

export async function updateDivineNamesFromSource() {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/divine-names-scraper`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://ahadith.co.uk/99namesofAllah.php'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update divine names');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating divine names:', error);
    throw error;
  }
}