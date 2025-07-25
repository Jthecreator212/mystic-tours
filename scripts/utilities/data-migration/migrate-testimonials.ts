require('dotenv').config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or service key is not defined in .env.local file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testimonialsData = [
  {
    name: "Marcus J.",
    quote: "This tour changed my life! The guides were knowledgeable and the music was incredible. I felt the spirit of the island in my soul.",
    location: "New York, USA",
    image_url: "/uploads/testimonial-1-595361c7-4a0a-46ec-92bd-33e21a2abdbc.png",
    rating: 5,
  },
  {
    name: "Sarah T.",
    quote: "An authentic experience that goes beyond the typical tourist attractions. The local connections made this trip unforgettable.",
    location: "London, UK",
    image_url: "/uploads/testimonial-2-fa4d60c7-4b04-4441-ae37-8b906164057d.png",
    rating: 5,
  },
];

async function migrateTestimonials() {
  console.log('Starting testimonials migration...');

  // Check if testimonials already exist to prevent duplicates
  const { data: existingTestimonials, error: selectError } = await supabase
    .from('testimonials')
    .select('name');

  if (selectError) {
    console.error('Error checking for existing testimonials:', selectError);
    return;
  }

  const existingNames = existingTestimonials.map(t => t.name);
  const testimonialsToInsert = testimonialsData.filter(t => !existingNames.includes(t.name));

  if (testimonialsToInsert.length === 0) {
    console.log('All testimonials already exist in the database. No migration needed.');
    return;
  }

  console.log(`Inserting ${testimonialsToInsert.length} new testimonials...`);

  const { error: insertError } = await supabase
    .from('testimonials')
    .insert(testimonialsToInsert);

  if (insertError) {
    console.error('Error inserting testimonials:', insertError);
  } else {
    console.log('Successfully inserted testimonials!');
  }
}

migrateTestimonials().catch(console.error); 