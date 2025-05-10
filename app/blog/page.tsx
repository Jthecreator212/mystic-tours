"use client"

import { useState, useEffect } from "react"
import { adminStyles } from "@/app/admin/styles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2 } from "lucide-react"
import Image from "next/image"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  image: string
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
      const response = await fetch('/api/blog')
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#1a5d1a]">Blog</h1>
          <button
            className={`${adminStyles.button.primary} flex items-center`}
            onClick={() => {
              // TODO: Implement new post modal
              console.log("New post")
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Post
          </button>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-[#1a5d1a]">Blog</h1>
        <button
          className={`${adminStyles.button.primary} flex items-center`}
          onClick={() => {
            // TODO: Implement new post modal
            console.log("New post")
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: BlogPost) => (
          <Card key={post.id} className="h-full">
            <CardHeader className="relative aspect-video">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4">
                <h3 className="text-white font-bold">{post.category}</h3>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-[#1a5d1a] mb-2">{post.title}</CardTitle>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{post.author}</span>
                  <span className="text-[#e9b824]">•</span>
                  <span>{post.date}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-[#e9b824] hover:text-[#fed100]">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-[#e9b824] hover:text-[#fed100]">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
