"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!params.id) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/blog`)
        if (!response.ok) {
          throw new Error('Failed to fetch blog post')
        }

        const data = await response.json()
        
        // Check if the response is an error object
        if (data.error) {
          console.error('API returned an error:', data.error)
          throw new Error(data.error || 'Failed to fetch blog post')
        }
        
        // Ensure we have an array of posts
        const posts = Array.isArray(data) ? data : []
        const foundPost = posts.find((p: BlogPost) => p.id.toString() === params.id)

        if (!foundPost) {
          throw new Error('Blog post not found')
        }

        setPost(foundPost)
      } catch (error: any) {
        console.error('Error fetching blog post:', error)
        setError(error.message || 'Failed to load blog post. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogPost()
  }, [params.id])

  const handlePrevImage = () => {
    if (!post?.gallery.length) return
    setActiveImageIndex((prev) => (prev === 0 ? post.gallery.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    if (!post?.gallery.length) return
    setActiveImageIndex((prev) => (prev === post.gallery.length - 1 ? 0 : prev + 1))
  }

  const openLightbox = (index: number) => {
    setActiveImageIndex(index)
    setShowLightbox(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <p>{error || 'Blog post not found'}</p>
          <Link href="/blog">
            <Button variant="outline" className="mt-2">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/blog" className="inline-flex items-center text-[#1a5d1a] hover:text-[#1a5d1a]/80 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Blog
      </Link>

      <h1 className="text-4xl font-bold text-[#1a5d1a] mb-6">{post.title}</h1>

      <div className="flex flex-wrap items-center text-sm text-gray-600 mb-8 gap-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-[#e9b824]" />
          <span>{post.date}</span>
        </div>
        <div className="flex items-center">
          <User className="w-4 h-4 mr-1 text-[#e9b824]" />
          <span>{post.author}</span>
        </div>
        <div className="flex items-center">
          <Tag className="w-4 h-4 mr-1 text-[#e9b824]" />
          <span>{post.category}</span>
        </div>
      </div>

      {/* Main Featured Image */}
      <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Content Sections */}
      <div className="prose prose-lg max-w-none mb-12">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Image Gallery */}
      {post.gallery && post.gallery.length > 0 && (
        <div className="my-12">
          <h2 className="text-2xl font-bold text-[#1a5d1a] mb-6">Photo Gallery</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {post.gallery.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 text-white text-sm">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && post.gallery.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[80vh] flex flex-col">
            <button 
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
              onClick={() => setShowLightbox(false)}
            >
              ✕
            </button>
            
            <div className="relative w-full h-[70vh] bg-black">
              <Image
                src={post.gallery[activeImageIndex].src}
                alt={post.gallery[activeImageIndex].alt}
                fill
                className="object-contain"
                unoptimized
              />
              
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2"
                onClick={handleNextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            {post.gallery[activeImageIndex].caption && (
              <div className="bg-black text-white p-4 text-center">
                {post.gallery[activeImageIndex].caption}
              </div>
            )}
            
            <div className="flex justify-center mt-4 gap-2 overflow-x-auto pb-2">
              {post.gallery.map((image, index) => (
                <div 
                  key={index} 
                  className={`relative w-16 h-16 cursor-pointer ${index === activeImageIndex ? 'ring-2 ring-[#e9b824]' : 'opacity-70'}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-[#1a5d1a] mb-4">Related Posts</h3>
        <p className="text-gray-600">Explore more of our blog posts to discover more about Jamaica's culture, adventures, and hidden gems.</p>
        <Link href="/blog">
          <Button className="mt-4 bg-[#1a5d1a] hover:bg-[#1a5d1a]/90 text-white">
            View All Posts
          </Button>
        </Link>
      </div>
    </div>
  )
}
