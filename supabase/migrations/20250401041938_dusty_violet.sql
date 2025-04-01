/*
  # Fix ambiguous column references in trend functions

  1. Changes
    - Drop existing functions to avoid conflicts
    - Recreate functions with explicit table references
    - Add proper aliases to avoid ambiguity
    - Ensure consistent column naming

  2. Functions Updated
    - get_most_positive_company
    - get_most_negative_company
    - get_company_positive_trend
    - get_company_negative_trend
    - get_top_mentioned_companies
*/

-- Drop existing functions
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
CREATE OR REPLACE FUNCTION get_company_positive_trend(p_company_name text)
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
    c.company_name = p_company_name AND
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
CREATE OR REPLACE FUNCTION get_company_negative_trend(p_company_name text)
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
    c.company_name = p_company_name AND
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