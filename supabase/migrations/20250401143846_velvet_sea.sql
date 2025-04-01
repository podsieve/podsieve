/*
  # Create insight feedback table and relationships

  1. New Tables
    - `insight_feedback`
      - `id` (uuid, primary key)
      - `insight_id` (integer, references insights)
      - `user_id` (uuid, not null)
      - `feedback_type` (text, check: 'up' or 'down')
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add unique constraint for one feedback per user per insight

  3. Indexes
    - Add indexes for faster lookups
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS insight_feedback;

-- Create insight_feedback table
CREATE TABLE insight_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id integer NOT NULL REFERENCES insights(insight_id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(insight_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE insight_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own feedback"
  ON insight_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
  ON insight_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON insight_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON insight_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX idx_insight_feedback_insight ON insight_feedback(insight_id);
CREATE INDEX idx_insight_feedback_user ON insight_feedback(user_id);