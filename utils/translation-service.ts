import AsyncStorage from '@react-native-async-storage/async-storage';

const DEEPL_API_KEY = process.env.EXPO_PUBLIC_DEEPL_API_KEY;
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

interface TranslationCache {
  translation_fr: string;
  cached_at: number;
}

async function getLocalCache(key: string): Promise<string | null> {
  try {
    const cached = await AsyncStorage.getItem(`translation_${key}`);
    if (cached) {
      const data: TranslationCache = JSON.parse(cached);
      if (Date.now() - data.cached_at < 30 * 24 * 60 * 60 * 1000) {
        return data.translation_fr;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function setLocalCache(key: string, translation: string): Promise<void> {
  try {
    const data: TranslationCache = {
      translation_fr: translation,
      cached_at: Date.now(),
    };
    await AsyncStorage.setItem(`translation_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

async function translateWithDeepL(text: string): Promise<string | null> {
  if (!DEEPL_API_KEY) return null;

  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: 'FR',
        source_lang: 'EN',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translations[0].text;
    }
    return null;
  } catch {
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
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Traduis ce texte en français. Conserve les termes islamiques (Allah, Prophète, Sunnah). Réponds uniquement avec la traduction:\n\n${text}`
        }]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.content[0].text;
    }
    return null;
  } catch {
    return null;
  }
}

async function translateWithOpenAI(text: string): Promise<string | null> {
  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un traducteur expert spécialisé dans les textes religieux islamiques. Traduis le texte suivant de l\'anglais vers le français en conservant tous les termes islamiques appropriés (Allah, Prophète, Sunnah, etc.). Fournis uniquement la traduction sans aucun commentaire.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export async function translateToFrench(
  text: string,
  sourceType: 'quran' | 'hadith' | 'general',
  sourceId: string
): Promise<string> {
  const cacheKey = `${sourceType}_${sourceId}`;

  const cached = await getLocalCache(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }

  let translation = await translateWithDeepL(text);

  if (!translation) {
    translation = await translateWithClaude(text);
  }

  if (!translation) {
    translation = await translateWithOpenAI(text);
  }

  if (!translation) {
    return text;
  }

  await setLocalCache(cacheKey, translation);

  return translation;
}

export async function translateBatch(
  items: Array<{ text: string; sourceType: 'quran' | 'hadith' | 'general'; sourceId: string }>
): Promise<string[]> {
  const results = await Promise.all(
    items.map(item => translateToFrench(item.text, item.sourceType, item.sourceId))
  );
  return results;
}
