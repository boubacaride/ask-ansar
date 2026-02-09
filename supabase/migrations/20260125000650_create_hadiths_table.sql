/*
  # Create Hadiths Storage and Navigation System

  1. New Tables
    - `hadiths`
      - `id` (uuid, primary key)
      - `collection_id` (text) - e.g., 'bukhari', 'muslim'
      - `book_number` (integer) - Book number within collection
      - `book_title` (text) - Book title in English
      - `book_title_arabic` (text) - Book title in Arabic
      - `chapter_number` (integer, nullable) - Chapter number within book
      - `chapter_title` (text, nullable) - Chapter title
      - `hadith_number` (text) - Hadith reference number
      - `hadith_number_in_book` (integer) - Sequential number in book
      - `arabic_text` (text) - Original Arabic text
      - `english_text` (text) - English translation
      - `french_text` (text, nullable) - French translation (cached)
      - `reference` (text) - Full reference string
      - `url` (text) - Source URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `hadith_collections_metadata`
      - `id` (uuid, primary key)
      - `collection_id` (text, unique) - e.g., 'bukhari'
      - `total_books` (integer) - Total number of books
      - `total_hadiths` (integer) - Total number of hadiths
      - `last_synced_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Indexes
    - Index on (collection_id, book_number) for fast book lookup
    - Index on (collection_id, hadith_number) for direct hadith lookup
    - Index on url for cache checking

  3. Security
    - Enable RLS on both tables
    - Allow public read access (authenticated and anonymous)
    - Restrict write access to service role only
*/

-- Create hadiths table
CREATE TABLE IF NOT EXISTS hadiths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id text NOT NULL,
  book_number integer NOT NULL,
  book_title text NOT NULL DEFAULT '',
  book_title_arabic text DEFAULT '',
  chapter_number integer,
  chapter_title text,
  hadith_number text NOT NULL,
  hadith_number_in_book integer NOT NULL DEFAULT 0,
  arabic_text text NOT NULL DEFAULT '',
  english_text text NOT NULL DEFAULT '',
  french_text text,
  reference text DEFAULT '',
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hadith collections metadata table
CREATE TABLE IF NOT EXISTS hadith_collections_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id text UNIQUE NOT NULL,
  total_books integer DEFAULT 0,
  total_hadiths integer DEFAULT 0,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hadiths_collection_book ON hadiths(collection_id, book_number);
CREATE INDEX IF NOT EXISTS idx_hadiths_collection_hadith_num ON hadiths(collection_id, hadith_number);
CREATE INDEX IF NOT EXISTS idx_hadiths_url ON hadiths(url);
CREATE INDEX IF NOT EXISTS idx_hadith_collections_metadata_id ON hadith_collections_metadata(collection_id);

-- Enable Row Level Security
ALTER TABLE hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadith_collections_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access to hadiths"
  ON hadiths
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to collection metadata"
  ON hadith_collections_metadata
  FOR SELECT
  TO public
  USING (true);

-- Insert initial metadata for common collections
INSERT INTO hadith_collections_metadata (collection_id, total_books, total_hadiths)
VALUES 
  ('bukhari', 97, 7563),
  ('muslim', 56, 7500),
  ('tirmidhi', 46, 3956),
  ('abudawud', 43, 5274),
  ('nasai', 51, 5761),
  ('ibnmajah', 37, 4341),
  ('malik', 61, 1720)
ON CONFLICT (collection_id) DO NOTHING;