-- Populate Tours Data for Mystic Tours
-- Run this in Supabase Studio SQL Editor after ensuring the schema is correct

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM tour_gallery_images;
-- DELETE FROM tour_itinerary;
-- DELETE FROM tour_highlights;
-- DELETE FROM tours;

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

-- Insert gallery images for tour 1
INSERT INTO tour_gallery_images (tour_id, image_url, alt_text) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-1.png', 'Bob Marley Museum'),
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-2.png', 'Recording studio session'),
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-3.png', 'Live reggae performance'),
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-4.png', 'Traditional Jamaican food'),
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-5.png', 'Kingston market'),
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-6.png', 'Rastafarian cultural center'),
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-7.png', 'Jamaican countryside'),
  ('550e8400-e29b-41d4-a716-446655440001', '/images/gallery/roots-8.png', 'Local artisans');

-- Insert tour 2: Island Paradise Escape
INSERT INTO tours (
  id, title, slug, short_description, description, image_url, price, duration, group_size, includes, departure, languages
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Island Paradise Escape',
  'island-paradise-escape',
  'Discover hidden beaches, crystal clear waters, and the natural beauty that makes our island a true paradise.',
  'Escape to the pristine beaches and hidden coves of Jamaica''s stunning coastline. This tour takes you off the beaten path to discover secluded beaches, crystal clear waters, and the natural beauty that makes our island a true paradise. Swim, snorkel, and relax in some of the most beautiful locations Jamaica has to offer.',
  '/uploads/tour-2-54c86ae0-8cb1-43be-a1a8-0ed6f2b8b3ec.jpg',
  129.00,
  '8 Hours',
  '2-10 people',
  ARRAY['Transportation', 'Lunch', 'Snorkeling gear', 'Guide'],
  'Montego Bay, 8:30 AM',
  ARRAY['English', 'German']
) ON CONFLICT (slug) DO NOTHING;

-- Insert highlights for tour 2
INSERT INTO tour_highlights (tour_id, content) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Visit three secluded beaches not found on typical tourist maps'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Snorkel in crystal clear waters with vibrant marine life'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Enjoy a beachside lunch with fresh seafood'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Hike to a hidden waterfall'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Learn about coastal ecology and conservation efforts'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Relax in pristine natural surroundings');

-- Insert itinerary for tour 2
INSERT INTO tour_itinerary (tour_id, title, description, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Morning: Secret Beach Cove', 'After pickup from your hotel, we''ll travel to our first destination - a secluded beach cove accessible only by a short trail. Here, you''ll have time to swim in the crystal clear waters, relax on the white sand, and explore the surrounding area. Our guide will point out unique coastal plants and wildlife.', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Midday: Snorkeling & Lunch', 'Next, we''ll visit a protected reef area perfect for snorkeling. You''ll see colorful coral formations and a variety of tropical fish. After working up an appetite, we''ll enjoy a delicious beachside lunch featuring fresh seafood and local specialties prepared by our chef.', 2),
  ('550e8400-e29b-41d4-a716-446655440002', 'Afternoon: Hidden Waterfall', 'In the afternoon, we''ll take a short hike through lush vegetation to a hidden waterfall. This is a perfect spot for photos and a refreshing swim in the natural pool. Your guide will share stories about the area''s history and the local legends associated with the waterfall.', 3),
  ('550e8400-e29b-41d4-a716-446655440002', 'Evening: Sunset Beach', 'Our final stop is a west-facing beach, perfectly positioned to watch the sunset. Relax with a refreshing drink as the sun dips below the horizon, creating a spectacular end to your island paradise experience. You''ll return to your hotel by approximately 6:30 PM.', 4);

-- Insert gallery images for tour 2
INSERT INTO tour_gallery_images (tour_id, image_url, alt_text) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-1.png', 'Secluded beach cove'),
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-2.png', 'Snorkeling in coral reef'),
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-3.png', 'Beachside lunch'),
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-4.png', 'Hidden waterfall'),
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-5.png', 'Tropical fish'),
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-6.png', 'Sunset on the beach'),
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-7.png', 'Coastal hiking trail'),
  ('550e8400-e29b-41d4-a716-446655440002', '/images/gallery/paradise-8.png', 'Natural swimming pool');

