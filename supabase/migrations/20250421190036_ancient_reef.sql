/*
  # Create voice entries table

  1. New Tables
    - `voice_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `transcript` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their entries
    - Create indexes for performance
*/

-- Check if table exists and create if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'voice_entries'
  ) THEN
    -- Create voice entries table
    CREATE TABLE voice_entries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id),
      transcript text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE voice_entries ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can create their own voice entries"
      ON voice_entries
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can read their own voice entries"
      ON voice_entries
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own voice entries"
      ON voice_entries
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own voice entries"
      ON voice_entries
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);

    -- Create indexes
    CREATE INDEX voice_entries_user_id_idx ON voice_entries(user_id);
    CREATE INDEX voice_entries_created_at_idx ON voice_entries(created_at DESC);
  END IF;
END $$;