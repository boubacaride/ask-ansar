-- Create duas table for storing Dou'as et Dhikr content
CREATE TABLE IF NOT EXISTS duas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text,
  arabic_text text NOT NULL,
  english_text text,
  french_text text,
  transliteration text,
  reference text,
  repetitions integer DEFAULT 1,
  source_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Index for fast category lookups
CREATE INDEX idx_duas_category ON duas(category);
CREATE INDEX idx_duas_sort_order ON duas(category, sort_order);

-- Enable Row Level Security
ALTER TABLE duas ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for duas" ON duas
  FOR SELECT USING (true);

-- Authenticated users can insert/update (for scraping scripts)
CREATE POLICY "Authenticated users can insert duas" ON duas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update duas" ON duas
  FOR UPDATE TO authenticated USING (true);
