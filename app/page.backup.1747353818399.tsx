import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { TourCard } from "@/components/tour-card"
import { PageHeader } from "@/components/page-header"
import { tourData } from "@/data/tours"

export default function ToursPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Our Tours"
        subtitle="Discover authentic experiences that connect you with the rhythm and soul of Jamaica"
        imagePath="/uploads/header-464d9d00-10da-47e1-bb8b-e71471de421a.jpg"
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tourData.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      <section className="bg-[#1a5d1a] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl text-[#e9b824] mb-4">Custom Tours Available</h2>
          <p className="text-xl text-[#f8ede3] max-w-3xl mx-auto mb-8">
            Looking for something specific? We can create a custom tour experience tailored to your interests.
          </p>
          <button className="vintage-button">Contact Us</button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
