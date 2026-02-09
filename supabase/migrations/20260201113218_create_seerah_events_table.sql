/*
  # Create Seerah Events Table for Historical Atlas

  1. New Tables
    - `seerah_events`
      - `id` (integer, primary key) - Sequential event ID
      - `year` (text) - Year of the event (e.g., "570 ap. J.-C.")
      - `title` (text) - Event title
      - `location` (text) - Location name
      - `latitude` (numeric) - Geographic latitude
      - `longitude` (numeric) - Geographic longitude
      - `description` (text) - Event description
      - `historical_significance` (text) - Historical significance
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on seerah_events table
    - Add SELECT policy for all users (public read access)
    - Add INSERT/UPDATE/DELETE policies for authenticated users only

  3. Indexes
    - Index on latitude and longitude for geographic queries
    - Index on year for chronological ordering
*/

-- Create seerah_events table
CREATE TABLE IF NOT EXISTS seerah_events (
  id integer PRIMARY KEY,
  year text NOT NULL,
  title text NOT NULL,
  location text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  description text NOT NULL DEFAULT '',
  historical_significance text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seerah_events ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view events)
CREATE POLICY "Anyone can view seerah events"
  ON seerah_events FOR SELECT
  TO public
  USING (true);

-- Policy for authenticated users to insert events
CREATE POLICY "Authenticated users can insert events"
  ON seerah_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for authenticated users to update events
CREATE POLICY "Authenticated users can update events"
  ON seerah_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to delete events
CREATE POLICY "Authenticated users can delete events"
  ON seerah_events FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seerah_events_location ON seerah_events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_seerah_events_year ON seerah_events(year);
CREATE INDEX IF NOT EXISTS idx_seerah_events_updated_at ON seerah_events(updated_at);
