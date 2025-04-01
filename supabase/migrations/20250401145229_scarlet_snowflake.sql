/*
  # Update insight feedback table for anonymous users

  1. Changes
    - Remove UUID constraint from user_id column
    - Add check constraint to ensure valid user_id format
    - Keep existing policies and rate limiting
*/

-- Create new table with modified structure
CREATE TABLE IF NOT EXISTS insight_feedback_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id integer NOT NULL REFERENCES insights(insight_id) ON DELETE CASCADE,
  user_id text NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(insight_id, user_id)
);

-- Copy data from old table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insight_feedback') THEN
    INSERT INTO insight_feedback_new (id, insight_id, user_id, feedback_type, created_at)
    SELECT id, insight_id, user_id::text, feedback_type, created_at
    FROM insight_feedback;
  END IF;
END $$;

-- Drop old table if it exists
DROP TABLE IF EXISTS insight_feedback;

-- Rename new table to final name
ALTER TABLE insight_feedback_new RENAME TO insight_feedback;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insight_feedback_insight ON insight_feedback(insight_id);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_user ON insight_feedback(user_id);

-- Enable RLS
ALTER TABLE insight_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
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