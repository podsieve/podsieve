/*
  # Update get_most_positive_company function with robust public company filtering

  1. Changes
    - Drop existing function
    - Add explicit type casting for company_type
    - Use COALESCE to handle NULL values
    - Add additional validation for company_type
    - Maintain existing filters (3-month window, soft deletes)

  2. Purpose
    - Ensure reliable filtering of public companies
    - Handle edge cases and data inconsistencies
    - Improve query performance with proper indexing
*/

-- Create index for company_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);

-- Drop existing function
DROP FUNCTION IF EXISTS get_most_positive_company();

-- Recreate function with robust public company filtering
CREATE OR REPLACE FUNCTION get_most_positive_company()
RETURNS TABLE (
  company text,
  count bigint
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  WITH valid_companies AS (
    SELECT company_id, company_name
    FROM companies
    WHERE 
      delete_datetime = 'infinity' AND
      COALESCE(LOWER(TRIM(company_type)), '') = 'public'
  )
  SELECT 
    vc.company_name as company,
    COUNT(*) as count
  FROM insights i
  JOIN valid_companies vc ON i.company_id = vc.company_id
  JOIN videos v ON i.video_id = v.video_id
  WHERE 
    i.insight_sentiment = 'positive' AND
    i.delete_datetime = 'infinity' AND
    v.delete_datetime = 'infinity' AND
    v.video_publish_datetime >= (CURRENT_DATE - INTERVAL '3 months')
  GROUP BY vc.company_name
  ORDER BY count DESC
  LIMIT 1;
END;
$$;