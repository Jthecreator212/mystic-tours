import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { TourGallery } from "@/components/tour-gallery"
import { TourItinerary } from "@/components/tour-itinerary"
import { TourBookingForm } from "@/components/tour-booking-form"
import { tourData } from "@/data/tours"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return tourData.map((tour) => ({
    slug: tour.slug,
  }))
}

type TourPageProps = {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default function TourPage({ params }: TourPageProps) {
  const tour = tourData.find((tour) => tour.slug === params.slug)

  if (!tour) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader title={tour.title} subtitle={tour.shortDescription} imagePath={tour.image} />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="prose max-w-none mb-12">
              <h2 className="text-3xl text-[#1a5d1a]">Tour Overview</h2>
              <p className="text-lg">{tour.description}</p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl text-[#1a5d1a] mb-6">Tour Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tour.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-[#e9b824] p-2 rounded-full mr-3 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                    <p>{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            <TourItinerary itinerary={tour.itinerary} />
            <TourGallery images={tour.galleryImages} />
          </div>

          <div>
            <div className="vintage-card sticky top-24">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl text-[#1a5d1a]">Tour Details</h3>
                  <span className="text-2xl font-playfair font-bold text-[#d83f31]">${tour.price}</span>
                </div>
                <p className="text-sm text-[#85603f]">per person</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold">Duration:</span>
                  <span>{tour.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Group Size:</span>
                  <span>{tour.groupSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Includes:</span>
                  <span>{tour.includes.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Departure:</span>
                  <span>{tour.departure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Languages:</span>
                  <span>{tour.languages.join(", ")}</span>
                </div>
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
