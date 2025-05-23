import type React from "react"
import type { Metadata } from "next"
import { Poppins, Playfair_Display } from "next/font/google"
import { EditModeProvider } from "@/context/edit-mode-context"
import { AdminLoginModal } from "@/components/admin-login-modal"
import "./globals.css"

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
        <EditModeProvider>
          {children}
          {/* Admin login modal is added at the root level so it's available throughout the site */}
          <AdminLoginModal />
        </EditModeProvider>
      </body>
    </html>
  )
}
