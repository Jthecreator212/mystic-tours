"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  Eye,
  ArrowUpDown,
  Folder,
  LayoutGrid,
  List,
  Wand2,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { useDirectEdit } from "../direct-edit-provider"

// Define image category types
type ImageCategory = 
  | "hero" 
  | "tour" 
  | "gallery" 
  | "testimonial" 
  | "about" 
  | "contact" 
  | "logo" 
  | "other"

// Define image type
interface ImageItem {
  id: string
  name: string
  path: string
  category: ImageCategory
  size: string
  dimensions: string
  format: string
  lastModified: string
  usedIn: string[]
}

export default function ImagesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory | "all">("all")
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [images, setImages] = useState<ImageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { directEditMode, enableDirectEdit, disableDirectEdit } = useDirectEdit()

  // Categories for filtering
  const categories: { value: ImageCategory | "all", label: string }[] = [
    { value: "all", label: "All Images" },
    { value: "hero", label: "Hero Images" },
    { value: "tour", label: "Tour Images" },
    { value: "gallery", label: "Gallery Images" },
    { value: "testimonial", label: "Testimonial Images" },
    { value: "about", label: "About Page Images" },
    { value: "contact", label: "Contact Page Images" },
    { value: "logo", label: "Logos" },
    { value: "other", label: "Other Images" }
  ]

  // Mock data loading
  useEffect(() => {
    // In a real app, this would be an API call
    const mockImages: ImageItem[] = [
      {
        id: "img1",
        name: "hero-background.png",
        path: "/images/hero-bg.png",
        category: "hero",
        size: "1.2 MB",
        dimensions: "1920 x 1080",
        format: "PNG",
        lastModified: "2025-05-01",
        usedIn: ["Home Page"]
      },
      {
        id: "img2",
        name: "testimonial-1.png",
        path: "/images/testimonial-1.png",
        category: "testimonial",
        size: "450 KB",
        dimensions: "500 x 500",
        format: "PNG",
        lastModified: "2025-05-02",
        usedIn: ["Home Page", "About Page"]
      },
      {
        id: "img3",
        name: "testimonial-2.png",
        path: "/images/testimonial-2.png",
        category: "testimonial",
        size: "420 KB",
        dimensions: "500 x 500",
        format: "PNG",
        lastModified: "2025-05-02",
        usedIn: ["Home Page"]
      },
      {
        id: "img4",
        name: "tour-blue-mountain.png",
        path: "/images/tours/blue-mountain.png",
        category: "tour",
        size: "1.8 MB",
        dimensions: "1200 x 800",
        format: "PNG",
        lastModified: "2025-05-03",
        usedIn: ["Tours Page", "Tour Details"]
      },
      {
        id: "img5",
        name: "gallery-reggae.png",
        path: "/images/gallery/music-1.png",
        category: "gallery",
        size: "980 KB",
        dimensions: "1200 x 800",
        format: "PNG",
        lastModified: "2025-05-04",
        usedIn: ["Gallery Page"]
      },
      {
        id: "img6",
        name: "about-header.png",
        path: "/images/about-header.png",
        category: "about",
        size: "1.5 MB",
        dimensions: "1920 x 600",
        format: "PNG",
        lastModified: "2025-05-05",
        usedIn: ["About Page"]
      },
      {
        id: "img7",
        name: "contact-header.png",
        path: "/images/contact-header.png",
        category: "contact",
        size: "1.4 MB",
        dimensions: "1920 x 600",
        format: "PNG",
        lastModified: "2025-05-06",
        usedIn: ["Contact Page"]
      },
      {
        id: "img8",
        name: "logo.png",
        path: "/images/island-mystiq-logo.png",
        category: "logo",
        size: "120 KB",
        dimensions: "200 x 200",
        format: "PNG",
        lastModified: "2025-05-07",
        usedIn: ["All Pages"]
      }
    ]

    setTimeout(() => {
      setImages(mockImages)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter and sort images
  const filteredImages = images
    .filter(image => 
      (selectedCategory === "all" || image.category === selectedCategory) &&
      (image.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       image.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
       image.usedIn.some(location => location.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name)
      } else if (sortBy === "date") {
        return sortDirection === "asc"
          ? new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          : new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      } else {
        // Sort by size (convert from string to number)
        const aSize = parseFloat(a.size.split(" ")[0])
        const bSize = parseFloat(b.size.split(" ")[0])
        return sortDirection === "asc" ? aSize - bSize : bSize - aSize
      }
    })

  // Toggle sort direction
  const toggleSort = (field: "name" | "date" | "size") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-[#1a5d1a]">Image Management</h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f8ede3] rounded-md p-1">
            <button
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={18} className="text-[#1a5d1a]" />
            </button>
            <button
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} className="text-[#1a5d1a]" />
            </button>
          </div>
          
          <div 
            className="flex items-center gap-2 bg-[#f8ede3] p-2 rounded-md cursor-pointer"
            onClick={() => directEditMode ? disableDirectEdit() : enableDirectEdit()}
            title={directEditMode ? "Disable Direct Edit Mode" : "Enable Direct Edit Mode"}
          >
            <span className="text-sm font-medium">Direct Edit</span>
            {directEditMode ? (
              <ToggleRight className="text-[#1a5d1a]" size={20} />
            ) : (
              <ToggleLeft className="text-[#85603f]" size={20} />
            )}
          </div>
          
          <Link 
            href="/admin/images/upload" 
            className="bg-[#1a5d1a] text-white py-2 px-4 rounded-md flex items-center hover:bg-[#4e9f3d] transition-colors"
          >
            <Plus className="mr-2" size={18} />
            Upload Images
          </Link>
        </div>
      </div>
      
      {directEditMode && (
        <div className="bg-[#e9b824]/20 border-2 border-[#e9b824] rounded-md p-4 mb-6 flex items-center">
          <Wand2 className="text-[#1a5d1a] mr-3 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-[#1a5d1a]">Direct Edit Mode Enabled</h3>
            <p className="text-sm text-[#85603f]">
              Go to any page on your site and click on an image to edit it directly. 
              A special toolbar will appear when you hover over editable images.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#85603f]" size={18} />
            <input
              type="text"
              placeholder="Search images by name, category, or usage..."
              className="w-full pl-10 pr-4 py-2 border border-[#e9b824] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-[#85603f]" size={18} />
            <select
              className="border border-[#e9b824] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ImageCategory | "all")}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="bg-[#f8ede3]/50 rounded-md h-48 animate-pulse"></div>
              ))
            ) : filteredImages.length === 0 ? (
              <div className="col-span-full text-center py-8 text-[#85603f]">
                No images found matching your criteria
              </div>
            ) : (
              filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className="group relative bg-white border border-[#e9b824] rounded-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-36 overflow-hidden bg-[#f8ede3]/30">
                    <Image
                      src={image.path}
                      alt={image.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-medium text-[#1a5d1a] text-sm truncate">{image.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[#1a5d1a]/10 text-[#1a5d1a]">
                        {image.category}
                      </span>
                      <span className="text-xs text-[#85603f]">{image.size}</span>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button className="p-2 bg-white rounded-full text-[#1a5d1a] hover:bg-[#f8ede3] transition-colors">
                      <Eye size={16} />
                    </button>
                    <Link 
                      href={`/admin/images/edit/${image.id}`}
                      className="p-2 bg-white rounded-full text-[#e9b824] hover:bg-[#f8ede3] transition-colors"
                    >
                      <Edit size={16} />
                    </Link>
                    <button className="p-2 bg-white rounded-full text-[#d83f31] hover:bg-[#f8ede3] transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* List View */}
        {viewMode === "list" && (

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8ede3] text-[#1a5d1a]">
                <th className="p-3 text-left">Preview</th>
                <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort("name")}>
                  <div className="flex items-center">
                    Name
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort("size")}>
                  <div className="flex items-center">
                    Size
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="p-3 text-left">Format</th>
                <th className="p-3 text-left cursor-pointer" onClick={() => toggleSort("date")}>
                  <div className="flex items-center">
                    Modified
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="p-3 text-left">Used In</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a5d1a]"></div>
                      <span>Loading images...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredImages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    No images found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredImages.map((image) => (
                  <tr key={image.id} className="border-b border-[#f8ede3] hover:bg-[#f8ede3]/50">
                    <td className="p-3">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden border border-[#e9b824]">
                        <Image
                          src={image.path}
                          alt={image.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3 font-medium">{image.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-[#1a5d1a]/10 text-[#1a5d1a]">
                        {image.category}
                      </span>
                    </td>
                    <td className="p-3">{image.size}</td>
                    <td className="p-3">{image.format}</td>
                    <td className="p-3">{image.lastModified}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {image.usedIn.map((location, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 rounded-full text-xs bg-[#e9b824]/20 text-[#85603f]"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-2">
                        <button 
                          className="p-1 text-[#1a5d1a] hover:bg-[#1a5d1a]/10 rounded-full"
                          title="View Image"
                        >
                          <Eye size={18} />
                        </button>
                        <Link 
                          href={`/admin/images/edit/${image.id}`}
                          className="p-1 text-[#e9b824] hover:bg-[#e9b824]/10 rounded-full"
                          title="Edit Image"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          className="p-1 text-[#d83f31] hover:bg-[#d83f31]/10 rounded-full"
                          title="Delete Image"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button 
                          className="p-1 text-[#85603f] hover:bg-[#85603f]/10 rounded-full"
                          title="Download Image"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">Image Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.filter(c => c.value !== "all").map((category) => (
              <div 
                key={category.value}
                className={`flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 ${selectedCategory === category.value ? 'bg-[#1a5d1a] text-white' : 'bg-[#f8ede3] hover:bg-[#e9b824]/20'}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                <Folder className="mr-2" size={18} />
                <span>{category.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-[#1a5d1a] mb-4">Image Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Images:</span>
              <span className="font-bold">{images.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Size:</span>
              <span className="font-bold">7.87 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Most Used Category:</span>
              <span className="font-bold">Gallery (42 images)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Supported Formats:</span>
              <span className="font-bold">PNG, JPG, WEBP, GIF, SVG</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
