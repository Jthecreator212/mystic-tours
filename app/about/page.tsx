import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageHeader } from '@/components/layout/page-header'

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
  const _teamMembers = await getTeamMembers();

  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="About Us"
        subtitle="Our story, our mission, and the people behind Mystic Tours"
        imagePaths={["/uploads/header-2e8e4f0e-39ef-4acb-a9cf-ab839c72cb68.png"]}
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl text-[#1a5d1a] mb-6">Our Story</h2>
            <p className="text-lg mb-4">
              Mystic Tours was born from a deep love for Jamaica&apos;s rich cultural heritage and a desire to share
              authentic experiences with travelers from around the world.
            </p>
            <p className="text-lg mb-4">
              Founded in 1978 by Marcus Johnson, a local musician and cultural ambassador, our company began as a small
              operation taking visitors to off-the-beaten-path music venues and cultural sites that weren&apos;t featured in
              typical tourist itineraries.
            </p>
            <p className="text-lg">
              Over four decades later, we&apos;ve grown into one of the island&apos;s most respected tour operators, but our
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

      <Footer />
    </main>
  );
}
