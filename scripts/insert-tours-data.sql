-- Insert Tours Data for Mystic Tours
-- Run this in Supabase Studio SQL Editor after ensuring the schema is correct

-- Insert tour 1: Roots & Culture Experience
INSERT INTO tours (
  id, title, slug, short_description, description, image_url, price, duration, group_size, includes, departure, languages
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Roots & Culture Experience',
  'roots-culture-experience',
  'Journey through the birthplace of reggae music and experience the vibrant culture that inspired a global movement.',
  'Immerse yourself in the rich cultural heritage of Jamaica on this full-day tour that takes you through the birthplace of reggae music. Visit iconic music studios, meet local artists, and experience the vibrant culture that inspired a global movement. From the bustling streets of Kingston to the serene countryside, this tour offers an authentic glimpse into the heart and soul of Jamaica.',
  '/uploads/tour-1-3c1c5637-8b25-48db-8f5a-3bcf8fc3f638.jpg',
  149.00,
  'Full Day (8 Hours)',
  '2-12 people',
  ARRAY['Transportation', 'Lunch', 'Entrance fees', 'Guide'],
  'Kingston, 9:00 AM',
  ARRAY['English', 'Spanish']
) ON CONFLICT (slug) DO NOTHING;

-- Insert highlights for tour 1
INSERT INTO tour_highlights (tour_id, content) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Visit the Bob Marley Museum in Kingston'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Tour Tuff Gong Recording Studio'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Experience a live reggae performance'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Meet local artists and musicians'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Enjoy authentic Jamaican cuisine'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Learn about Rastafarian culture and history');

-- Insert itinerary for tour 1
INSERT INTO tour_itinerary (tour_id, title, description, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Morning: Kingston Cultural Tour', 'The day begins with pickup from your hotel in Kingston. We''ll visit the Bob Marley Museum, housed in the legendary musician''s former residence. Here, you''ll see personal artifacts, memorabilia, and learn about his life and impact on music worldwide. Next, we''ll tour Tuff Gong Recording Studio, founded by Bob Marley in 1965, where you''ll see how reggae music is produced.', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'Midday: Lunch & Local Markets', 'Enjoy a delicious lunch featuring traditional Jamaican cuisine at a local restaurant. After lunch, we''ll explore the vibrant markets of Kingston, where you can purchase local crafts, music, and artwork. You''ll have the opportunity to meet local artisans and learn about their craft.', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'Afternoon: Music & Culture', 'In the afternoon, we''ll visit the Jamaica Music Museum to learn about the evolution of Jamaican music from mento and ska to reggae and dancehall. Later, we''ll attend a workshop on Rastafarian culture, where you''ll learn about its history, beliefs, and global influence.', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 'Evening: Live Performance', 'The tour concludes with a live reggae performance at a local venue, where you can experience the power and energy of Jamaica''s most famous musical export. You''ll be returned to your hotel by approximately 5:00 PM.', 4);

-- Show confirmation
SELECT 'Tour 1 data inserted successfully' as status; 