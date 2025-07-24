import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { TourCard } from '@/components/features/tour-card'
import { PageHeader } from '@/components/layout/page-header'
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export const revalidate = 60; // Revalidate data every 60 seconds

async function getTours() {
  const { data, error } = await supabase
    .from('tours')
    .select('id, title, short_description, image_url, price, duration, slug')
    .order('created_at', { ascending: true })
    .limit(3);

  if (error) {
    console.error('Error fetching tours:', error);
    return [];
  }
  
  // Adapt the data structure to what TourCard expects
  return data.map(tour => ({
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.short_description,
    image: tour.image_url,
    price: tour.price,
    duration: tour.duration
  }));
}

export default async function ToursPage() {
  const tours = await getTours();

  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Our Tours"
        subtitle="Discover authentic experiences that connect you with the rhythm and soul of Jamaica"
        imagePaths={[]}
        slideshow={false}
        aspectRatio="16/9"
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      <section className="bg-[#1a5d1a] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl text-[#e9b824] mb-4 font-bold">Create Your Own Adventure</h2>
          <p className="text-xl text-[#f8ede3] max-w-3xl mx-auto mb-8">
            Looking for something specific? We can create a custom tour experience or provide transport to your desired destination.
          </p>
          <Link href="/contact" className="vintage-button animate-bounce-slow">Contact Us</Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
