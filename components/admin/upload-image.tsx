"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ImageType } from "@/types/image"
import { Loader2, Upload, ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UploadImageProps {
  isOpen: boolean
  onClose: () => void
  onImageUploaded: (file: File, name: string) => Promise<void>
  onImageReplaced: (id: string, file: File, name: string) => Promise<void>
  selectedImage: ImageType | null
}

export function UploadImage({ isOpen, onClose, onImageUploaded, onImageReplaced, selectedImage }: UploadImageProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [name, setName] = useState(selectedImage?.name || "")
  const [altText, setAltText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      processFile(selectedFile)
    }
  }

  const processFile = (selectedFile: File) => {
    setFile(selectedFile)

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)

    // Set name from file if not already set
    if (!name) {
      setName(selectedFile.name.split(".")[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      if (selectedImage) {
        // Replace existing image
        await onImageReplaced(selectedImage.id, file, name || file.name)
      } else {
        // Upload new image
        await onImageUploaded(file, name || file.name)
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{selectedImage ? "Replace Image" : "Upload New Image"}</DialogTitle>
          <DialogDescription>
            {selectedImage
              ? "Upload a new image to replace the selected one"
              : "Upload an image to add to your website"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 py-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : preview || (selectedImage && !preview)
                    ? "border-muted bg-background"
                    : "border-muted bg-muted/30"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="relative aspect-video w-full max-w-sm mx-auto rounded-md overflow-hidden">
                  <Image
                    src={preview || "/placeholder.svg?height=300&width=300&query=image"}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : selectedImage && !preview ? (
                <div className="relative aspect-video w-full max-w-sm mx-auto rounded-md overflow-hidden">
                  <Image
                    src={selectedImage.url || "/placeholder.svg?height=300&width=300&query=image"}
                    alt={selectedImage.name || "Selected image"}
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="text-white font-medium">Current Image</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Drag and drop your image here</p>
                  <p className="text-xs text-muted-foreground mb-4">Supports: JPG, PNG, GIF, WebP</p>
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </Button>
                </div>
              )}

              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Image Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter image name"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be used to identify the image in your CMS
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt-text">Alt Text</Label>
                <Textarea
                  id="alt-text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Helps with accessibility and SEO</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="w-full sm:w-auto bg-gradient-to-r from-[#1a5d1a] to-[#1a5d1a]/80 hover:from-[#1a5d1a]/90 hover:to-[#1a5d1a]/70"
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {selectedImage ? "Replace Image" : "Upload Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
