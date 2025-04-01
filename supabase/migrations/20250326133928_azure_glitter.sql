/*
  # Create podcast_episodes table and update RPC functions

  1. New Tables
    - `podcast_episodes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `publish_date` (date)
      - `companies` (text[])
      - `sentiment` (text)
      - `summary` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access

  3. Functions
    - Update trend analysis functions to work with the new table
*/

-- Create podcast_episodes table
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  publish_date date NOT NULL,
  companies text[] NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('Positive', 'Negative', 'Neutral', 'Mixed')),
  summary text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access
CREATE POLICY "Allow public read access"
  ON podcast_episodes
  FOR SELECT
  TO public
  USING (true);

-- Drop existing functions
DROP FUNCTION IF EXISTS get_most_positive_company();
DROP FUNCTION IF EXISTS get_most_negative_company();
DROP FUNCTION IF EXISTS get_company_positive_trend(text);
DROP FUNCTION IF EXISTS get_company_negative_trend(text);
DROP FUNCTION IF EXISTS get_top_mentioned_companies();

-- Recreate functions with correct table reference
CREATE OR REPLACE FUNCTION get_most_positive_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  WITH company_mentions AS (
    SELECT UNNEST(companies) as company
    FROM podcast_episodes
    WHERE sentiment = 'Positive'
  )
  SELECT 
    company,
    COUNT(*) as count
  FROM company_mentions
  GROUP BY company
  ORDER BY count DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_most_negative_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  WITH company_mentions AS (
    SELECT UNNEST(companies) as company
    FROM podcast_episodes
    WHERE sentiment = 'Negative'
  )
  SELECT 
    company,
    COUNT(*) as count
  FROM company_mentions
  GROUP BY company
  ORDER BY count DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_company_positive_trend(company_name text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE sql STABLE AS $$
  WITH monthly_mentions AS (
    SELECT 
      date_trunc('month', publish_date) as mention_month
    FROM podcast_episodes
    WHERE 
      sentiment = 'Positive' AND
      company_name = ANY(companies)
  )
  SELECT 
    to_char(mention_month, 'Mon YYYY') as month,
    COUNT(*) as count
  FROM monthly_mentions
  GROUP BY month, mention_month
  ORDER BY mention_month DESC
  LIMIT 12;
$$;

CREATE OR REPLACE FUNCTION get_company_negative_trend(company_name text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE sql STABLE AS $$
  WITH monthly_mentions AS (
    SELECT 
      date_trunc('month', publish_date) as mention_month
    FROM podcast_episodes
    WHERE 
      sentiment = 'Negative' AND
      company_name = ANY(companies)
  )
  SELECT 
    to_char(mention_month, 'Mon YYYY') as month,
    COUNT(*) as count
  FROM monthly_mentions
  GROUP BY month, mention_month
  ORDER BY mention_month DESC
  LIMIT 12;
$$;

CREATE OR REPLACE FUNCTION get_top_mentioned_companies()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  WITH company_mentions AS (
    SELECT UNNEST(companies) as company
    FROM podcast_episodes
  )
  SELECT 
    company,
    COUNT(*) as count
  FROM company_mentions
  GROUP BY company
  ORDER BY count DESC
  LIMIT 3;
$$;

-- Insert sample data
INSERT INTO podcast_episodes (title, publish_date, companies, sentiment, summary) VALUES
  ('The Future of AI', '2024-03-15', ARRAY['OpenAI', 'Microsoft', 'Google'], 'Positive', 'Discussion about AI advancements'),
  ('EV Market Analysis', '2024-03-14', ARRAY['Tesla', 'Ford', 'GM'], 'Mixed', 'Analysis of electric vehicle market'),
  ('Tech Giants Report', '2024-03-13', ARRAY['Apple', 'Amazon', 'Microsoft'], 'Positive', 'Quarterly earnings discussion'),
  ('Startup Ecosystem', '2024-03-12', ARRAY['Stripe', 'Plaid', 'Square'], 'Positive', 'Fintech startup analysis'),
  ('Social Media Trends', '2024-03-11', ARRAY['Meta', 'X', 'LinkedIn'], 'Negative', 'Social platform challenges'),
  ('Cloud Computing', '2024-03-10', ARRAY['AWS', 'Azure', 'GCP'], 'Positive', 'Cloud services overview');