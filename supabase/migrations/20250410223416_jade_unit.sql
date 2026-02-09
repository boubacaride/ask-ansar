/*
  # Create Islamic Content Table

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
    - Add policies for public read access
    - Add policies for authenticated users to insert content

  3. Indexes
    - Full-text search indexes on title and content
    - B-tree indexes on language and type
*/

-- Create the islamic_content table
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

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS islamic_content_language_idx ON islamic_content(language);
CREATE INDEX IF NOT EXISTS islamic_content_type_idx ON islamic_content(type);
CREATE INDEX IF NOT EXISTS islamic_content_title_tsvector_idx ON islamic_content USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS islamic_content_content_tsvector_idx ON islamic_content USING gin(to_tsvector('english', content));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_islamic_content_updated_at
  BEFORE UPDATE ON islamic_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();