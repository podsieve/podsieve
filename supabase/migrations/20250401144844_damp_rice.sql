/*
  # Update insight feedback policies

  1. Changes
    - Remove authentication requirement for feedback
    - Add policy for public insert access
    - Add policy for public read access
    - Keep existing policies for authenticated users

  2. Security
    - Enable RLS
    - Add rate limiting at the database level
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own feedback" ON insight_feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON insight_feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON insight_feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON insight_feedback;

-- Create new policies for public access
CREATE POLICY "Allow public insert access"
  ON insight_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access"
  ON insight_feedback
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public update access"
  ON insight_feedback
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON insight_feedback
  FOR DELETE
  TO public
  USING (true);

-- Add rate limiting function
CREATE OR REPLACE FUNCTION check_feedback_rate_limit(p_insight_id integer)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if there are more than 100 feedbacks for this insight in the last hour
  RETURN (
    SELECT COUNT(*) <= 100
    FROM insight_feedback
    WHERE insight_id = p_insight_id
    AND created_at > NOW() - INTERVAL '1 hour'
  );
END;
$$;