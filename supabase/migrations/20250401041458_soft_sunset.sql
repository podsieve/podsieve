/*
  # Create insights view and trend analysis functions

  1. New View
    - `insights_view`: Provides detailed insights with sentiment analysis
    
  2. New Functions
    - `get_channel_sentiment_trend`: Returns monthly sentiment trends for a channel
    - `get_channel_most_negative_company`: Returns company with most negative mentions in a channel

  3. Purpose
    - Support trend analysis visualization
    - Track sentiment over time
    - Identify companies with negative sentiment patterns
*/

-- Create view for detailed insights
CREATE VIEW insights_view AS
SELECT
  i.insight_id,
  i.insight_text,
  i.insight_sentiment,
  c.company_name,
  v.video_name AS video_title,
  v.video_url,
  v.video_publish_datetime,
  ch.channel_name,
  ch.channel_id
FROM insights i
LEFT JOIN companies c ON i.company_id = c.company_id
LEFT JOIN videos v ON i.video_id = v.video_id
LEFT JOIN channels ch ON v.channel_id = ch.channel_id
WHERE i.delete_datetime = 'infinity'
  AND c.delete_datetime = 'infinity'
  AND v.delete_datetime = 'infinity'
  AND ch.delete_datetime = 'infinity';

-- Function to get sentiment trend for a channel
CREATE OR REPLACE FUNCTION get_channel_sentiment_trend(p_channel_name text)
RETURNS TABLE (
  month text,
  positive_count bigint,
  negative_count bigint,
  neutral_count bigint
) LANGUAGE sql STABLE AS $$
  WITH monthly_counts AS (
    SELECT 
      date_trunc('month', video_publish_datetime) as mention_month,
      insight_sentiment,
      COUNT(*) as count
    FROM insights_view
    WHERE channel_name = p_channel_name
    GROUP BY mention_month, insight_sentiment
  )
  SELECT 
    to_char(mention_month, 'Mon YYYY') as month,
    SUM(CASE WHEN insight_sentiment = 'positive' THEN count ELSE 0 END) as positive_count,
    SUM(CASE WHEN insight_sentiment = 'negative' THEN count ELSE 0 END) as negative_count,
    SUM(CASE WHEN insight_sentiment = 'neutral' THEN count ELSE 0 END) as neutral_count
  FROM monthly_counts
  GROUP BY month, mention_month
  ORDER BY mention_month DESC
  LIMIT 6;
$$;

-- Function to get company with most negative mentions in a channel
CREATE OR REPLACE FUNCTION get_channel_most_negative_company(p_channel_name text)
RETURNS TABLE (
  company_name text,
  negative_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT 
    company_name,
    COUNT(*) as negative_count
  FROM insights_view
  WHERE 
    channel_name = p_channel_name AND
    insight_sentiment = 'negative'
  GROUP BY company_name
  ORDER BY negative_count DESC
  LIMIT 1;
$$;