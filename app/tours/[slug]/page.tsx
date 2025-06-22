import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { TourGallery } from "@/components/tour-gallery"
import { TourItinerary } from "@/components/tour-itinerary"
import { TourBookingForm } from "@/components/tour-booking-form"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import type { Metadata } from 'next'

export const revalidate = 60;

async function getTourDetails(slug: string) {
  try {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    
    const { data: tour, error } = await supabase
      .from('tours')
      .select(`
        id,
        title,
        slug,
        short_description,
        description,
        image_url,
        price,
        duration,
        group_size,
        includes,
        departure,
        languages,
        tour_highlights (id, content),
        tour_itinerary (id, display_order, title, description),
        tour_gallery_images (id, image_url, alt_text)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      throw error;
    }

    if (!tour) {
      notFound();
    }

    return tour;

  } catch (err) {
    console.error('Detailed error in getTourDetails:', err);
    notFound();
  }
}

export async function generateStaticParams() {
  const { data: tours, error } = await supabase.from('tours').select('slug');
  if (error || !tours) return [];
  return tours.map((tour) => ({
    slug: tour.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourDetails(slug);
  return {
    title: `${tour.title} | Mystic Tours`,
    description: tour.short_description,
  }
}

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getTourDetails(slug);

  const galleryImages = tour.tour_gallery_images.map(img => ({
    src: img.image_url,
    alt: img.alt_text || tour.title
  }));

  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader title={tour.title} subtitle={tour.short_description || ''} imagePath={tour.image_url || '/placeholder.svg'} />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="prose max-w-none mb-8">
              <h2 className="text-3xl text-[#1a5d1a] mb-4">Tour Overview</h2>
              <p className="text-lg leading-relaxed">{tour.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl text-[#1a5d1a] mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.tour_highlights.slice(0, 4).map((highlight) => (
                  <div key={highlight.id} className="flex items-start">
                    <div className="bg-[#e9b824] p-1.5 rounded-full mr-3 mt-1 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1a5d1a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-sm">{highlight.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl text-[#1a5d1a] mb-4">Quick Info</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Duration:</span>
                  <p>{tour.duration}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Group Size:</span>
                  <p>{tour.group_size}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Departure:</span>
                  <p>{tour.departure}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Languages:</span>
                  <p>{(tour.languages as string[]).join(", ")}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="vintage-card sticky top-24">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <span className="text-4xl font-playfair font-bold text-[#d83f31]">${tour.price}</span>
                  <p className="text-sm text-[#85603f]">per person</p>
                </div>
                <p className="text-sm text-gray-600 mb-4">Ready to experience Jamaica?</p>
              </div>

              <TourBookingForm tourId={tour.id} tourName={tour.title} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
