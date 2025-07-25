"use client"

import { useState } from "react"
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageHeader } from '@/components/layout/page-header'

import { galleryData } from "@/data/gallery"
import { ImageEditOverlay } from "@/components/image-edit-overlay"

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredImages =
    selectedCategory === "all" ? galleryData : galleryData.filter((image) => image.category === selectedCategory)

  const categories = [
    { id: "all", name: "All" },
    { id: "culture", name: "Culture" },
    { id: "nature", name: "Nature" },
    { id: "music", name: "Music" },
    { id: "food", name: "Food" },
  ]

  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Gallery"
        subtitle="Glimpses of the authentic Jamaica experience"
        imagePaths={["/uploads/header-60aa23d5-542b-4048-b74d-d7c89c8edfff.jpg"]}
      />

      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full border-2 border-[#1a5d1a] font-bold transition-colors ${
                selectedCategory === category.id
                  ? "bg-[#1a5d1a] text-[#f8ede3]"
                  : "bg-transparent text-[#1a5d1a] hover:bg-[#e9b824]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="group">
              <div className="relative h-72 overflow-hidden vintage-border">
                {/* Add ImageEditOverlay for editing */}
                <ImageEditOverlay 
                  key={`gallery-image-${image.id}-${image.src}`}
                  imageSrc={image.src || "/placeholder.svg"}
                  alt={image.alt}
                />
                
                {/* Image hover overlay for information */}
                <div className="absolute inset-0 bg-[#1a5d1a]/0 group-hover:bg-[#1a5d1a]/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-5">
                  <div className="text-center p-4">
                    <h3 className="text-xl text-[#e9b824] font-bold">{image.title}</h3>
                    <p className="text-[#f8ede3]">{image.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
