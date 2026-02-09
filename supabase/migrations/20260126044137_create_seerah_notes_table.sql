/*
  # Create Seerah Notes Table

  1. New Tables
    - `seerah_notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `page_number` (integer, the page this note refers to)
      - `note_text` (text, the user's personal note)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `seerah_notes` table
    - Add policies for authenticated users to manage their own notes
*/

CREATE TABLE IF NOT EXISTS seerah_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_number integer NOT NULL,
  note_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seerah_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON seerah_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON seerah_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON seerah_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON seerah_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_seerah_notes_user_id ON seerah_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_seerah_notes_page_number ON seerah_notes(page_number);