import { supabase } from './supabase';

interface CachedContent {
  content: string;
  created_at: string;
}

export async function getCachedAIContent(
  verseKey: string,
  contentType: 'lessons' | 'reflections',
  language: 'fr' | 'ar'
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('ai_content_cache')
      .select('content')
      .eq('verse_key', verseKey)
      .eq('content_type', contentType)
      .eq('language', language)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error fetching cached content:', error);
      return null;
    }

    return data?.content || null;
  } catch (err) {
    console.error('Error in getCachedAIContent:', err);
    return null;
  }
}

export async function setCachedAIContent(
  verseKey: string,
  contentType: 'lessons' | 'reflections',
  language: 'fr' | 'ar',
  content: string
): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabase
      .from('ai_content_cache')
      .upsert(
        {
          verse_key: verseKey,
          content_type: contentType,
          language: language,
          content: content,
          expires_at: expiresAt.toISOString(),
        },
        {
          onConflict: 'verse_key,content_type,language',
        }
      );

    if (error) {
      console.error('Error caching content:', error);
    }
  } catch (err) {
    console.error('Error in setCachedAIContent:', err);
  }
}

export function formatMarkdownText(text: string): string {
  let formatted = text;

  formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '$1');
  formatted = formatted.replace(/\*(.+?)\*/g, '$1');
  formatted = formatted.replace(/__(.+?)__/g, '$1');
  formatted = formatted.replace(/_(.+?)_/g, '$1');

  formatted = formatted.replace(/^#{1,6}\s+(.+)$/gm, '$1\n');

  formatted = formatted.replace(/^\* (.+)$/gm, '• $1');
  formatted = formatted.replace(/^- (.+)$/gm, '• $1');
  formatted = formatted.replace(/^\+ (.+)$/gm, '• $1');
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '$1');

  formatted = formatted.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}
