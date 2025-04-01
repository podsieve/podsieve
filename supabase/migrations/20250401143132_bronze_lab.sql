/*
  # Create insight feedback table

  1. New Tables
    - `insight_feedback`
      - `id` (uuid, primary key)
      - `insight_id` (integer, not null)
      - `user_id` (uuid, not null)
      - `feedback_type` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS
    - Add policy for authenticated users to insert feedback
    - Add policy for users to view their own feedback
    - Add unique constraint to prevent multiple feedback from same user
*/

CREATE TABLE IF NOT EXISTS insight_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id integer NOT NULL REFERENCES insights(insight_id),
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

-- Create index for faster lookups
CREATE INDEX idx_insight_feedback_user ON insight_feedback(user_id);
CREATE INDEX idx_insight_feedback_insight ON insight_feedback(insight_id);