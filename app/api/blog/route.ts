import { NextResponse } from 'next/server'
import { supabaseAdmin, getStorageFileUrl } from '@/lib/supabase'

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

// Fallback mock data for blog posts (used only if Supabase connection fails)
let blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Exploring the Blue Mountains",
    excerpt: "Discover the breathtaking views and rich coffee culture of Jamaica's Blue Mountains.",
    content: "The Blue Mountains in Jamaica are a hiker's paradise, offering stunning views and the chance to sample some of the world's best coffee.\n\nRising to over 7,400 feet, the Blue Mountains are the longest mountain range in Jamaica. The range spans four parishes—Portland, St. Thomas, St. Mary, and St. Andrew—and features majestic scenery, cool temperatures, and the famous Blue Mountain coffee.\n\nThe Blue Mountain Peak Trail is the most popular hiking route, taking visitors through lush rainforest to the island's highest point. From the summit on a clear day, you can see both the north and south coasts of Jamaica and even Cuba in the distance.\n\nBeyond hiking, visitors can tour coffee plantations, bird watch in the forest reserve, or simply enjoy the cool mountain air and spectacular views. The region is home to over 200 species of birds and 500 species of flowering plants, many of which are found nowhere else in the world.",
    image: "/images/gallery/mountain-1.png",
    gallery: [
      {
        src: "/images/gallery/mountain-2.png",
        alt: "Blue Mountain Peak Trail",
        caption: "The winding trail to Blue Mountain Peak offers spectacular views at every turn"
      },
      {
        src: "/images/gallery/mountain-3.png",
        alt: "Coffee plantation",
        caption: "Blue Mountain coffee is known worldwide for its exceptional quality and flavor"
      },
      {
        src: "/images/gallery/mountain-4.png",
        alt: "Mountain vista",
        caption: "The view from the Blue Mountains stretches all the way to the Caribbean Sea"
      }
    ],
    author: "Sarah Johnson",
    date: "May 5, 2025",
    category: "Adventure"
  }
]

export async function GET() {
  try {
    // For now, just return the mock data directly
    // This ensures we have content to display while Supabase integration is being completed
    console.log('Returning mock blog posts:', blogPosts.length)
    return NextResponse.json(blogPosts)
    
    /* Commented out until Supabase is fully set up
    // Fetch blog posts from Supabase
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.warn('Supabase error, falling back to mock data:', error)
      // Fallback to mock data if Supabase fails
      return NextResponse.json(blogPosts)
    }
    
    // If no posts found, return mock data
    if (!posts || posts.length === 0) {
      console.log('No posts found in Supabase, using mock data')
      return NextResponse.json(blogPosts)
    }
    
    // Process posts to include gallery images
    const processedPosts = await Promise.all(posts.map(async (post) => {
      // Fetch gallery images for this post
      const { data: galleryImages, error: galleryError } = await supabaseAdmin
        .from('blog_gallery_images')
        .select('*')
        .eq('blog_post_id', post.id)
        .order('position', { ascending: true })
      
      // Format gallery images
      const gallery = galleryImages ? galleryImages.map(img => ({
        src: img.image_url,
        alt: img.alt_text || '',
        caption: img.caption || ''
      })) : []
      
      // Return formatted post
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image_url,
        gallery,
        author: post.author,
        date: new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        category: post.category
      }
    }))
    
    return NextResponse.json(processedPosts)
    */
  } catch (error) {
    console.error('Error in blog API route:', error)
    // Always return mock data as fallback
    return NextResponse.json(blogPosts)
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.excerpt || !data.content || !data.image || !data.author || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert new blog post into Supabase
    const { data: newPost, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        image_url: data.image,
        author: data.author,
        category: data.category,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    
    if (!newPost || newPost.length === 0) {
      throw new Error('Failed to create blog post')
    }
    
    // Process gallery images if any
    if (data.gallery && data.gallery.length > 0) {
      // Insert gallery images with position order
      const galleryInserts = data.gallery.map((image: BlogImage, index: number) => ({
        blog_post_id: newPost[0].id,
        image_url: image.src,
        alt_text: image.alt,
        caption: image.caption || '',
        position: index
      }))
      
      const { error: galleryError } = await supabaseAdmin
        .from('blog_gallery_images')
        .insert(galleryInserts)
      
      if (galleryError) throw galleryError
    }
    
    // Format response to match our interface
    const formattedPost: BlogPost = {
      id: newPost[0].id,
      title: newPost[0].title,
      excerpt: newPost[0].excerpt,
      content: newPost[0].content,
      image: newPost[0].image_url,
      gallery: data.gallery || [],
      author: newPost[0].author,
      date: new Date(newPost[0].created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      category: newPost[0].category
    }
    
    return NextResponse.json(formattedPost)
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.id || !data.title || !data.excerpt || !data.content || !data.image || !data.author || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if post exists
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('id', data.id)
      .single()
    
    if (checkError || !existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    // Update the blog post
    const { data: updatedPost, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        image_url: data.image,
        author: data.author,
        category: data.category,
        // Update timestamp if requested
        updated_at: new Date().toISOString(),
        ...(data.updateDate ? { created_at: new Date().toISOString() } : {})
      })
      .eq('id', data.id)
      .select()
      .single()
    
    if (error) throw error
    
    // Handle gallery images
    if (data.gallery) {
      // First delete all existing gallery images for this post
      const { error: deleteError } = await supabaseAdmin
        .from('blog_gallery_images')
        .delete()
        .eq('blog_post_id', data.id)
      
      if (deleteError) throw deleteError
      
      // Then insert the new gallery images
      if (data.gallery.length > 0) {
        const galleryInserts = data.gallery.map((image: BlogImage, index: number) => ({
          blog_post_id: data.id,
          image_url: image.src,
          alt_text: image.alt,
          caption: image.caption || '',
          position: index
        }))
        
        const { error: insertError } = await supabaseAdmin
          .from('blog_gallery_images')
          .insert(galleryInserts)
        
        if (insertError) throw insertError
      }
    }
    
    // Format the response
    const formattedPost: BlogPost = {
      id: updatedPost.id,
      title: updatedPost.title,
      excerpt: updatedPost.excerpt,
      content: updatedPost.content,
      image: updatedPost.image_url,
      gallery: data.gallery || [],
      author: updatedPost.author,
      date: new Date(updatedPost.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      category: updatedPost.category
    }
    
    return NextResponse.json(formattedPost)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing post ID' },
        { status: 400 }
      )
    }
    
    const postId = parseInt(id)
    
    // Check if post exists
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('id', postId)
      .single()
    
    if (checkError || !existingPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }
    
    // First delete all gallery images for this post
    const { error: galleryError } = await supabaseAdmin
      .from('blog_gallery_images')
      .delete()
      .eq('blog_post_id', postId)
    
    if (galleryError) throw galleryError
    
    // Then delete the blog post
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', postId)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
