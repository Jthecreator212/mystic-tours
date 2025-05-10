import { NextResponse } from 'next/server'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  image: string
  author: string
  date: string
  category: string
}

const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Exploring Ancient Temples",
    excerpt: "Discover the hidden gems of ancient architecture and history...",
    image: "/images/blog/temple.jpg",
    author: "John Doe",
    date: "May 9, 2025",
    category: "History & Culture"
  },
  {
    id: 2,
    title: "Wildlife Safari Adventures",
    excerpt: "Experience the thrill of wildlife encounters in their natural habitat...",
    image: "/images/blog/wildlife.jpg",
    author: "Jane Smith",
    date: "May 8, 2025",
    category: "Adventure"
  }
]

export async function GET() {
  try {
    // In a real application, this would fetch from a database
    return NextResponse.json(mockBlogPosts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.excerpt || !data.image || !data.author || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real application, you would save this to a database
    const newPost: BlogPost = {
      id: mockBlogPosts.length + 1,
      title: data.title,
      excerpt: data.excerpt,
      image: data.image,
      author: data.author,
      date: new Date().toLocaleDateString(),
      category: data.category
    }
    
    mockBlogPosts.push(newPost)
    
    return NextResponse.json(newPost)
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
