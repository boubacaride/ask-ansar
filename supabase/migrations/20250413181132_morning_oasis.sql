/*
  # Create divine names table

  1. New Tables
    - `divine_names`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `transliteration` (text)
      - `meaning` (text)
      - `explanation` (text)
      - `category` (text)
      - `reference_sources` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `divine_names` table
    - Add policies for public read access
*/

-- Create divine names table
CREATE TABLE IF NOT EXISTS divine_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  transliteration text NOT NULL,
  meaning text NOT NULL,
  explanation text,
  category text,
  reference_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE divine_names ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON divine_names
  FOR SELECT
  TO public
  USING (true);

-- Create indexes
CREATE INDEX divine_names_name_idx ON divine_names(name);
CREATE INDEX divine_names_transliteration_idx ON divine_names(transliteration);
CREATE INDEX divine_names_category_idx ON divine_names(category);

-- Insert the 99 Names of Allah
INSERT INTO divine_names (name, transliteration, meaning, category) VALUES
  ('ٱلرَّحْمَٰن', 'Ar-Rahman', 'The Most Gracious', 'mercy'),
  ('ٱلرَّحِيم', 'Ar-Raheem', 'The Most Merciful', 'mercy'),
  ('ٱلْمَلِك', 'Al-Malik', 'The King/Sovereign', 'sovereignty'),
  ('ٱلْقُدُّوس', 'Al-Quddus', 'The Pure One', 'purity'),
  ('ٱلسَّلَام', 'As-Salam', 'The Source of Peace', 'peace'),
  ('ٱلْمُؤْمِن', 'Al-Mu''min', 'The Inspirer of Faith', 'faith'),
  ('ٱلْمُهَيْمِن', 'Al-Muhaymin', 'The Guardian', 'protection'),
  ('ٱلْعَزِيز', 'Al-Aziz', 'The Almighty', 'power'),
  ('ٱلْجَبَّار', 'Al-Jabbar', 'The Compeller', 'power'),
  ('ٱلْمُتَكَبِّر', 'Al-Mutakabbir', 'The Greatest', 'greatness')
ON CONFLICT (name) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_divine_names_updated_at
  BEFORE UPDATE ON divine_names
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();