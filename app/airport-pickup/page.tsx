import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { AirportPickupForm } from "@/components/airport-pickup-form"

export const revalidate = 60;

export default function AirportPickupPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Airport Pickup Service"
        subtitle="Start your Jamaican adventure the right way with our reliable Montego Bay Airport transfers."
        imagePath="/images/gallery/paradise-6.png"
      />

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-playfair text-[#1a5d1a] mb-2">Book Your Private Transfer</h2>
              <p className="text-lg text-[#85603f]">
                Simple, flat-rate pricing of <span className="font-bold text-[#d83f31]">$75.00</span> for a private, comfortable ride from Montego Bay Airport (MBJ) to your destination.
              </p>
            </div>
            <AirportPickupForm />
        </div>
      </section>

      <Footer />
    </main>
  )
} 