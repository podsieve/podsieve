/*
  # Create functions for trends analysis
  
  1. New Functions
    - get_most_positive_company(): Returns company with most positive mentions
    - get_most_negative_company(): Returns company with most negative mentions
    - get_company_positive_trend(company_name): Returns monthly trend of positive mentions for a company
    - get_company_negative_trend(company_name): Returns monthly trend of negative mentions for a company
    - get_top_mentioned_companies(): Returns top 3 most mentioned companies
  
  2. Purpose
    - These functions will power the trends analysis charts and tables
    - Each function is optimized for specific trend analysis needs
    - Results are ordered and limited appropriately
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_most_positive_company();
DROP FUNCTION IF EXISTS get_most_negative_company();
DROP FUNCTION IF EXISTS get_company_positive_trend(text);
DROP FUNCTION IF EXISTS get_company_negative_trend(text);
DROP FUNCTION IF EXISTS get_top_mentioned_companies();

-- Function to get company with most positive mentions
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

-- Function to get company with most negative mentions
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

-- Function to get monthly trend of positive mentions for a company
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

-- Function to get monthly trend of negative mentions for a company
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

-- Function to get top 3 most mentioned companies
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