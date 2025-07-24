import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageHeader } from '@/components/layout/page-header'
import { ContactForm } from '@/components/forms/contact-form'
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Contact Us"
        subtitle="Get in touch to plan your perfect Jamaican adventure"
        imagePaths={["/uploads/header-4dfe3ca2-163d-4626-8e21-8591da171a75.jpg"]}
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl text-[#1a5d1a] mb-6">Get In Touch</h2>
            <p className="text-lg mb-8">
              Have questions about our tours? Want to book a custom experience? We&apos;re here to help you plan the perfect
              Jamaican adventure.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="bg-[#e9b824] p-3 rounded-full mr-4">
                  <MapPin className="text-[#1a5d1a] h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a5d1a]">Our Location</h3>
                  <p>123 Reggae Road, Kingston, Jamaica</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#e9b824] p-3 rounded-full mr-4">
                  <Phone className="text-[#1a5d1a] h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a5d1a]">Phone</h3>
                  <p>+1 (876) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#e9b824] p-3 rounded-full mr-4">
                  <Mail className="text-[#1a5d1a] h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a5d1a]">Email</h3>
                  <p>info@mystictours.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-[#e9b824] p-3 rounded-full mr-4">
                  <Clock className="text-[#1a5d1a] h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1a5d1a]">Office Hours</h3>
                  <p>Monday - Friday: 9am - 5pm</p>
                  <p>Saturday: 10am - 2pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="vintage-card">
              <h3 className="text-2xl text-[#1a5d1a] mb-6">Send Us a Message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
