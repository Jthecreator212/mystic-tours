"use client"

import { useState, useEffect } from "react"
import { ImageDashboard } from "@/components/admin/image-dashboard"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { ImageType } from "@/types/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ImagesPage() {
  const [images, setImages] = useState<ImageType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching images from API...')
      const response = await fetch("/api/admin/images")
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error (${response.status}):`, errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Images fetched successfully:', data.length)
      
      // Transform the data to match our ImageType
      const transformedImages: ImageType[] = Array.isArray(data) ? data.map((img: any) => ({
        id: img.id,
        name: img.name || "Untitled",
        url: img.url,
        uploadedAt: img.createdAt || new Date().toISOString(),
        path: img.path || "",
        description: img.description || "",
        category: img.category || "uncategorized",
        alt_text: img.alt_text || ""
      })) : []
      
      setImages(transformedImages)
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "Failed to load images. Please check the console for details.",
        variant: "destructive",
      })
      // Provide a fallback for development
      if (process.env.NODE_ENV === 'development') {
        setImages([
          {
            id: 'sample-1',
            name: 'Sample Image 1',
            url: 'https://picsum.photos/seed/mystic1/800/600',
            uploadedAt: new Date().toISOString(),
            path: '/sample/image1.jpg'
          },
          {
            id: 'sample-2',
            name: 'Sample Image 2',
            url: 'https://picsum.photos/seed/mystic2/800/600',
            uploadedAt: new Date().toISOString(),
            path: '/sample/image2.jpg'
          }
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadImage = async (file: File, name: string) => {
    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("title", name)
      formData.append("alt_text", name)
      
      const response = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const newImage = await response.json()
      
      // Add the new image to the state
      setImages((prevImages) => [
        {
          id: newImage.id,
          name: newImage.name,
          url: newImage.url,
          uploadedAt: newImage.createdAt || new Date().toISOString(),
          path: newImage.path || "",
          description: newImage.description || "",
          category: newImage.category || "uncategorized",
          alt_text: newImage.alt_text || ""
        },
        ...prevImages,
      ])
      
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReplaceImage = async (id: string, file: File, name: string) => {
    try {
      const formData = new FormData()
      formData.append("id", id)
      formData.append("image", file)
      formData.append("title", name)
      
      const response = await fetch("/api/admin/images", {
        method: "PUT",
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const updatedImage = await response.json()
      
      // Update the image in the state
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === id
            ? {
                ...img,
                name: updatedImage.name,
                url: updatedImage.url,
                updatedAt: updatedImage.updatedAt,
              }
            : img
        )
      )
      
      toast({
        title: "Success",
        description: "Image replaced successfully!",
      })
    } catch (error) {
      console.error("Error replacing image:", error)
      toast({
        title: "Error",
        description: "Failed to replace image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      // Remove the deleted image from the state
      setImages((prevImages) => prevImages.filter((img) => img.id !== id))
      
      toast({
        title: "Success",
        description: "Image deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1a5d1a]">Image Management</h1>
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="gallery">Gallery Images</TabsTrigger>
          <TabsTrigger value="tour">Tour Images</TabsTrigger>
          <TabsTrigger value="site">Site Images</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Gallery Image Management</CardTitle>
              <CardDescription>
                Upload, replace, and manage images for your website gallery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageDashboard
                images={images}
                isLoading={isLoading}
                onUpload={handleUploadImage}
                onReplace={handleReplaceImage}
                onDelete={handleDeleteImage}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tour">
          <Card>
            <CardHeader>
              <CardTitle>Tour Image Management</CardTitle>
              <CardDescription>
                Manage images for specific tours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <p className="text-muted-foreground">Tour image management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Image Management</CardTitle>
              <CardDescription>
                Manage site-wide images like logos and banners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <p className="text-muted-foreground">Site image management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Toaster />
    </div>
  )
}