-- Insert tour 3: Mountain Village Trek
INSERT INTO tours (
  id, title, slug, short_description, description, image_url, price, duration, group_size, includes, departure, languages
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'Mountain Village Trek',
  'mountain-village-trek',
  'Explore authentic mountain villages, meet local artisans, and experience traditions passed down through generations.',
  'Journey into the heart of Jamaica''s Blue Mountains to discover authentic villages, meet local artisans, and experience traditions passed down through generations. This immersive tour takes you away from tourist areas and into real communities where you''ll learn about rural Jamaican life, sample locally grown coffee, and witness traditional crafts being made by skilled artisans.',
  '/uploads/tour-3-ab5bce3-9824-44b7-b088-ad752ff3f67b.jpg',
  169.00,
  'Full Day',
  '2-8 people',
  ARRAY['Transportation', 'Meals', 'Coffee tasting', 'Craft workshop', 'Guide'],
  'Kingston, 7:30 AM',
  ARRAY['English']
) ON CONFLICT (slug) DO NOTHING;

-- Insert highlights for tour 3
INSERT INTO tour_highlights (tour_id, content) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Visit authentic mountain villages in the Blue Mountains'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Tour a family-owned coffee plantation'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Participate in a traditional craft workshop'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Enjoy home-cooked Jamaican food with a local family'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Learn about medicinal plants and herbal remedies'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Experience breathtaking mountain views');

-- Insert itinerary for tour 3
INSERT INTO tour_itinerary (tour_id, title, description, display_order) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Morning: Blue Mountain Journey', 'We''ll depart early from Kingston and drive into the majestic Blue Mountains. As we ascend, your guide will point out interesting plants and share stories about the region''s history. Our first stop is a family-owned coffee plantation where you''ll learn about the entire coffee-making process from bean to cup, followed by a tasting of the world-famous Blue Mountain Coffee.', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 'Midday: Village Life & Lunch', 'Next, we''ll visit a traditional mountain village where you''ll be welcomed into a local home for an authentic Jamaican lunch. You''ll learn about daily life in the mountains and the challenges and joys of rural living. After lunch, we''ll tour the village, meeting residents and learning about community initiatives.', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Afternoon: Artisan Workshop', 'In the afternoon, you''ll participate in a hands-on workshop with local artisans. Depending on the village we visit, this could be basket weaving, wood carving, or traditional textile arts. You''ll create your own souvenir to take home while learning skills passed down through generations.', 3),
  ('550e8400-e29b-41d4-a716-446655440003', 'Evening: Medicinal Garden & Return', 'Before departing, we''ll visit a medicinal herb garden where you''ll learn about traditional Jamaican remedies and their uses. As we descend from the mountains, we''ll stop at a scenic overlook for breathtaking views and photos. You''ll return to Kingston with a deeper understanding of Jamaica''s mountain communities and their rich cultural heritage.', 4);

-- Insert gallery images for tour 3
INSERT INTO tour_gallery_images (tour_id, image_url, alt_text) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-1.png', 'Blue Mountain views'),
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-2.png', 'Coffee plantation'),
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-3.png', 'Traditional village'),
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-4.png', 'Local artisan'),
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-5.png', 'Home-cooked meal'),
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-6.png', 'Medicinal herb garden'),
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-7.png', 'Craft workshop'),
  ('550e8400-e29b-41d4-a716-446655440003', '/images/gallery/mountain-8.png', 'Mountain hiking trail');

-- Show confirmation
SELECT 'Tours data populated successfully' as status;
SELECT COUNT(*) as tours_count FROM tours;
SELECT COUNT(*) as highlights_count FROM tour_highlights;
SELECT COUNT(*) as itinerary_count FROM tour_itinerary;
SELECT COUNT(*) as gallery_count FROM tour_gallery_images; 