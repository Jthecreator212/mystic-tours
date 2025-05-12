"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  Plus, 
  X, 
  Upload, 
  Save, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  ImagePlus,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BlogImage {
  src: string
  alt: string
  caption?: string
}

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  image: string
  gallery: BlogImage[]
  author: string
  date: string
  category: string
}

export default function BlogManager() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all-posts")
  
  // New post form state
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [author, setAuthor] = useState("")
  
  // Image handling
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<BlogImage[]>([])
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([])
  
  // Refs for file inputs
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryImageInputRef = useRef<HTMLInputElement>(null)
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Edit mode
  const [editMode, setEditMode] = useState(false)
  const [editPostId, setEditPostId] = useState<number | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blog')
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }
      const data = await response.json()
      
      // Check if the response is an error object
      if (data.error) {
        console.error('API returned an error:', data.error)
        // Use empty array as fallback
        setPosts([])
      } else {
        // Set the posts data
        setPosts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      // Use empty array as fallback
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setMainImageFile(file)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setMainImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setGalleryImageFiles(prev => [...prev, ...newFiles])
      
      // Process each file for preview
      newFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            const newImage: BlogImage = {
              src: event.target.result as string,
              alt: file.name.split('.')[0], // Use filename as alt text by default
              caption: ''
            }
            setGalleryImages(prev => [...prev, newImage])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
    setGalleryImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleGalleryImageCaptionChange = (index: number, caption: string) => {
    setGalleryImages(prev => 
      prev.map((img, i) => i === index ? { ...img, caption } : img)
    )
  }

  const handleGalleryImageAltChange = (index: number, alt: string) => {
    setGalleryImages(prev => 
      prev.map((img, i) => i === index ? { ...img, alt } : img)
    )
  }

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === galleryImages.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    // Update gallery images
    const newGalleryImages = [...galleryImages]
    const temp = newGalleryImages[index]
    newGalleryImages[index] = newGalleryImages[newIndex]
    newGalleryImages[newIndex] = temp
    setGalleryImages(newGalleryImages)
    
    // Update gallery image files
    const newGalleryImageFiles = [...galleryImageFiles]
    const tempFile = newGalleryImageFiles[index]
    newGalleryImageFiles[index] = newGalleryImageFiles[newIndex]
    newGalleryImageFiles[newIndex] = tempFile
    setGalleryImageFiles(newGalleryImageFiles)
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!title.trim()) errors.title = "Title is required"
    if (!excerpt.trim()) errors.excerpt = "Excerpt is required"
    if (!content.trim()) errors.content = "Content is required"
    if (!mainImage && !editMode) errors.mainImage = "Main image is required"
    if (!category) errors.category = "Category is required"
    if (!author) errors.author = "Author is required"
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddPost = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // In a real application, you would upload the images to a server or cloud storage
      // For this example, we'll just use the data URLs
      
      // Prepare the gallery images with proper URLs
      const galleryWithUrls = galleryImages.map(img => ({
        src: img.src,
        alt: img.alt,
        caption: img.caption
      }))
      
      const postData = {
        title,
        excerpt,
        content,
        image: mainImage,
        gallery: galleryWithUrls,
        author,
        category
      }
      
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create blog post')
      }
      
      // Reset form
      resetForm()
      
      // Refresh posts
      fetchPosts()
      
      // Switch to all posts tab
      setActiveTab("all-posts")
    } catch (error) {
      console.error('Error creating blog post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePost = async () => {
    if (!validateForm() || editPostId === null) return
    
    setIsSubmitting(true)
    
    try {
      // Prepare the gallery images with proper URLs
      const galleryWithUrls = galleryImages.map(img => ({
        src: img.src,
        alt: img.alt,
        caption: img.caption
      }))
      
      const postData = {
        id: editPostId,
        title,
        excerpt,
        content,
        image: mainImage,
        gallery: galleryWithUrls,
        author,
        category,
        updateDate: false // Set to true if you want to update the date
      }
      
      const response = await fetch('/api/blog', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update blog post')
      }
      
      // Reset form and edit mode
      resetForm()
      setEditMode(false)
      setEditPostId(null)
      
      // Refresh posts
      fetchPosts()
      
      // Switch to all posts tab
      setActiveTab("all-posts")
    } catch (error) {
      console.error('Error updating blog post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      const response = await fetch(`/api/blog?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete blog post')
      }
      
      // Refresh posts
      fetchPosts()
    } catch (error) {
      console.error('Error deleting blog post:', error)
    }
  }

  const handleEditPost = (post: BlogPost) => {
    setTitle(post.title)
    setExcerpt(post.excerpt)
    setContent(post.content)
    setCategory(post.category)
    setAuthor(post.author)
    setMainImage(post.image)
    setGalleryImages(post.gallery || [])
    setEditMode(true)
    setEditPostId(post.id)
    setActiveTab("add-post")
  }

  const resetForm = () => {
    setTitle("")
    setExcerpt("")
    setContent("")
    setCategory("")
    setAuthor("")
    setMainImage(null)
    setMainImageFile(null)
    setGalleryImages([])
    setGalleryImageFiles([])
    setFormErrors({})
  }

  const handleCancelEdit = () => {
    resetForm()
    setEditMode(false)
    setEditPostId(null)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1a5d1a]">Blog Management</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all-posts">All Posts</TabsTrigger>
          <TabsTrigger value="add-post">
            {editMode ? "Edit Post" : "Add New Post"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-posts" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading blog posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-600 mb-6">Create your first blog post to get started.</p>
              <Button 
                onClick={() => setActiveTab("add-post")}
                className="bg-[#1a5d1a] hover:bg-[#1a5d1a]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Post
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-gray-900">All Blog Posts</h3>
                <Button 
                  onClick={() => setActiveTab("add-post")}
                  className="bg-[#1a5d1a] hover:bg-[#1a5d1a]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Post
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-48 h-48">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-[#1a5d1a] mb-2">{post.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <span>{post.author}</span>
                              <span className="mx-2 text-[#e9b824]">•</span>
                              <span>{post.date}</span>
                              <span className="mx-2 text-[#e9b824]">•</span>
                              <span className="bg-[#e9b824]/20 text-[#e9b824] px-2 py-0.5 rounded-full">
                                {post.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPost(post)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="flex items-center">
                            <ImagePlus className="w-4 h-4 mr-1" />
                            {post.gallery?.length || 0} gallery images
                          </span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="add-post" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm">{formErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Enter a short excerpt"
                  rows={3}
                  className={formErrors.excerpt ? "border-red-500" : ""}
                />
                {formErrors.excerpt && (
                  <p className="text-red-500 text-sm">{formErrors.excerpt}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  rows={10}
                  className={formErrors.content ? "border-red-500" : ""}
                />
                {formErrors.content && (
                  <p className="text-red-500 text-sm">{formErrors.content}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Main Image</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                    formErrors.mainImage ? "border-red-500" : "border-gray-300"
                  }`}
                  onClick={() => mainImageInputRef.current?.click()}
                >
                  {mainImage ? (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={mainImage}
                        alt="Main blog image"
                        fill
                        className="object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMainImage(null)
                          setMainImageFile(null)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Click to upload main image
                      </p>
                    </div>
                  )}
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainImageChange}
                  />
                </div>
                {formErrors.mainImage && (
                  <p className="text-red-500 text-sm">{formErrors.mainImage}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className={formErrors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Travel Tips">Travel Tips</SelectItem>
                      <SelectItem value="Destinations">Destinations</SelectItem>
                      <SelectItem value="Culture">Culture</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Beaches">Beaches</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-red-500 text-sm">{formErrors.category}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className={formErrors.author ? "border-red-500" : ""}
                  />
                  {formErrors.author && (
                    <p className="text-red-500 text-sm">{formErrors.author}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Gallery Images</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => galleryImageInputRef.current?.click()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                  <input
                    ref={galleryImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryImageChange}
                  />
                </div>
                
                <div className="space-y-4 mt-4">
                  {galleryImages.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-500">
                        No gallery images added yet
                      </p>
                    </div>
                  ) : (
                    galleryImages.map((image, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="relative w-full sm:w-32 h-32">
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="flex-1 p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 w-full">
                                <div>
                                  <Label htmlFor={`image-alt-${index}`} className="text-xs">
                                    Alt Text
                                  </Label>
                                  <Input
                                    id={`image-alt-${index}`}
                                    value={image.alt}
                                    onChange={(e) => handleGalleryImageAltChange(index, e.target.value)}
                                    placeholder="Image description"
                                    className="text-sm h-8"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`image-caption-${index}`} className="text-xs">
                                    Caption (optional)
                                  </Label>
                                  <Input
                                    id={`image-caption-${index}`}
                                    value={image.caption || ''}
                                    onChange={(e) => handleGalleryImageCaptionChange(index, e.target.value)}
                                    placeholder="Image caption"
                                    className="text-sm h-8"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveGalleryImage(index, 'up')}
                                disabled={index === 0}
                                className="h-8 w-8 p-0"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveGalleryImage(index, 'down')}
                                disabled={index === galleryImages.length - 1}
                                className="h-8 w-8 p-0"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveGalleryImage(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {editMode ? (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleUpdatePost}
                  disabled={isSubmitting}
                  className="bg-[#1a5d1a] hover:bg-[#1a5d1a]/90"
                >
                  {isSubmitting ? 'Updating...' : 'Update Post'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={resetForm}
                >
                  Clear Form
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddPost}
                  disabled={isSubmitting}
                  className="bg-[#1a5d1a] hover:bg-[#1a5d1a]/90"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Post'}
                </Button>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
