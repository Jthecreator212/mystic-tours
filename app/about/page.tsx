"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import Image from "next/image"
import { teamData } from "@/data/team"
import { ImageEditOverlay } from "@/components/image-edit-overlay"
import { useEditMode } from "@/context/edit-mode-context"
import { uploadImage } from "@/lib/image-upload"

export default function AboutPage() {
  const { isEditMode } = useEditMode()
  
  // Handler for story image changes - similar to other working components
  const handleStoryImageChange = async (file: File) => {
    try {
      // Upload the image with story ID for proper categorization
      return await uploadImage(file, 'about', 'story')
    } catch (error) {
      console.error('Error uploading story image:', error)
      return URL.createObjectURL(file)
    }
  }
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
              storyId="about"
              isAdmin={isEditMode} 
              onImageChange={handleStoryImageChange}
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

      {/* Team section removed as requested */}

      <Footer />
    </main>
  )
}
