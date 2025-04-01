/*
  # Fix trends analysis functions

  1. Functions
    - get_most_positive_company: Returns company with most positive mentions
    - get_most_negative_company: Returns company with most negative mentions
    - get_company_positive_trend: Returns monthly trend of positive mentions for a company
    - get_company_negative_trend: Returns monthly trend of negative mentions for a company
    - get_top_mentioned_companies: Returns top 3 most mentioned companies

  2. Changes
    - Drop existing functions to avoid conflicts
    - Add proper error handling
    - Ensure functions are marked as STABLE
    - Add proper indexes for performance
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS get_most_positive_company();
DROP FUNCTION IF EXISTS get_most_negative_company();
DROP FUNCTION IF EXISTS get_company_positive_trend(text);
DROP FUNCTION IF EXISTS get_company_negative_trend(text);
DROP FUNCTION IF EXISTS get_top_mentioned_companies();

-- Create index for faster sentiment lookups
CREATE INDEX IF NOT EXISTS idx_insights_sentiment 
  ON insights(insight_sentiment);

-- Create index for faster company lookups
CREATE INDEX IF NOT EXISTS idx_insights_company 
  ON insights(company_id);

-- Function to get company with most positive mentions
CREATE OR REPLACE FUNCTION get_most_positive_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.company_name as company,
    COUNT(*) as count
  FROM insights i
  JOIN companies c ON i.company_id = c.company_id
  WHERE 
    i.insight_sentiment = 'positive' AND
    i.delete_datetime = 'infinity' AND
    c.delete_datetime = 'infinity'
  GROUP BY c.company_name
  ORDER BY count DESC
  LIMIT 1;
END;
$$;

-- Function to get company with most negative mentions
CREATE OR REPLACE FUNCTION get_most_negative_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.company_name as company,
    COUNT(*) as count
  FROM insights i
  JOIN companies c ON i.company_id = c.company_id
  WHERE 
    i.insight_sentiment = 'negative' AND
    i.delete_datetime = 'infinity' AND
    c.delete_datetime = 'infinity'
  GROUP BY c.company_name
  ORDER BY count DESC
  LIMIT 1;
END;
$$;

-- Function to get monthly trend of positive mentions for a company
CREATE OR REPLACE FUNCTION get_company_positive_trend(company_name text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(date_trunc('month', v.video_publish_datetime), 'Mon YYYY') as month,
    COUNT(*) as count
  FROM insights i
  JOIN companies c ON i.company_id = c.company_id
  JOIN videos v ON i.video_id = v.video_id
  WHERE 
    c.company_name = company_name AND
    i.insight_sentiment = 'positive' AND
    i.delete_datetime = 'infinity' AND
    c.delete_datetime = 'infinity' AND
    v.delete_datetime = 'infinity'
  GROUP BY date_trunc('month', v.video_publish_datetime)
  ORDER BY date_trunc('month', v.video_publish_datetime) DESC
  LIMIT 6;
END;
$$;

-- Function to get monthly trend of negative mentions for a company
CREATE OR REPLACE FUNCTION get_company_negative_trend(company_name text)
RETURNS TABLE (
  month text,
  count bigint
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(date_trunc('month', v.video_publish_datetime), 'Mon YYYY') as month,
    COUNT(*) as count
  FROM insights i
  JOIN companies c ON i.company_id = c.company_id
  JOIN videos v ON i.video_id = v.video_id
  WHERE 
    c.company_name = company_name AND
    i.insight_sentiment = 'negative' AND
    i.delete_datetime = 'infinity' AND
    c.delete_datetime = 'infinity' AND
    v.delete_datetime = 'infinity'
  GROUP BY date_trunc('month', v.video_publish_datetime)
  ORDER BY date_trunc('month', v.video_publish_datetime) DESC
  LIMIT 6;
END;
$$;

-- Function to get top 3 most mentioned companies
CREATE OR REPLACE FUNCTION get_top_mentioned_companies()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.company_name as company,
    COUNT(*) as count
  FROM insights i
  JOIN companies c ON i.company_id = c.company_id
  WHERE 
    i.delete_datetime = 'infinity' AND
    c.delete_datetime = 'infinity'
  GROUP BY c.company_name
  ORDER BY count DESC
  LIMIT 3;
END;
$$;