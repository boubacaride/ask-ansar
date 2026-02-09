/*
  # Create AI Content Cache Table

  1. New Tables
    - `ai_content_cache`
      - `id` (uuid, primary key)
      - `verse_key` (text) - Format: "surah_number:verse_number"
      - `content_type` (text) - Either 'lessons' or 'reflections'
      - `language` (text) - Either 'fr' or 'ar'
      - `content` (text) - The AI-generated content
      - `created_at` (timestamp)
      - `expires_at` (timestamp) - 30 days from creation
  
  2. Security
    - Enable RLS on `ai_content_cache` table
    - Add policy for authenticated users to read cached content
    - Add policy for authenticated users to create cache entries
  
  3. Indexes
    - Composite unique index on (verse_key, content_type, language) for fast lookups
    - Index on expires_at for automatic cleanup
*/

CREATE TABLE IF NOT EXISTS ai_content_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verse_key text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('lessons', 'reflections')),
  language text NOT NULL CHECK (language IN ('fr', 'ar')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

CREATE UNIQUE INDEX IF NOT EXISTS ai_content_cache_lookup_idx 
  ON ai_content_cache(verse_key, content_type, language);

CREATE INDEX IF NOT EXISTS ai_content_cache_expires_idx 
  ON ai_content_cache(expires_at);

ALTER TABLE ai_content_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached AI content"
  ON ai_content_cache
  FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Authenticated users can create cache entries"
  ON ai_content_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cache entries"
  ON ai_content_cache
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);