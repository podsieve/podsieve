/*
  # Update get_most_positive_company function

  1. Changes
    - Drop existing function
    - Recreate with public company filter
    - Maintain existing filters (3-month window, soft deletes)
    - Add explicit UPPER() comparison for company_type to handle case variations

  2. Purpose
    - Ensure only public companies are included in results
    - Make company_type comparison case-insensitive
    - Keep existing functionality intact
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_most_positive_company();

-- Recreate function with strict public company filter
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
    UPPER(c.company_type) = 'PUBLIC'
  GROUP BY c.company_name
  ORDER BY count DESC
  LIMIT 1;
END;
$$;