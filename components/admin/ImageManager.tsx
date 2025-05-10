"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, Image as ImageIcon, Trash2, Edit2, CheckCircle2, Tag, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminStyles } from "@/app/admin/styles"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ImageManagerProps {
  images: Array<{
    id: string
    url: string
    name: string
    category?: string
  }>
  onUpload: (file: File) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, file: File) => Promise<void>
}

export function ImageManager({ images, onUpload, onDelete, onUpdate }: ImageManagerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [currentImageDetail, setCurrentImageDetail] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadError(null)
      try {
        if (selectedImage) {
          await onUpdate(selectedImage, file)
        } else {
          await onUpload(file)
        }
      } catch (error) {
        setUploadError("Failed to upload image. Please try again.")
      } finally {
        setIsUploading(false)
      }
    }
  }, [onUpload, onUpdate, selectedImage])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      fileInputRef.current?.files?.[0] && fileInputRef.current.files[0].name === file.name
        ? fileInputRef.current.files[0]
        : fileInputRef.current?.files?.[0] && fileInputRef.current.files[0].name !== file.name
        ? fileInputRef.current.files[0]
        : file
    }
    fileInputRef.current?.click()
  }, [])

  const handleImageClick = useCallback((id: string) => {
    setSelectedImage(id)
  }, [])

  const openImageDetails = useCallback((image: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageDetail(image)
    setIsDetailModalOpen(true)
  }, [])

  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", "tour", "blog", "hero", "gallery"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Image Manager
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </Button>
              {selectedImage && (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Update Selected
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`p-4 border-2 border-dashed rounded-lg transition-all duration-300 ${
              isDragging ? "border-[#e9b824]" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                Drag & drop your images here, or click to select
              </p>
              {uploadError && (
                <p className="text-sm text-red-500 mt-2">{uploadError}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Images</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input 
                placeholder="Search images..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedImage === image.id ? "ring-2 ring-[#e9b824]" : ""
                    }`}
                    onClick={() => handleImageClick(image.id)}
                  >
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
                      <div className="flex justify-between items-center text-white">
                        <span className="text-sm truncate">{image.name}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => openImageDetails(image, e)}
                            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          {selectedImage === image.id && (
                            <CheckCircle2 className="w-5 h-5 text-[#e9b824]" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(image.id)
                            }}
                            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-2 p-4 font-medium border-b">
                  <div className="col-span-1">Preview</div>
                  <div className="col-span-4">Name</div>
                  <div className="col-span-3">Category</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {filteredImages.map((image) => (
                  <div 
                    key={image.id} 
                    className={`grid grid-cols-12 gap-2 p-4 items-center border-b hover:bg-gray-50 ${
                      selectedImage === image.id ? "bg-[#e9b824]/10" : ""
                    }`}
                    onClick={() => handleImageClick(image.id)}
                  >
                    <div className="col-span-1">
                      <div className="relative w-10 h-10 rounded overflow-hidden">
                        <Image
                          src={image.url}
                          alt={image.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="col-span-4 truncate">{image.name}</div>
                    <div className="col-span-3">{image.category || "Uncategorized"}</div>
                    <div className="col-span-2">-</div>
                    <div className="col-span-2 flex space-x-2">
                      <button
                        onClick={(e) => openImageDetails(image, e)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(image.id)
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Image Details Dialog */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
            <DialogDescription>
              View and edit details for this image
            </DialogDescription>
          </DialogHeader>
          
          {currentImageDetail && (
            <div className="space-y-4">
              <div className="relative w-full h-48">
                <Image
                  src={currentImageDetail.url}
                  alt={currentImageDetail.name}
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Name:</label>
                  <Input 
                    value={currentImageDetail.name} 
                    className="col-span-3" 
                    readOnly 
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Category:</label>
                  <Select defaultValue={currentImageDetail.category || "uncategorized"}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== "all").map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                      <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">URL:</label>
                  <Input 
                    value={currentImageDetail.url} 
                    className="col-span-3" 
                    readOnly 
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Cancel
                </Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
