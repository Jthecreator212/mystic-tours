"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Save, 
  ArrowLeft, 
  Trash2, 
  RotateCw, 
  Crop, 
  Maximize, 
  Minimize,
  ZoomIn,
  ZoomOut,
  ImageOff,
  Check,
  RefreshCw,
  Download
} from "lucide-react"
import { Card } from "@/components/ui/card"

// Define image category types
type ImageCategory = 
  | "hero" 
  | "tour" 
  | "gallery" 
  | "testimonial" 
  | "about" 
  | "contact" 
  | "logo" 
  | "other"

// Define image type
interface ImageDetails {
  id: string
  name: string
  path: string
  category: ImageCategory
  size: string
  dimensions: string
  format: string
  lastModified: string
  alt: string
  usedIn: string[]
}

export default function EditImagePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [image, setImage] = useState<ImageDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Categories for selection
  const categories: { value: ImageCategory, label: string }[] = [
    { value: "hero", label: "Hero Images" },
    { value: "tour", label: "Tour Images" },
    { value: "gallery", label: "Gallery Images" },
    { value: "testimonial", label: "Testimonial Images" },
    { value: "about", label: "About Page Images" },
    { value: "contact", label: "Contact Page Images" },
    { value: "logo", label: "Logos" },
    { value: "other", label: "Other Images" }
  ]

  // Usage locations
  const usageLocations = [
    "Home Page",
    "Tours Page",
    "Tour Details",
    "Gallery Page",
    "About Page",
    "Contact Page",
    "All Pages"
  ]

  // Mock data loading
  useEffect(() => {
    // In a real app, this would be an API call to fetch image details
    const mockImage: ImageDetails = {
      id: params.id,
      name: params.id === "img1" ? "hero-background.png" : 
            params.id === "img2" ? "testimonial-1.png" : 
            params.id === "img3" ? "testimonial-2.png" : "tour-image.png",
      path: params.id === "img1" ? "/images/hero-bg.png" : 
            params.id === "img2" ? "/images/testimonial-1.png" : 
            params.id === "img3" ? "/images/testimonial-2.png" : "/images/tours/blue-mountain.png",
      category: params.id === "img1" ? "hero" : 
                params.id === "img2" || params.id === "img3" ? "testimonial" : "tour",
      size: "1.2 MB",
      dimensions: "1920 x 1080",
      format: "PNG",
      lastModified: "2025-05-01",
      alt: params.id === "img1" ? "Jamaican beach sunset with palm trees" : 
           params.id === "img2" ? "Tourist testimonial - Marcus J." : 
           params.id === "img3" ? "Tourist testimonial - Sarah T." : "Blue Mountain tour view",
      usedIn: params.id === "img1" ? ["Home Page"] : 
              params.id === "img2" ? ["Home Page", "About Page"] : 
              params.id === "img3" ? ["Home Page"] : ["Tours Page", "Tour Details"]
    }

    setTimeout(() => {
      setImage(mockImage)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  // Update image metadata
  const updateImageMetadata = (field: string, value: any) => {
    if (!image) return
    
    setImage({ ...image, [field]: value })
    setHasChanges(true)
  }

  // Toggle usage location
  const toggleUsageLocation = (location: string) => {
    if (!image) return
    
    const usedIn = [...image.usedIn]
    const index = usedIn.indexOf(location)
    
    if (index === -1) {
      usedIn.push(location)
    } else {
      usedIn.splice(index, 1)
    }
    
    setImage({ ...image, usedIn })
    setHasChanges(true)
  }

  // Save changes
  const saveChanges = async () => {
    if (!image) return
    
    setIsSaving(true)
    
    // In a real app, this would be an API call to update the image
    // For this demo, we'll simulate a delay
    
    setTimeout(() => {
      setIsSaving(false)
      setHasChanges(false)
      
      // Show success message
      alert("Image updated successfully!")
    }, 1500)
  }

  // Delete image
  const deleteImage = async () => {
    if (!image) return
    
    // In a real app, this would be an API call to delete the image
    // For this demo, we'll simulate a delay
    
    setTimeout(() => {
      // Redirect to image list
      router.push("/admin/images")
    }, 1000)
  }

  // Rotate image
  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360)
    setHasChanges(true)
  }

  // Zoom in
  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  // Zoom out
  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  // Reset zoom and rotation
  const resetView = () => {
    setZoom(100)
    setRotation(0)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link 
            href="/admin/images" 
            className="mr-3 p-2 rounded-full hover:bg-[#f8ede3]"
          >
            <ArrowLeft className="text-[#1a5d1a]" />
          </Link>
          <h1 className="text-3xl font-bold text-[#1a5d1a]">
            {isLoading ? "Loading Image..." : `Edit Image: ${image?.name}`}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            className="bg-[#d83f31] text-white py-2 px-4 rounded-md hover:bg-[#d83f31]/80 transition-colors flex items-center"
            onClick={() => setShowConfirmDelete(true)}
            disabled={isLoading}
          >
            <Trash2 className="mr-2" size={18} />
            Delete
          </button>
          
          <button
            type="button"
            className="bg-[#1a5d1a] text-white py-2 px-4 rounded-md hover:bg-[#4e9f3d] transition-colors flex items-center"
            onClick={saveChanges}
            disabled={isLoading || !hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2" size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center">
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a5d1a]"></div>
            <span>Loading image details...</span>
          </div>
        </Card>
      ) : image ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#1a5d1a]">Image Preview</h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-[#f8ede3] text-[#85603f]"
                    onClick={zoomOut}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="flex items-center text-sm">{zoom}%</span>
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-[#f8ede3] text-[#85603f]"
                    onClick={zoomIn}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-[#f8ede3] text-[#85603f]"
                    onClick={rotateImage}
                  >
                    <RotateCw size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-[#f8ede3] text-[#85603f]"
                    onClick={resetView}
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
              
              <div className="relative h-[400px] w-full border border-[#e9b824] rounded-md overflow-hidden bg-[#f8ede3]/50 flex items-center justify-center">
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: "transform 0.3s ease"
                  }}
                  className="relative"
                >
                  <Image
                    src={image.path}
                    alt={image.alt}
                    width={500}
                    height={300}
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-4 text-sm text-[#85603f]">
                <span>Format: {image.format}</span>
                <span>Dimensions: {image.dimensions}</span>
                <span>Size: {image.size}</span>
                <span>Last Modified: {image.lastModified}</span>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">Image Usage</h2>
              <p className="text-sm text-[#85603f] mb-4">
                Select the pages where this image is used. This helps with tracking and organization.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {usageLocations.map((location) => (
                  <button
                    key={location}
                    type="button"
                    className={`px-3 py-2 rounded-md text-sm ${
                      image.usedIn.includes(location)
                        ? "bg-[#1a5d1a] text-white"
                        : "bg-[#f8ede3] text-[#85603f] hover:bg-[#e9b824]/20"
                    }`}
                    onClick={() => toggleUsageLocation(location)}
                  >
                    {location}
                    {image.usedIn.includes(location) && (
                      <Check size={14} className="inline ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">Image Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a5d1a] mb-1">
                    File Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#e9b824] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
                    value={image.name}
                    onChange={(e) => updateImageMetadata("name", e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#1a5d1a] mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#e9b824] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
                    value={image.alt}
                    onChange={(e) => updateImageMetadata("alt", e.target.value)}
                  />
                  <p className="text-xs text-[#85603f] mt-1">
                    Describe the image for accessibility purposes.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#1a5d1a] mb-1">
                    Category
                  </label>
                  <select
                    className="w-full border border-[#e9b824] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
                    value={image.category}
                    onChange={(e) => updateImageMetadata("category", e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full bg-[#f8ede3] text-[#85603f] py-2 px-4 rounded-md hover:bg-[#e9b824]/20 transition-colors flex items-center justify-center"
                >
                  <Download className="mr-2" size={18} />
                  Download Original
                </button>
                
                <button
                  type="button"
                  className="w-full bg-[#f8ede3] text-[#85603f] py-2 px-4 rounded-md hover:bg-[#e9b824]/20 transition-colors flex items-center justify-center"
                >
                  <Crop className="mr-2" size={18} />
                  Crop Image
                </button>
                
                <button
                  type="button"
                  className="w-full bg-[#f8ede3] text-[#85603f] py-2 px-4 rounded-md hover:bg-[#e9b824]/20 transition-colors flex items-center justify-center"
                >
                  <ImageOff className="mr-2" size={18} />
                  Replace Image
                </button>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-[#d83f31]">Image not found</div>
        </Card>
      )}
      
      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-[#d83f31] mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="bg-[#f8ede3] text-[#85603f] py-2 px-4 rounded-md hover:bg-[#e9b824]/20 transition-colors"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-[#d83f31] text-white py-2 px-4 rounded-md hover:bg-[#d83f31]/80 transition-colors"
                onClick={deleteImage}
              >
                Delete Image
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
