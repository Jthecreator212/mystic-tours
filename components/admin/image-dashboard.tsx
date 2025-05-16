"use client"

import { useState, useMemo } from "react"
import { ImageGrid } from "./image-grid"
import { UploadImage } from "./upload-image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, Filter, ExternalLink, ArrowUpDown } from "lucide-react"
import type { ImageType } from "@/types/image"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface ImageDashboardProps {
  images?: ImageType[]
  isLoading?: boolean
  onUpload?: (file: File, name: string) => Promise<void>
  onReplace?: (id: string, file: File, name: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function ImageDashboard({ images = [], isLoading = false, onUpload, onReplace, onDelete }: ImageDashboardProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterType, setFilterType] = useState("all")
  
  // Website scanning state
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scannedImages, setScannedImages] = useState<ImageType[]>([])
  const [scanError, setScanError] = useState("")

  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : []

  const handleSelectImage = (image: ImageType) => {
    setSelectedImage(image)
    setShowUploadModal(true)
  }

  const handleImageUploaded = async (file: File, name: string) => {
    if (onUpload) {
      await onUpload(file, name)
    }
    setShowUploadModal(false)
  }

  const handleImageReplaced = async (id: string, file: File, name: string) => {
    if (onReplace) {
      await onReplace(id, file, name)
    }
    setSelectedImage(null)
    setShowUploadModal(false)
  }
  
  // Function to scan a website for images
  const handleScanWebsite = async () => {
    if (!websiteUrl) {
      setScanError("Please enter a valid URL")
      return
    }
    
    try {
      // Reset state
      setIsScanning(true)
      setScanError("")
      setScannedImages([])
      
      // Validate URL format
      let url = websiteUrl
      if (!url.startsWith('http')) {
        url = `https://${url}`
      }
      
      // Call the scan-website API
      console.log(`Scanning website: ${url}`)
      const response = await fetch('/api/admin/scan-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log(`Found ${data.length} images on ${url}`)
      
      // Update state with scanned images
      setScannedImages(data)
    } catch (error) {
      console.error('Error scanning website:', error)
      setScanError(error instanceof Error ? error.message : 'Failed to scan website')
    } finally {
      setIsScanning(false)
    }
  }

  // Helper function to group images by context
  const groupImagesByContext = (images: ImageType[]) => {
    const groupedImages: Record<string, ImageType[]> = {}
    
    images.forEach(img => {
      const context = img.context || 'Other'
      if (!groupedImages[context]) {
        groupedImages[context] = []
      }
      groupedImages[context].push(img)
    })
    
    return groupedImages
  }
  
  // Group images by context
  const imagesByContext = useMemo(() => {
    return groupImagesByContext(safeImages)
  }, [safeImages])
  
  // Filter and sort images based on user selections
  const filteredImages = useMemo(() => {
    let filtered = [...safeImages]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(img => 
        (img.name?.toLowerCase().includes(query) || 
        img.path?.toLowerCase().includes(query) ||
        img.context?.toLowerCase().includes(query) ||
        img.pageUrl?.toLowerCase().includes(query))
      )
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(img => {
        if (filterType === 'placeholder' && img.isPlaceholder) return true
        if (filterType === 'background' && img.isBackground) return true
        if (filterType === 'tour' && img.context?.includes('Tour')) return true
        if (filterType === 'gallery' && img.context?.includes('Gallery')) return true
        if (filterType === 'header' && img.context?.includes('Header')) return true
        return false
      })
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      })
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      })
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => {
        return (a.name || '').localeCompare(b.name || '')
      })
    } else if (sortBy === 'context') {
      filtered.sort((a, b) => {
        return (a.context || 'Unknown').localeCompare(b.context || 'Unknown')
      })
    }
    
    return filtered
  }, [safeImages, searchQuery, filterType, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-[#1a5d1a]">Image Management</h2>
        <Button
          onClick={() => {
            setSelectedImage(null)
            setShowUploadModal(true)
          }}
          className="bg-[#1a5d1a] hover:bg-[#1a5d1a]/80 text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload New Image
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="h-10">
            <TabsTrigger value="all" className="px-4">
              All Images
            </TabsTrigger>
            <TabsTrigger value="recent" className="px-4">
              Recently Added
            </TabsTrigger>
            <TabsTrigger value="website" className="px-4">
              Website Images
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[250px]">
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="header">Page Headers</SelectItem>
                  <SelectItem value="tour">Tour Images</SelectItem>
                  <SelectItem value="gallery">Gallery Images</SelectItem>
                  <SelectItem value="background">Background Images</SelectItem>
                  <SelectItem value="placeholder">Empty Slots</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="context">Image Context</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredImages.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="px-3 py-1">
                  {filteredImages.length} {filteredImages.length === 1 ? "image" : "images"}
                </Badge>
              </div>
              <ImageGrid images={filteredImages} onSelectImage={handleSelectImage} onDeleteImage={onDelete} />
            </>
          ) : (
            <div className="text-center py-16 border rounded-lg bg-muted/30">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">No images found. Upload your first image to get started.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedImage(null)
                  setShowUploadModal(true)
                }}
                className="mt-4"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredImages.length > 0 ? (
            <ImageGrid images={filteredImages.slice(0, 8)} onSelectImage={handleSelectImage} onDeleteImage={onDelete} />
          ) : (
            <div className="text-center py-16 border rounded-lg bg-muted/30">
              <p className="text-muted-foreground">No recent images found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="website" className="mt-0">
          <div className="space-y-6">
            <div className="p-6 border rounded-lg bg-muted/10">
              <h3 className="text-lg font-medium mb-2">Website Scanner</h3>
              <p className="text-muted-foreground mb-4">
                Enter your website URL to scan for images. This will find all images on your website and allow you to manage them.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="http://localhost:3000"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleScanWebsite}
                  disabled={isScanning || !websiteUrl}
                  className="bg-[#1a5d1a] hover:bg-[#1a5d1a]/80 text-white"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    "Scan Website"
                  )}
                </Button>
              </div>
              {scanError && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {scanError}
                </div>
              )}
            </div>

            {isScanning && scannedImages.length === 0 && (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Scanning website for images...</p>
                </div>
              </div>
            )}

            {scannedImages.length > 0 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Found Images</h3>
                  <Badge variant="outline" className="px-3 py-1">
                    {scannedImages.length} {scannedImages.length === 1 ? "image" : "images"}
                  </Badge>
                </div>
                
                {/* Group scanned images by context */}
                {Object.entries(groupImagesByContext(scannedImages)).map(([context, contextImages]) => (
                  <div key={context} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{context}</h3>
                      <Badge variant="secondary">{contextImages.length}</Badge>
                    </div>
                    <div className="border rounded-lg p-4 bg-card">
                      <ImageGrid 
                        images={contextImages} 
                        onSelectImage={handleSelectImage} 
                        onDeleteImage={onDelete} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showUploadModal && (
        <UploadImage
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false)
            setSelectedImage(null)
          }}
          onImageUploaded={handleImageUploaded}
          onImageReplaced={handleImageReplaced}
          selectedImage={selectedImage}
        />
      )}
    </div>
  )
}
