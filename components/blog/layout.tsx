"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, Mail, MapPin, Twitter, Facebook, Pinterest } from "lucide-react"
import Image from "next/image"

interface BlogLayoutProps {
  children: React.ReactNode
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8">
          {children}
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          {/* Book a Tour Button */}
          <div className="mb-8">
            <a
              href="/tours"
              className="block bg-[#1a5d1a] text-white font-bold text-center py-4 rounded-lg hover:bg-[#154a15] transition-colors"
            >
              Book a Tour
            </a>
          </div>

          {/* Recent Posts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((post) => (
                  <div key={post} className="flex items-start space-x-4">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={`/images/blog/placeholder${post}.jpg`}
                        alt={`Recent post ${post}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sample Post Title</h3>
                      <p className="text-sm text-gray-600">May 9, 2025</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instagram Feed */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Instagram Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((post) => (
                  <div key={post} className="relative aspect-square">
                    <Image
                      src={`/images/instagram/${post}.jpg`}
                      alt={`Instagram post ${post}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter Form */}
          <Card>
            <CardHeader>
              <CardTitle>Subscribe to Our Newsletter</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1a5d1a] text-white py-2 rounded-lg hover:bg-[#154a15] transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
