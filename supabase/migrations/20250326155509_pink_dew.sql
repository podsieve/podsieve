/*
  # Create channel_images table

  1. New Tables
    - `channel_images`
      - `channel_id` (text, primary key)
      - `channel_name` (text, not null)
      - `channel_image_url` (text, not null)

  2. Security
    - Enable RLS on `channel_images` table
    - Add policy for public read access

  3. Sample Data
    - Add initial channel images
*/

CREATE TABLE IF NOT EXISTS channel_images (
  channel_id text PRIMARY KEY,
  channel_name text NOT NULL,
  channel_image_url text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE channel_images ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access"
  ON channel_images
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO channel_images (channel_id, channel_name, channel_image_url) VALUES
  ('tech-insights', 'Tech Insights Daily', 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=60'),
  ('startup-stories', 'Startup Stories', 'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=800&auto=format&fit=crop&q=60'),
  ('future-finance', 'Future Finance', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop&q=60'),
  ('green-tech', 'Green Tech Talk', 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&auto=format&fit=crop&q=60'),
  ('health-tech', 'Health Tech Today', 'https://images.unsplash.com/photo-1593697821028-7cc59cfd7399?w=800&auto=format&fit=crop&q=60'),
  ('social-impact', 'Social Impact', 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop&q=60');