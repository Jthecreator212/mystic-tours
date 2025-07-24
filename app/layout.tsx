import type React from "react"
import type { Metadata } from "next"
import { Poppins, Playfair_Display } from "next/font/google"
import "./globals.css"
import { InvisibleBackgroundMusic } from '@/components/features/invisible-background-music'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Island Mystic Tours - Feel the magic. Hear the soul.",
  description: "Experience the authentic rhythm and soul of Jamaica with our guided tours.",
  icons: {
    icon: "/favicon.png",
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${playfair.variable} font-sans`}>
        {children}
        <InvisibleBackgroundMusic musicSrc="/music/island-vibes-final" volume={0.12} />
      </body>
    </html>
  )
}
