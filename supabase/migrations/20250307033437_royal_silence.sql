/*
  # Create company mentions table

  1. New Tables
    - `company_mentions`
      - `id` (uuid, primary key)
      - `company_name` (text, not null)
      - `positive_mentions` (integer, default 0)
      - `negative_mentions` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `company_mentions` table
    - Add policy for authenticated users to read data
    - Add policy for authenticated users to update data
*/

-- Create the company_mentions table
CREATE TABLE IF NOT EXISTS company_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  positive_mentions integer NOT NULL DEFAULT 0,
  negative_mentions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create an index on company_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_mentions_name ON company_mentions(company_name);

-- Enable Row Level Security
ALTER TABLE company_mentions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON company_mentions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to update"
  ON company_mentions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some initial data
INSERT INTO company_mentions (company_name, positive_mentions, negative_mentions)
VALUES
  ('Apple', 15, 8),
  ('Microsoft', 12, 6),
  ('Tesla', 10, 7),
  ('Amazon', 8, 4),
  ('Google', 7, 5),
  ('Meta', 6, 3),
  ('Netflix', 5, 4)
ON CONFLICT (id) DO NOTHING;