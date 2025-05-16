"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { ImageType } from "@/types/image"
import { formatDistanceToNow } from "date-fns"
import { Copy, Pencil, Trash, ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ImageGridProps {
  images?: ImageType[]
  onSelectImage: (image: ImageType) => void
  onDeleteImage?: (id: string) => Promise<void>
}

export function ImageGrid({ images = [], onSelectImage, onDeleteImage }: ImageGridProps) {
  const [imageToDelete, setImageToDelete] = useState<ImageType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImageDetails, setSelectedImageDetails] = useState<ImageType | null>(null)

  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : []

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL Copied",
      description: "Image URL has been copied to clipboard",
    })
  }

  const handleDeleteImage = async () => {
    if (!imageToDelete || !onDeleteImage) return

    try {
      setIsDeleting(true)
      await onDeleteImage(imageToDelete.id)
      toast({
        title: "Image Deleted",
        description: "The image has been successfully deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the image",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setImageToDelete(null)
    }
  }

  const openImageDetails = (image: ImageType) => {
    setSelectedImageDetails(image)
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {safeImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group hover:shadow-md transition-all duration-200">
            <CardContent className="p-0 relative">
              <div className="aspect-square relative overflow-hidden bg-muted/30">
                <Image
                  src={image.url || "/placeholder.svg?height=300&width=300&query=image"}
                  alt={image.name || "Image"}
                  fill
                  className={`object-cover transition-transform group-hover:scale-105 ${image.isPlaceholder ? 'opacity-50' : ''}`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {image.isPlaceholder && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded">
                      {image.isContainer ? 'Empty Container' : 'Placeholder'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="secondary" onClick={() => onSelectImage(image)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Replace Image</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="secondary" onClick={() => handleCopyUrl(image.url)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy URL</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="secondary" onClick={() => openImageDetails(image)}>
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Image Details</p>
                      </TooltipContent>
                    </Tooltip>

                    {onDeleteImage && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="destructive" onClick={() => setImageToDelete(image)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Image</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-background">
                <h3 className="font-medium truncate">{image.name || "Untitled Image"}</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">
                    {image.uploadedAt
                      ? formatDistanceToNow(new Date(image.uploadedAt), { addSuffix: true })
                      : "Unknown date"}
                  </p>
                  {image.dimensions && (
                    <p className="text-xs text-muted-foreground">
                      {image.dimensions.width}×{image.dimensions.height}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image from your website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedImageDetails} onOpenChange={(open) => !open && setSelectedImageDetails(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
            <DialogDescription>Technical information about this image</DialogDescription>
          </DialogHeader>

          {selectedImageDetails && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full border rounded-md overflow-hidden">
                <Image
                  src={selectedImageDetails.url || "/placeholder.svg?height=300&width=300&query=image"}
                  alt={selectedImageDetails.name || "Image details"}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="font-medium">Name:</div>
                <div>{selectedImageDetails.name}</div>

                {selectedImageDetails.isPlaceholder && (
                  <>
                    <div className="font-medium">Type:</div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {selectedImageDetails.isContainer ? 'Empty Container' : 'Placeholder'}
                      </span>
                    </div>
                  </>
                )}

                {selectedImageDetails.context && (
                  <>
                    <div className="font-medium">Context:</div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedImageDetails.context}
                      </span>
                    </div>
                  </>
                )}

                <div className="font-medium">Dimensions:</div>
                <div>
                  {selectedImageDetails.dimensions
                    ? `${selectedImageDetails.dimensions.width}×${selectedImageDetails.dimensions.height}px`
                    : "Unknown"}
                </div>

                <div className="font-medium">Uploaded:</div>
                <div>
                  {selectedImageDetails.uploadedAt
                    ? new Date(selectedImageDetails.uploadedAt).toLocaleString()
                    : "Unknown"}
                </div>

                <div className="font-medium">Path:</div>
                <div className="truncate">{selectedImageDetails.path || "N/A"}</div>

                {selectedImageDetails.selector && (
                  <>
                    <div className="font-medium">CSS Selector:</div>
                    <div className="truncate text-xs bg-gray-100 p-1 rounded">
                      {selectedImageDetails.selector}
                    </div>
                  </>
                )}

                {selectedImageDetails.pageUrl && (
                  <>
                    <div className="font-medium">Page:</div>
                    <div className="truncate">
                      <a
                        href={selectedImageDetails.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {selectedImageDetails.pageUrl.includes("://")
                          ? new URL(selectedImageDetails.pageUrl).pathname || selectedImageDetails.pageUrl
                          : selectedImageDetails.pageUrl}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => handleCopyUrl(selectedImageDetails.url)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Image URL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
