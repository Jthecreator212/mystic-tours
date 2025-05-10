import { NextRequest, NextResponse } from 'next/server'

// Mock data for images
const mockImages = [
  {
    id: '1',
    url: '/images/placeholder-image-1.jpg',
    name: 'placeholder-image-1.jpg',
    size: 200000,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    url: '/images/placeholder-image-2.jpg',
    name: 'placeholder-image-2.jpg',
    size: 300000,
    createdAt: new Date().toISOString()
  }
]

export async function GET() {
  try {
    return NextResponse.json(mockImages)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // For now, just return a mock response
    return NextResponse.json({
      id: (mockImages.length + 1).toString(),
      url: `/images/${file.name}`,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const id = formData.get('id') as string

    if (!file || !id) {
      return NextResponse.json(
        { error: 'No file or ID provided' },
        { status: 400 }
      )
    }

    // For now, just return a mock response
    return NextResponse.json({
      id,
      url: `/images/${file.name}`,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    )
  }
}
