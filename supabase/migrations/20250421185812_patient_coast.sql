-- Create voice entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS voice_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  transcript text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE voice_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Insert policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_entries' 
    AND policyname = 'Users can create their own voice entries'
  ) THEN
    DROP POLICY "Users can create their own voice entries" ON voice_entries;
  END IF;

  -- Select policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_entries' 
    AND policyname = 'Users can read their own voice entries'
  ) THEN
    DROP POLICY "Users can read their own voice entries" ON voice_entries;
  END IF;

  -- Update policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_entries' 
    AND policyname = 'Users can update their own voice entries'
  ) THEN
    DROP POLICY "Users can update their own voice entries" ON voice_entries;
  END IF;

  -- Delete policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_entries' 
    AND policyname = 'Users can delete their own voice entries'
  ) THEN
    DROP POLICY "Users can delete their own voice entries" ON voice_entries;
  END IF;
END $$;

-- Create new policies
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS voice_entries_user_id_idx ON voice_entries(user_id);
CREATE INDEX IF NOT EXISTS voice_entries_created_at_idx ON voice_entries(created_at DESC);