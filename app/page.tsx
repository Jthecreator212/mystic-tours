import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { JamaicaSlideshow } from "@/components/jamaica-slideshow"
import { TestimonialCarousel } from "@/components/testimonial-carousel"
import { Footer } from "@/components/footer"
import { Newsletter } from "@/components/newsletter"
import { FeaturedToursCarousel } from "@/components/featured-tours-carousel"
import { HomeFeatures } from "@/components/home-features"
import { supabase } from "@/lib/supabase"

export const revalidate = 60; // Revalidate data every 60 seconds

async function getFeaturedTours() {
  const { data, error } = await supabase
    .from('tours')
    .select('id, title, slug, short_description, image_url, price, duration')
    .order('created_at', { ascending: true })
    .limit(3);

  if (error) {
    console.error('Error fetching featured tours:', error);
    return [];
  }
  
  return data.map(tour => ({
    id: tour.id,
    slug: tour.slug,
    title: tour.title,
    description: tour.short_description,
    image: tour.image_url,
    price: tour.price,
    duration: tour.duration
  }));
}

async function getTestimonials() {
    const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
    }
  return data;
}

export default async function Home() {
  const tours = await getFeaturedTours();
  const testimonials = await getTestimonials();

  return (
    <main className="min-h-screen bg-hero-pattern">
      <div className="bg-gradient-to-r from-[#1a5d1a]/80 to-transparent min-h-screen">
        <Navbar />
        <Hero />
        
        <JamaicaSlideshow />

        <section className="container mx-auto px-4 py-16 -mt-[5vh]">
          <div className="mb-20">
            <HomeFeatures />
          </div>

          <FeaturedToursCarousel tours={tours} />
        </section>

        <section className="bg-[#1a5d1a] py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl text-[#e9b824] mb-4 font-bold green-outline-heading">What Our Guests Are Saying</h2>
              <p className="text-xl text-[#f8ede3] max-w-3xl mx-auto">
                See what fellow travelers are saying about their experiences with our tours and services.
              </p>
            </div>

            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>

        <Newsletter />
        <Footer />
      </div>
    </main>
  )
}
