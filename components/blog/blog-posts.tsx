"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload, Image, Video, Link2, Plus, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface BlogPost {
  id: number
  author: {
    name: string
    image: string
  }
  content: string
  media?: string
  likes: number
  comments: number
  createdAt: string
  type: 'text' | 'image' | 'video'
}

const mockPosts: BlogPost[] = [
  {
    id: 1,
    author: {
      name: "John Traveler",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    },
    content: "Just returned from an amazing adventure in the Amazon Rainforest! The biodiversity is incredible and the local guides were so knowledgeable.",
    media: "https://images.unsplash.com/photo-1504198453319-5ce911b561d8",
    likes: 156,
    comments: 24,
    createdAt: "2 hours ago",
    type: 'image'
  },
  {
    id: 2,
    author: {
      name: "Sarah Explorer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    content: "Exploring the ancient ruins of Machu Picchu was a dream come true! The views from the summit were breathtaking.",
    media: "https://images.unsplash.com/photo-1501004879338-6e0f1c0cfc96",
    likes: 215,
    comments: 42,
    createdAt: "4 hours ago",
    type: 'text'
  },
  {
    id: 3,
    author: {
      name: "Mike Adventure",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a"
    },
    content: "Diving in the Great Barrier Reef was an unforgettable experience! The marine life is so diverse and colorful.",
    media: "https://images.unsplash.com/photo-1559625542-9098650f3327",
    likes: 189,
    comments: 35,
    createdAt: "6 hours ago",
    type: 'image'
  }
]

export function BlogPosts() {
  const [newPost, setNewPost] = useState("")
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)

  const handlePost = () => {
    // TODO: Implement actual post submission
    console.log('Posting:', newPost, selectedMedia)
    setNewPost("")
    setSelectedMedia(null)
    setMediaType(null)
  }

  return (
    <div className="space-y-6">
      {/* Post Form */}
      <Card className="p-4">
        <div className="flex space-x-4">
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" />
            <AvatarFallback>JT</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? Share your travel experiences..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => {
                setMediaType('image')
                // TODO: Open image picker
              }}
            >
              <Image className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setMediaType('video')
                // TODO: Open video picker
              }}
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                // TODO: Add link
              }}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Link
            </Button>
          </div>
          <Button
            onClick={handlePost}
            disabled={!newPost.trim()}
            className="bg-[#1a5d1a] hover:bg-[#009b3a] text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Post
          </Button>
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex space-x-4">
              <Avatar>
                <AvatarImage src={post.author.image} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-[#1a5d1a] font-medium">
                  {post.author.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {post.createdAt}
                </p>
              </div>
            </div>

            <CardContent className="pt-4">
              <p className="text-lg">{post.content}</p>

              {post.media && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  {post.type === 'image' ? (
                    <img 
                      src={post.media} 
                      alt="Post media" 
                      className="w-full h-[300px] object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-[300px] bg-black">
                      <video 
                        className="w-full h-full object-cover"
                        controls
                        poster={post.media}
                      >
                        <source src={post.media} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" className="text-[#1a5d1a]">
                    <Plus className="w-4 h-4 mr-2" />
                    {post.likes} Likes
                  </Button>
                  <Button variant="ghost" className="text-[#1a5d1a]">
                    <Plus className="w-4 h-4 mr-2" />
                    {post.comments} Comments
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" className="text-[#1a5d1a]">
                    <Plus className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="ghost" className="text-[#1a5d1a]">
                    <Plus className="w-4 h-4 mr-2" />
                    Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
