/*
  # Create insights view

  1. New Views
    - `insights_view`
      - Combines data from insights, companies, and videos tables
      - Flattens the structure for easier querying
      - Includes proper joins to handle null relationships

  2. Purpose
    - Simplify data access for the frontend
    - Handle null relationships gracefully
    - Improve query performance
*/

CREATE OR REPLACE VIEW insights_view AS
SELECT
  i.insight_id,
  i.insight_text,
  i.insight_sentiment,
  c.company_name,
  v.video_name,
  v.video_url,
  v.video_publish_datetime,
  ch.channel_name
FROM insights i
LEFT JOIN companies c ON i.company_id = c.company_id
LEFT JOIN videos v ON i.video_id = v.video_id
LEFT JOIN channels ch ON v.channel_id = ch.channel_id
WHERE i.delete_datetime = 'infinity'
  AND c.delete_datetime = 'infinity'
  AND v.delete_datetime = 'infinity'
  AND ch.delete_datetime = 'infinity';

-- Add comment to the view
COMMENT ON VIEW insights_view IS 'Flattened view of insights with related company and video data';