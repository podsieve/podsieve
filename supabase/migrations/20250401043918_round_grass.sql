/*
  # Update get_most_positive_company function

  1. Changes
    - Add company_type='public' filter to get_most_positive_company function
    - Maintain existing filters (3-month window, soft deletes)
    - Keep same return structure

  2. Purpose
    - Filter insights to only show public companies
    - Ensure data relevance and accuracy
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_most_positive_company();

-- Recreate function with public company filter
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
  JOIN videos v ON i.video_id = v.video_id
  WHERE 
    i.insight_sentiment = 'positive' AND
    i.delete_datetime = 'infinity' AND
    c.delete_datetime = 'infinity' AND
    v.delete_datetime = 'infinity' AND
    v.video_publish_datetime >= (CURRENT_DATE - INTERVAL '3 months') AND
    c.company_type = 'public'
  GROUP BY c.company_name
  ORDER BY count DESC
  LIMIT 1;
END;
$$;