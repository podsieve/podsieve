/*
  # Create podcast_tiles table

  1. New Tables
    - `podcast_tiles`
      - `id` (serial, primary key)
      - `channel_icon_url` (text)
      - `channel_name` (text)
      - `video_title` (text)
      - `companies` (text)
      - `publish_date` (timestamp)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `podcast_tiles` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS podcast_tiles (
  id SERIAL PRIMARY KEY,
  channel_icon_url TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  video_title TEXT NOT NULL,
  companies TEXT NOT NULL,
  publish_date TIMESTAMP NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE podcast_tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON podcast_tiles
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO podcast_tiles (channel_icon_url, channel_name, video_title, companies, publish_date) VALUES
  ('https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=60', 'Tech Insights Daily', 'The Future of AI in Enterprise', 'Apple, Microsoft, Google', '2024-03-15'),
  ('https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=800&auto=format&fit=crop&q=60', 'Startup Stories', 'Building Sustainable Business Models', 'Tesla, SpaceX, Netflix', '2024-03-14'),
  ('https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop&q=60', 'Future Finance', 'Digital Currency Revolution', 'Goldman Sachs, JP Morgan, Visa', '2024-03-13'),
  ('https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&auto=format&fit=crop&q=60', 'Green Tech Talk', 'Electric Vehicle Innovation', 'Ford, GM, Toyota', '2024-03-12'),
  ('https://images.unsplash.com/photo-1593697821028-7cc59cfd7399?w=800&auto=format&fit=crop&q=60', 'Health Tech Today', 'Digital Health Revolution', 'Pfizer, Johnson & Johnson, Moderna', '2024-03-11'),
  ('https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop&q=60', 'Social Impact', 'Future of Social Networks', 'Meta, Twitter, LinkedIn', '2024-03-10');