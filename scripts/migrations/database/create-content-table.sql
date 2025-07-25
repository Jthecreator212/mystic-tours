-- Create the content_areas table
CREATE TABLE IF NOT EXISTS content_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  section TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content areas
INSERT INTO content_areas (area_key, name, description, image_url, alt_text, section)
VALUES
  -- Homepage content areas
  (
    'hero_background',
    'Homepage Hero Background',
    'The main hero background image displayed on the homepage',
    '/images/hero-bg.jpg',
    'Mystic Tours homepage hero background',
    'homepage'
  ),
  
  -- Tour content areas
  (
    'tour_1',
    'Roots & Culture Experience Tour Image',
    'Image for the Roots & Culture Experience tour',
    '/images/tour-1.png',
    'Roots & Culture Experience tour image',
    'tours'
  ),
  (
    'tour_2',
    'Island Paradise Escape Tour Image',
    'Image for the Island Paradise Escape tour',
    '/images/tour-2.png',
    'Island Paradise Escape tour image',
    'tours'
  ),
  (
    'tour_3',
    'Mountain Village Trek Tour Image',
    'Image for the Mountain Village Trek tour',
    '/images/tour-3.png',
    'Mountain Village Trek tour image',
    'tours'
  ),
  
  -- Testimonial content areas
  (
    'testimonial_1',
    'Marcus J. Testimonial Image',
    'Profile image for Marcus J. testimonial',
    '/images/testimonial-1.png',
    'Marcus J. from New York',
    'testimonials'
  ),
  (
    'testimonial_2',
    'Sarah T. Testimonial Image',
    'Profile image for Sarah T. testimonial',
    '/images/testimonial-2.png',
    'Sarah T. from London',
    'testimonials'
  ),
  
  -- About page content areas
  (
    'about_header',
    'About Page Header',
    'The header image for the about page',
    'https://placehold.co/1200x400/4a7c59/ffffff?text=About+Header',
    'About Mystic Tours header image',
    'about'
  ),
  
  -- Gallery content areas
  (
    'gallery_1',
    'Gallery Image 1',
    'First image in the gallery section',
    'https://placehold.co/800x600/4a7c59/ffffff?text=Gallery+Image+1',
    'Beautiful scenery from Jamaica',
    'gallery'
  ),
  (
    'gallery_2',
    'Gallery Image 2',
    'Second image in the gallery section',
    'https://placehold.co/800x600/4a7c59/ffffff?text=Gallery+Image+2',
    'Jamaican cultural experience',
    'gallery'
  ),
  (
    'gallery_3',
    'Gallery Image 3',
    'Third image in the gallery section',
    'https://placehold.co/800x600/4a7c59/ffffff?text=Gallery+Image+3',
    'Tropical beach in Jamaica',
    'gallery'
  ),
  (
    'footer_logo',
    'Footer Logo',
    'The logo displayed in the website footer',
    'https://placehold.co/200x100/4a7c59/ffffff?text=Mystic+Tours+Logo',
    'Mystic Tours logo',
    'global'
  )
ON CONFLICT (area_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  alt_text = EXCLUDED.alt_text,
  section = EXCLUDED.section,
  updated_at = NOW();
