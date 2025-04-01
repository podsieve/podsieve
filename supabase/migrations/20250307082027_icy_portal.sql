/*
  # Create database functions for trend analysis

  1. Functions
    - get_most_positive_company: Returns company with most positive mentions
    - get_most_negative_company: Returns company with most negative mentions
    - get_company_positive_trend: Returns monthly trend of positive mentions for a company
    - get_company_negative_trend: Returns monthly trend of negative mentions for a company
    - get_top_mentioned_companies: Returns top 3 most mentioned companies

  2. Changes
    - Drop existing functions before recreation to avoid parameter naming conflicts
    - Ensure consistent parameter naming across functions
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_most_positive_company();
DROP FUNCTION IF EXISTS get_most_negative_company();
DROP FUNCTION IF EXISTS get_company_positive_trend(text);
DROP FUNCTION IF EXISTS get_company_negative_trend(text);
DROP FUNCTION IF EXISTS get_top_mentioned_companies();

-- Function to get company with most positive mentions
CREATE FUNCTION get_most_positive_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT unnest(companies) as company, COUNT(*) as count
  FROM podcast_episodes
  WHERE sentiment = 'Positive'
  GROUP BY company
  ORDER BY count DESC
  LIMIT 1;
$$;

-- Function to get company with most negative mentions
CREATE FUNCTION get_most_negative_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT unnest(companies) as company, COUNT(*) as count
  FROM podcast_episodes
  WHERE sentiment = 'Negative'
  GROUP BY company
  ORDER BY count DESC
  LIMIT 1;
$$;

-- Function to get monthly trend of positive mentions for a company
CREATE FUNCTION get_company_positive_trend(company_name text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 
    to_char(date_trunc('month', publish_date), 'Mon YYYY') as month,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE 
    sentiment = 'Positive' AND
    company_name = ANY(companies)
  GROUP BY date_trunc('month', publish_date)
  ORDER BY date_trunc('month', publish_date) DESC
  LIMIT 12;
$$;

-- Function to get monthly trend of negative mentions for a company
CREATE FUNCTION get_company_negative_trend(company_name text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 
    to_char(date_trunc('month', publish_date), 'Mon YYYY') as month,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE 
    sentiment = 'Negative' AND
    company_name = ANY(companies)
  GROUP BY date_trunc('month', publish_date)
  ORDER BY date_trunc('month', publish_date) DESC
  LIMIT 12;
$$;

-- Function to get top 3 most mentioned companies
CREATE FUNCTION get_top_mentioned_companies()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT unnest(companies) as company, COUNT(*) as count
  FROM podcast_episodes
  GROUP BY company
  ORDER BY count DESC
  LIMIT 3;
$$;