/*
  # Create functions for trend analysis
  
  1. New Functions
    - get_most_positive_company: Returns company with most positive mentions
    - get_most_negative_company: Returns company with most negative mentions
    - get_company_positive_trend: Returns monthly trend of positive mentions for a company
    - get_company_negative_trend: Returns monthly trend of negative mentions for a company
    - get_top_mentioned_companies: Returns top 3 most mentioned companies
*/

-- Function to get company with most positive mentions
CREATE OR REPLACE FUNCTION get_most_positive_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 
    unnest(companies) as company,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE sentiment = 'Positive'
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
  SELECT 
    unnest(companies) as company,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE sentiment = 'Negative'
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
  SELECT 
    TO_CHAR(publish_date, 'Mon YYYY') as month,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE 
    sentiment = 'Positive' AND
    company_name = ANY(companies)
  GROUP BY month, publish_date
  ORDER BY publish_date DESC
  LIMIT 6;
$$;

-- Function to get monthly trend of negative mentions for a company
CREATE OR REPLACE FUNCTION get_company_negative_trend(company_name text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 
    TO_CHAR(publish_date, 'Mon YYYY') as month,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE 
    sentiment = 'Negative' AND
    company_name = ANY(companies)
  GROUP BY month, publish_date
  ORDER BY publish_date DESC
  LIMIT 6;
$$;

-- Function to get top 3 most mentioned companies
CREATE OR REPLACE FUNCTION get_top_mentioned_companies()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 
    unnest(companies) as company,
    COUNT(*) as count
  FROM podcast_episodes
  GROUP BY company
  ORDER BY count DESC
  LIMIT 3;
$$;