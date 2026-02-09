/*
  # Create Seerah Bookmarks and Preferences Tables

  1. New Tables
    - `seerah_bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `page_number` (integer)
      - `page_title` (text, optional)
      - `note` (text, optional)
      - `created_at` (timestamptz)
    
    - `seerah_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `last_page_read` (integer)
      - `voice_language` (text, default 'fr-FR')
      - `voice_speed` (numeric, default 1.0)
      - `voice_pitch` (numeric, default 1.0)
      - `night_mode` (boolean, default false)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create seerah_bookmarks table
CREATE TABLE IF NOT EXISTS seerah_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_number integer NOT NULL,
  page_title text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create seerah_preferences table
CREATE TABLE IF NOT EXISTS seerah_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_page_read integer DEFAULT 13,
  voice_language text DEFAULT 'fr-FR',
  voice_speed numeric DEFAULT 1.0,
  voice_pitch numeric DEFAULT 1.0,
  night_mode boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seerah_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seerah_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for seerah_bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON seerah_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON seerah_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON seerah_bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON seerah_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for seerah_preferences
CREATE POLICY "Users can view own preferences"
  ON seerah_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON seerah_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON seerah_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON seerah_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seerah_bookmarks_user_id ON seerah_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_seerah_bookmarks_page_number ON seerah_bookmarks(page_number);
CREATE INDEX IF NOT EXISTS idx_seerah_preferences_user_id ON seerah_preferences(user_id);