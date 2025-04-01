/*
  # Create functions for trend analysis

  1. Functions
    - get_most_positive_company: Returns company with most positive mentions
    - get_most_negative_company: Returns company with most negative mentions
    - get_company_positive_trend: Returns monthly trend of positive mentions for a company
    - get_company_negative_trend: Returns monthly trend of negative mentions for a company
    - get_top_mentioned_companies: Returns top 3 most mentioned companies

  2. Purpose
    - Support trend analysis and visualization
    - Aggregate company mentions and sentiment data
    - Generate time-series data for charts
*/

-- Function to get company with most positive mentions
CREATE OR REPLACE FUNCTION get_most_positive_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql AS $$
  SELECT unnest(companies) as company, COUNT(*) as count
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
) LANGUAGE sql AS $$
  SELECT unnest(companies) as company, COUNT(*) as count
  FROM podcast_episodes
  WHERE sentiment = 'Negative'
  GROUP BY company
  ORDER BY count DESC
  LIMIT 1;
$$;

-- Function to get monthly trend of positive mentions for a company
CREATE OR REPLACE FUNCTION get_company_positive_trend(p_company text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE sql AS $$
  SELECT 
    to_char(publish_date, 'Mon YYYY') as month,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE 
    p_company = ANY(companies)
    AND sentiment = 'Positive'
  GROUP BY month, date_trunc('month', publish_date)
  ORDER BY date_trunc('month', min(publish_date))
  LIMIT 12;
$$;

-- Function to get monthly trend of negative mentions for a company
CREATE OR REPLACE FUNCTION get_company_negative_trend(p_company text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE sql AS $$
  SELECT 
    to_char(publish_date, 'Mon YYYY') as month,
    COUNT(*) as count
  FROM podcast_episodes
  WHERE 
    p_company = ANY(companies)
    AND sentiment = 'Negative'
  GROUP BY month, date_trunc('month', publish_date)
  ORDER BY date_trunc('month', min(publish_date))
  LIMIT 12;
$$;

-- Function to get top 3 most mentioned companies
CREATE OR REPLACE FUNCTION get_top_mentioned_companies()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE sql AS $$
  SELECT unnest(companies) as company, COUNT(*) as count
  FROM podcast_episodes
  GROUP BY company
  ORDER BY count DESC
  LIMIT 3;
$$;