"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Upload, 
  X, 
  Check, 
  AlertCircle,
  ArrowLeft,
  Trash2,
  ImageIcon,
  FileImage
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

interface UploadedImage {
  id: string
  file: File
  preview: string
  name: string
  size: string
  type: string
  category: ImageCategory
  alt: string
  usedIn: string[]
  status: "uploading" | "success" | "error"
  progress: number
  error?: string
}

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)

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

  // Handle file selection
  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newImages: UploadedImage[] = []
    
    Array.from(files).forEach(file => {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} is not an image.`)
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }

      // Create a preview URL
      const preview = URL.createObjectURL(file)
      
      // Format file size
      let size = ""
      if (file.size < 1024) {
        size = `${file.size} B`
      } else if (file.size < 1024 * 1024) {
        size = `${(file.size / 1024).toFixed(1)} KB`
      } else {
        size = `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      }

      // Get file extension
      const fileType = file.name.split('.').pop()?.toUpperCase() || "UNKNOWN"

      newImages.push({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        name: file.name,
        size,
        type: fileType,
        category: "other", // Default category
        alt: "", // Default alt text
        usedIn: [], // Default usage
        status: "uploading",
        progress: 0
      })
    })

    setUploadedImages([...uploadedImages, ...newImages])
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  // Handle button click to open file dialog
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Update image metadata
  const updateImageMetadata = (id: string, field: string, value: any) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, [field]: value } : img
      )
    )
  }

  // Toggle usage location
  const toggleUsageLocation = (id: string, location: string) => {
    setUploadedImages(prev => 
      prev.map(img => {
        if (img.id === id) {
          const usedIn = [...img.usedIn]
          const index = usedIn.indexOf(location)
          
          if (index === -1) {
            usedIn.push(location)
          } else {
            usedIn.splice(index, 1)
          }
          
          return { ...img, usedIn }
        }
        return img
      })
    )
  }

  // Remove image from upload list
  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== id)
      
      // Revoke object URL to avoid memory leaks
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      
      return filtered
    })
  }

  // Upload all images
  const uploadImages = async () => {
    // Validate all images have required metadata
    const incompleteImages = uploadedImages.filter(img => !img.category || !img.alt)
    
    if (incompleteImages.length > 0) {
      alert("Please fill in all required fields (category and alt text) for all images.")
      return
    }
    
    setIsUploading(true)
    
    // Simulate upload progress for each image
    const uploadPromises = uploadedImages.map(async (img) => {
      // In a real app, this would be an API call to upload the image
      // For this demo, we'll simulate progress and success/error
      
      return new Promise<void>((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 10) + 5
          
          if (progress >= 100) {
            clearInterval(interval)
            progress = 100
            
            // Simulate random success/error (90% success rate)
            const success = Math.random() > 0.1
            
            setUploadedImages(prev => 
              prev.map(image => 
                image.id === img.id 
                  ? { 
                      ...image, 
                      progress, 
                      status: success ? "success" : "error",
                      error: success ? undefined : "Failed to upload image. Server error."
                    } 
                  : image
              )
            )
            
            resolve()
          } else {
            setUploadedImages(prev => 
              prev.map(image => 
                image.id === img.id ? { ...image, progress } : image
              )
            )
          }
        }, 300)
      })
    })
    
    await Promise.all(uploadPromises)
    setIsUploading(false)
  }

  // Check if all uploads are complete
  const allUploadsComplete = uploadedImages.length > 0 && 
    uploadedImages.every(img => img.status === "success" || img.status === "error")

  // Count successful uploads
  const successfulUploads = uploadedImages.filter(img => img.status === "success").length

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
          <h1 className="text-3xl font-bold text-[#1a5d1a]">Upload Images</h1>
        </div>
      </div>

      <Card className="p-6 mb-8">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? "border-[#1a5d1a] bg-[#1a5d1a]/5" : "border-[#e9b824]"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          <FileImage className="mx-auto h-16 w-16 text-[#85603f] mb-4" />
          
          <h3 className="text-xl font-bold text-[#1a5d1a] mb-2">
            Drag & Drop Images Here
          </h3>
          
          <p className="text-[#85603f] mb-4">
            Supported formats: PNG, JPG, JPEG, GIF, WEBP, SVG
            <br />
            Maximum file size: 5MB
          </p>
          
          <button
            type="button"
            onClick={handleButtonClick}
            className="bg-[#1a5d1a] text-white py-2 px-4 rounded-md inline-flex items-center hover:bg-[#4e9f3d] transition-colors"
          >
            <Upload className="mr-2" size={18} />
            Browse Files
          </button>
        </div>
      </Card>

      {uploadedImages.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">
            {uploadedImages.length} {uploadedImages.length === 1 ? "Image" : "Images"} Selected
          </h2>
          
          <div className="space-y-4 mb-8">
            {uploadedImages.map((image) => (
              <Card key={image.id} className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/4 lg:w-1/5">
                    <div className="relative h-48 rounded-md overflow-hidden border border-[#e9b824]">
                      <Image
                        src={image.preview}
                        alt={image.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    
                    {/* Progress bar */}
                    {image.status === "uploading" && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-[#1a5d1a] h-2.5 rounded-full" 
                          style={{ width: `${image.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    {image.status === "success" && (
                      <div className="flex items-center mt-2 text-[#1a5d1a]">
                        <Check size={16} className="mr-1" />
                        <span className="text-sm">Upload complete</span>
                      </div>
                    )}
                    
                    {image.status === "error" && (
                      <div className="flex items-center mt-2 text-[#d83f31]">
                        <AlertCircle size={16} className="mr-1" />
                        <span className="text-sm">{image.error}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-[#1a5d1a]">{image.name}</h3>
                        <div className="text-sm text-[#85603f]">
                          {image.size} • {image.type}
                        </div>
                      </div>
                      
                      <button 
                        className="text-[#d83f31] hover:bg-[#d83f31]/10 p-2 rounded-full"
                        onClick={() => removeImage(image.id)}
                        disabled={isUploading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1a5d1a] mb-1">
                          Category *
                        </label>
                        <select
                          className="w-full border border-[#e9b824] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
                          value={image.category}
                          onChange={(e) => updateImageMetadata(image.id, "category", e.target.value)}
                          disabled={isUploading}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-[#1a5d1a] mb-1">
                          Alt Text *
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#e9b824] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
                          placeholder="Describe the image for accessibility"
                          value={image.alt}
                          onChange={(e) => updateImageMetadata(image.id, "alt", e.target.value)}
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-[#1a5d1a] mb-1">
                        Used In (Optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {usageLocations.map((location) => (
                          <button
                            key={location}
                            type="button"
                            className={`px-3 py-1 rounded-full text-sm ${
                              image.usedIn.includes(location)
                                ? "bg-[#1a5d1a] text-white"
                                : "bg-[#f8ede3] text-[#85603f] hover:bg-[#e9b824]/20"
                            }`}
                            onClick={() => toggleUsageLocation(image.id, location)}
                            disabled={isUploading}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              type="button"
              className="bg-[#85603f] text-white py-2 px-4 rounded-md hover:bg-[#d83f31] transition-colors"
              onClick={() => {
                setUploadedImages([])
                router.push("/admin/images")
              }}
              disabled={isUploading}
            >
              Cancel
            </button>
            
            {allUploadsComplete ? (
              <div className="text-center">
                <p className="text-[#1a5d1a] font-bold mb-2">
                  {successfulUploads} of {uploadedImages.length} images uploaded successfully
                </p>
                <button
                  type="button"
                  className="bg-[#1a5d1a] text-white py-2 px-4 rounded-md hover:bg-[#4e9f3d] transition-colors"
                  onClick={() => router.push("/admin/images")}
                >
                  Go to Image Management
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="bg-[#1a5d1a] text-white py-2 px-4 rounded-md hover:bg-[#4e9f3d] transition-colors flex items-center"
                onClick={uploadImages}
                disabled={isUploading || uploadedImages.length === 0}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={18} />
                    Upload {uploadedImages.length} {uploadedImages.length === 1 ? "Image" : "Images"}
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
