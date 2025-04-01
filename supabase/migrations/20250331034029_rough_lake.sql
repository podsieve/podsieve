/*
  # Create contact messages table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `subject` (text, not null)
      - `message` (text, not null, max 300 chars)
      - `created_at` (timestamptz, default now())
      - `is_spam` (boolean, default false)
      - `is_processed` (boolean, default false)

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for public insert access
    - Add policy for authenticated users to read data
    - Add constraints to prevent abuse
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL CHECK (length(message) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_spam boolean NOT NULL DEFAULT false,
  is_processed boolean NOT NULL DEFAULT false
);

-- Create index on email for faster filtering
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public insert access"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (
    -- Basic validation
    length(message) <= 300 AND
    length(email) <= 255 AND
    length(name) <= 100 AND
    length(subject) <= 100 AND
    -- Rate limiting by IP is handled at the application level
    true
  );

CREATE POLICY "Allow authenticated users to read contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);