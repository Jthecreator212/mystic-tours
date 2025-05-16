import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Contact Us"
        subtitle="Get in touch to plan your perfect Jamaican adventure"
        imagePath="/uploads/header-89e1898c-d43d-4c49-99ea-e90bd04b1509.jpg"
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl text-[#1a5d1a] mb-6">Get In Touch</h2>
            <p className="text-lg mb-8">
              Have questions about our tours? Want to book a custom experience? We're here to help you plan the perfect
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

      <section className="relative h-[400px] mb-[-1px]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.04711154905!2d-76.87305344179685!3d17.997551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8edb3f5e9f85c6a7%3A0x1f87ae4b9e7a2fde!2sKingston%2C%20Jamaica!5e0!3m2!1sen!2sus!4v1651870562753!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      <Footer />
    </main>
  )
}
