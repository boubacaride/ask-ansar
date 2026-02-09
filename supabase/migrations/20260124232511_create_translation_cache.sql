/*
  # Create translation cache table

  1. New Tables
    - `translation_cache`
      - `id` (uuid, primary key) - Unique identifier
      - `source_text` (text) - Original text to translate
      - `source_language` (text) - Source language code (e.g., 'en')
      - `target_language` (text) - Target language code (e.g., 'fr')
      - `translated_text` (text) - Translated text
      - `source_type` (text) - Type of content (quran, hadith, general)
      - `source_id` (text) - Unique identifier for the source
      - `translation_provider` (text) - API used (deepl, claude)
      - `created_at` (timestamp) - Creation timestamp
      - `updated_at` (timestamp) - Last update timestamp
    
  2. Security
    - Enable RLS on `translation_cache` table
    - Add policy for authenticated users to read all translations
    - Add policy for authenticated users to insert translations
    
  3. Indexes
    - Create composite index on (source_type, source_id, target_language) for fast lookups
    - Create index on created_at for cache expiration queries
*/

CREATE TABLE IF NOT EXISTS translation_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text text NOT NULL,
  source_language text NOT NULL DEFAULT 'en',
  target_language text NOT NULL DEFAULT 'fr',
  translated_text text NOT NULL,
  source_type text NOT NULL,
  source_id text NOT NULL,
  translation_provider text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup 
  ON translation_cache(source_type, source_id, target_language);

CREATE INDEX IF NOT EXISTS idx_translation_cache_created 
  ON translation_cache(created_at);

ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read translations"
  ON translation_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert translations"
  ON translation_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update translations"
  ON translation_cache
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
