import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import { teamData } from "@/data/team"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="About Us"
        subtitle="Our story, our mission, and the people behind Mystic Tours"
        imagePath="/images/about-header.png"
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl text-[#1a5d1a] mb-6">Our Story</h2>
            <p className="text-lg mb-4">
              Mystic Tours was born from a deep love for Jamaica's rich cultural heritage and a desire to share
              authentic experiences with travelers from around the world.
            </p>
            <p className="text-lg mb-4">
              Founded in 1978 by Marcus Johnson, a local musician and cultural ambassador, our company began as a small
              operation taking visitors to off-the-beaten-path music venues and cultural sites that weren't featured in
              typical tourist itineraries.
            </p>
            <p className="text-lg">
              Over four decades later, we've grown into one of the island's most respected tour operators, but our
              mission remains the same: to connect visitors with the true spirit, rhythm, and soul of Jamaica through
              immersive, authentic experiences.
            </p>
          </div>
          <div className="relative h-[500px] vintage-border">
            <Image
              src="/images/about-story.png"
              alt="Vintage photo of Mystic Tours founder"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#e9b824] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl text-[#1a5d1a] mb-6">Our Mission</h2>
          <p className="text-xl text-[#85603f] max-w-3xl mx-auto">
            "To preserve and share Jamaica's cultural heritage by creating authentic travel experiences that benefit
            local communities, foster cultural understanding, and create lasting memories for our guests."
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-[#1a5d1a] mb-4">Meet Our Team</h2>
          <p className="text-xl max-w-3xl mx-auto">
            Our guides and staff are passionate cultural ambassadors with deep knowledge of Jamaica's history, music,
            and traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamData.map((member) => (
            <div key={member.id} className="vintage-card text-center">
              <div className="relative h-64 w-64 mx-auto mb-4 overflow-hidden rounded-full vintage-border">
                <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              </div>
              <h3 className="text-2xl text-[#1a5d1a] mb-2">{member.name}</h3>
              <p className="text-[#d83f31] font-bold mb-4">{member.role}</p>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
