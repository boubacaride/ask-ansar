/*
  # Create Islamic content tables

  1. New Tables
    - `islamic_content`
      - `id` (uuid, primary key)
      - `url` (text, unique)
      - `title` (text)
      - `content` (text)
      - `language` (text)
      - `type` (text)
      - `metadata` (jsonb)
      - `original_text` (text)
      - `translation` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `islamic_content` table
    - Add policies for authenticated users to read content
*/

CREATE TABLE IF NOT EXISTS islamic_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  language text NOT NULL,
  type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  original_text text,
  translation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE islamic_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON islamic_content
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert"
  ON islamic_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index for faster searches
CREATE INDEX islamic_content_language_idx ON islamic_content(language);
CREATE INDEX islamic_content_type_idx ON islamic_content(type);
CREATE INDEX islamic_content_title_idx ON islamic_content USING gin(to_tsvector('english', title));
CREATE INDEX islamic_content_content_idx ON islamic_content USING gin(to_tsvector('english', content));