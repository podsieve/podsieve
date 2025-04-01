/*
  # Create podcast episodes table

  1. New Tables
    - `podcast_episodes`
      - `id` (uuid, primary key)
      - `podcast_name` (text, not null) - Name of the podcast (e.g., "All-In Podcast")
      - `title` (text, not null) - Episode title
      - `publish_date` (date, not null) - Publication date
      - `companies` (text[], not null) - Array of company names mentioned
      - `sentiment` (text, not null) - Overall sentiment (Positive, Negative, Neutral, Mixed)
      - `summary` (text, not null) - Episode summary/insights
      - `created_at` (timestamptz, default: now())
      - `updated_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on `podcast_episodes` table
    - Add policy for public read access
    - Add policy for authenticated users to manage episodes

  3. Indexes
    - Index on podcast_name for faster filtering
    - Index on publish_date for date-based queries
    - Index on companies array for company-based searches
*/

CREATE TABLE IF NOT EXISTS podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_name text NOT NULL,
  title text NOT NULL,
  publish_date date NOT NULL,
  companies text[] NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('Positive', 'Negative', 'Neutral', 'Mixed')),
  summary text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_podcast_name ON podcast_episodes (podcast_name);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_publish_date ON podcast_episodes (publish_date);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_companies ON podcast_episodes USING gin (companies);

-- Enable Row Level Security
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to podcast episodes"
  ON podcast_episodes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage podcast episodes"
  ON podcast_episodes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_podcast_episodes_updated_at
  BEFORE UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();