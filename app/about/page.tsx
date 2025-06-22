"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { ImageEditOverlay } from "@/components/image-edit-overlay"

export const revalidate = 60;

type TeamMember = {
  id: number;
  name: string;
  role: string;
  bio: string;
  image_url: string;
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
  return data;
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="About Us"
        subtitle="Our story, our mission, and the people behind Mystic Tours"
        imagePath="/uploads/header-2e8e4f0e-39ef-4acb-a9cf-ab839c72cb68.png"
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
            {/* Using the same pattern as TourCard for consistency */}
            <ImageEditOverlay 
              imageSrc="/uploads/story-about-414fd853-f365-4bb7-98cb-e69950aa9bd8.png" 
              alt="Vintage photo of Mystic Tours founder"
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

      <section className="py-20 bg-[#f8ede3]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#1a5d1a]">Meet Our Team</h2>
            <p className="text-lg text-[#85603f] mt-2 max-w-2xl mx-auto">
              Our guides are the heart of Mystic Tours—storytellers, historians, and cultural ambassadors dedicated to making your journey unforgettable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="vintage-card text-center p-6">
                <div className="relative h-40 w-40 mx-auto mb-4">
                  <Image
                    src={member.image_url || '/placeholder.svg'}
                    alt={`Portrait of ${member.name}`}
                    layout="fill"
                    className="rounded-full object-cover border-4 border-[#e9b824]"
                  />
                </div>
                <h3 className="text-2xl font-playfair text-[#1a5d1a]">{member.name}</h3>
                <p className="text-[#d83f31] font-bold mb-2">{member.role}</p>
                <p className="text-[#85603f] text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
