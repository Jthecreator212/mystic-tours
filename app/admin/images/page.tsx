"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageManager } from "@/components/admin/ImageManager"
import { adminStyles } from "@/app/admin/styles"
import { Plus } from "lucide-react"

export default function ImagesPage() {
  const [images, setImages] = useState([])

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const newImage = await response.json()
      setImages(prev => [...prev, newImage])
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/admin/images/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      setImages(prev => prev.filter(img => img.id !== id))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image. Please try again.')
    }
  }

  const handleUpdate = async (id: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('id', id)
      
      const response = await fetch(`/api/admin/images/${id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update image')
      }

      const updatedImage = await response.json()
      setImages(prev => 
        prev.map(img => (img.id === id ? updatedImage : img))
      )
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Failed to update image. Please try again.')
    }
  }

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/admin/images')
        if (!response.ok) {
          throw new Error('Failed to fetch images')
        }
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error('Error fetching images:', error)
        alert('Failed to load images. Please try refreshing the page.')
      }
    }

    fetchImages()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a5d1a]">Image Manager</h1>
        <Button
          className={`${adminStyles.button.primary} flex items-center`}
          onClick={() => {
            // TODO: Implement image upload modal
            console.log("Open image upload")
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Upload Images
        </Button>
      </div>

      <div className="space-y-6">
        <ImageManager
          images={images}
          onUpload={handleUpload}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  )
}
