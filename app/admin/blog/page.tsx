"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import BlogManager from "@/components/admin/BlogManager"

export default function AdminBlogPage() {
  return (
    <div className="space-y-6">
      <div className="relative h-[200px] mb-8 overflow-hidden rounded-xl">
        <Image 
          src="/images/blog-header.png" 
          alt="Blog Management" 
          fill 
          priority 
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a5d1a]/80 to-[#1a5d1a]/40"></div>
        
        <div className="absolute top-0 left-0 p-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white">
              <ArrowLeft className="h-4 w-4 text-[#1a5d1a]" />
            </Button>
          </Link>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Blog Management</h1>
        </div>
      </div>
      
      <BlogManager />
    </div>
  )
}
