/*
  # Add image_url to video_details table

  1. Changes
    - Add image_url column to video_details table
    - Update existing records with sample images
*/

-- Add image_url column
ALTER TABLE video_details 
ADD COLUMN IF NOT EXISTS image_url text;

-- Update existing records with sample images
UPDATE video_details
SET image_url = CASE 
  WHEN id % 6 = 0 THEN 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=60'
  WHEN id % 6 = 1 THEN 'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=800&auto=format&fit=crop&q=60'
  WHEN id % 6 = 2 THEN 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop&q=60'
  WHEN id % 6 = 3 THEN 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&auto=format&fit=crop&q=60'
  WHEN id % 6 = 4 THEN 'https://images.unsplash.com/photo-1593697821028-7cc59cfd7399?w=800&auto=format&fit=crop&q=60'
  ELSE 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop&q=60'
END
WHERE image_url IS NULL;