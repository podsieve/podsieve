/*
  # Update get_most_positive_company function

  1. Changes
    - Add 3-month filter to get_most_positive_company function
    - Use video_publish_datetime for date filtering
    - Keep only data from the last 3 months
    - Maintain existing joins and conditions

  2. Purpose
    - Ensure trends are based on recent data only
    - Improve relevance of insights
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_most_positive_company();

-- Recreate function with 3-month filter
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
    v.video_publish_datetime >= (CURRENT_DATE - INTERVAL '3 months')
  GROUP BY c.company_name
  ORDER BY count DESC
  LIMIT 1;
END;
$$;