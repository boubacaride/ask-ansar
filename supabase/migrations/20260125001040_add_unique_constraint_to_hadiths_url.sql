/*
  # Add unique constraint to hadiths URL

  1. Changes
    - Add unique constraint on url column to support upserts
    - This allows caching hadiths without duplicates

  2. Notes
    - Uses IF NOT EXISTS to make migration idempotent
*/

-- Add unique constraint on url if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'hadiths_url_key'
  ) THEN
    ALTER TABLE hadiths ADD CONSTRAINT hadiths_url_key UNIQUE (url);
  END IF;
END $$;