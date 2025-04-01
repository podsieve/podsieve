/*
  # Create podcast_tiles table

  1. New Tables
    - `podcast_tiles`
      - `id` (serial, primary key)
      - `image_url` (text)
      - `title` (text)
      - `companies` (text)
      - `episode` (text)
      - `publish_date` (timestamp)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `podcast_tiles` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS podcast_tiles (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  companies TEXT NOT NULL,
  episode TEXT NOT NULL,
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
INSERT INTO podcast_tiles (image_url, title, companies, episode, publish_date) VALUES
  ('https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=60', 'Tech Insights Daily', 'Apple, Microsoft, Google', 'The Future of AI in Enterprise', '2024-03-15'),
  ('https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=800&auto=format&fit=crop&q=60', 'Startup Stories', 'Tesla, SpaceX, Netflix', 'Building Sustainable Business Models', '2024-03-14'),
  ('https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop&q=60', 'Future Finance', 'Goldman Sachs, JP Morgan, Visa', 'Digital Currency Revolution', '2024-03-13'),
  ('https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&auto=format&fit=crop&q=60', 'Green Tech Talk', 'Ford, GM, Toyota', 'Electric Vehicle Innovation', '2024-03-12'),
  ('https://images.unsplash.com/photo-1593697821028-7cc59cfd7399?w=800&auto=format&fit=crop&q=60', 'Health Tech Today', 'Pfizer, Johnson & Johnson, Moderna', 'Digital Health Revolution', '2024-03-11'),
  ('https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop&q=60', 'Social Impact', 'Meta, Twitter, LinkedIn', 'Future of Social Networks', '2024-03-10');