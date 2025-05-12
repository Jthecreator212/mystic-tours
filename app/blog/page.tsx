"use client"

import { useState, useEffect } from "react"
import { adminStyles } from "@/app/admin/styles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      console.log('Fetching blog posts...')
      const response = await fetch('/api/blog')
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }
      
      const data = await response.json()
      console.log('Blog API response:', data)
      
      // Check if the response is an error object
      if (data.error) {
        console.error('API returned an error:', data.error)
        // Use empty array as fallback
        setPosts([])
      } else {
        // Set the posts data
        const postsArray = Array.isArray(data) ? data : []
        console.log('Setting posts array:', postsArray)
        setPosts(postsArray)
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      // Use empty array as fallback
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#1a5d1a] hover:text-[#1a5d1a]/80 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-[#1a5d1a]">Blog</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Our Blog"
        subtitle="Stories, insights, and adventures from the heart of Jamaica"
        imagePath="/images/blog-header.png"
      />

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: BlogPost) => (
          <Link href={`/blog/${post.id}`} key={post.id}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <CardHeader className="relative aspect-video p-0">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover rounded-t-lg"
                  unoptimized
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4">
                  <h3 className="text-white font-bold">{post.category}</h3>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-[#1a5d1a] mb-2">{post.title}</CardTitle>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{post.author}</span>
                    <span className="text-[#e9b824]">•</span>
                    <span>{post.date}</span>
                  </div>
                  <Button variant="ghost" className="text-[#1a5d1a] font-medium p-0 h-auto">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600 mb-6">Check back soon for new content about our tours and Jamaica.</p>
        </div>
      )}
      </section>

      <Footer />
    </main>
  )
}
