"use client"

import { useState } from "react"
import { AirportPickupConfirmationDialog } from "@/components/airport-pickup-confirmation-dialog"
import { BookingConfirmationDialog } from "@/components/booking-confirmation-dialog"
import { UltraModernConfirmation } from "@/components/ultra-modern-confirmation"
import { Button } from "@/components/ui/button"

export default function ConfirmationDemoPage() {
  const [showAirportDialog, setShowAirportDialog] = useState(false)
  const [showTourDialog, setShowTourDialog] = useState(false)
  const [showUltraModernDialog, setShowUltraModernDialog] = useState(false)

  // Sample data for airport pickup
  const sampleAirportBooking = {
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    customerPhone: "+1 (555) 123-4567",
    serviceType: "pickup" as const,
    passengers: 2,
    flightNumber: "AA325",
    arrivalDate: new Date("2025-06-26"),
    arrivalTime: "14:00",
    departureFlightNumber: undefined,
    departureDate: undefined,
    departureTime: undefined,
    dropoffLocation: "HOTEL PARADISE",
    pickupLocation: undefined,
    totalAmount: 75.00,
    bookingId: "AP001234"
  }

  // Sample data for ultra-modern dialog
  const ultraModernBookingData = {
    type: 'tour' as const,
    tourName: "Blue Mountain Coffee Experience",
    date: "July 15, 2025",
    guests: 3,
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@example.com",
    totalAmount: 129,
    bookingId: "TB789012",
    flightNumber: undefined,
    destination: undefined,
    serviceType: undefined,
    passengers: undefined
  }

  // Sample data for tour booking
  const sampleTourBooking = {
    tourName: "Blue Mountain Coffee Experience",
    date: "2025-07-15",
    guests: 3,
    customerName: "Mike Johnson",
    customerEmail: "mike.johnson@example.com",
    customerPhone: "+1 (555) 456-7890",
    bookingId: "TB789012",
    totalAmount: 129
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1a5d1a] mb-4">
            Confirmation Dialog Demo
          </h1>
          <p className="text-[#85603f] text-lg">
            Test and preview confirmation dialogs with sample data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Airport Pickup Demos */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e2e8f0]">
            <h2 className="text-2xl font-bold text-[#1a5d1a] mb-6 flex items-center">
              <span className="w-2 h-8 bg-[#e9b824] rounded-full mr-3"></span>
              Original Design
            </h2>
            
            <div className="space-y-4">
              <Button 
                onClick={() => setShowAirportDialog(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all duration-300"
              >
                Show Airport Pickup
              </Button>
              
              <div className="bg-blue-50 rounded-xl p-4 text-sm">
                <p className="font-medium text-blue-900 mb-2">Features:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Basic animations</li>
                  <li>• Clean layout</li>
                  <li>• Essential info</li>
                  <li>• Mobile responsive</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tour Booking Demos */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e2e8f0]">
            <h2 className="text-2xl font-bold text-[#1a5d1a] mb-6 flex items-center">
              <span className="w-2 h-8 bg-[#d83f31] rounded-full mr-3"></span>
              Current Version
            </h2>
            
            <div className="space-y-4">
              <Button 
                onClick={() => setShowTourDialog(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition-all duration-300"
              >
                Show Tour Booking
              </Button>
              
              <div className="bg-green-50 rounded-xl p-4 text-sm">
                <p className="font-medium text-green-900 mb-2">Features:</p>
                <ul className="text-green-700 space-y-1">
                  <li>• Improved animations</li>
                  <li>• Better hierarchy</li>
                  <li>• Icon interactions</li>
                  <li>• Compact design</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Ultra-Modern Version */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 border border-purple-200">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></span>
              2024-2025 Trends
            </h2>
            
            <div className="space-y-4">
              <Button 
                onClick={() => setShowUltraModernDialog(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg"
              >
                ✨ Show Ultra-Modern
              </Button>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-sm">
                <p className="font-medium text-purple-900 mb-2">2024-2025 Features:</p>
                <ul className="text-purple-700 space-y-1">
                  <li>• 🎉 Celebration particles</li>
                  <li>• 🪟 Glass-morphism</li>
                  <li>• ✨ Micro-interactions</li>
                  <li>• 💬 Emotional copy</li>
                  <li>• 🎨 Advanced depth</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Design Comparison */}
        <div className="bg-gradient-to-r from-[#1a5d1a]/10 to-[#e9b824]/10 rounded-2xl p-8 border border-[#e9b824]/30">
          <h3 className="text-xl font-bold text-[#1a5d1a] mb-4">
            🎨 Design Evolution Comparison
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-[#1a5d1a] mb-2">Original (Basic):</h4>
              <ul className="text-[#85603f] space-y-1">
                <li>• Simple fade-in</li>
                <li>• Standard colors</li>
                <li>• Basic layout</li>
                <li>• Functional only</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1a5d1a] mb-2">Current (Enhanced):</h4>
              <ul className="text-[#85603f] space-y-1">
                <li>• Icon animations</li>
                <li>• Staggered reveals</li>
                <li>• Better typography</li>
                <li>• Improved UX</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-2">Ultra-Modern (2024-2025):</h4>
              <ul className="text-purple-700 space-y-1">
                <li>• Physics-based particles</li>
                <li>• Glass-morphism effects</li>
                <li>• Conversational copy</li>
                <li>• Celebration moments</li>
                <li>• Enhanced accessibility</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-[#85603f] mb-4">
            Navigate to: <code className="bg-gray-200 px-2 py-1 rounded text-sm">localhost:3001/demo-confirmation</code>
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => {
                setShowAirportDialog(false)
                setShowTourDialog(false)
                setShowUltraModernDialog(false)
              }}
              variant="outline"
              className="border-[#1a5d1a] text-[#1a5d1a] hover:bg-[#1a5d1a] hover:text-white"
            >
              Close All Dialogs
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AirportPickupConfirmationDialog
        isOpen={showAirportDialog}
        onClose={() => setShowAirportDialog(false)}
        bookingDetails={sampleAirportBooking}
      />

      <BookingConfirmationDialog
        isOpen={showTourDialog}
        onClose={() => setShowTourDialog(false)}
        bookingDetails={sampleTourBooking}
      />

      <UltraModernConfirmation
        isOpen={showUltraModernDialog}
        onClose={() => setShowUltraModernDialog(false)}
        bookingDetails={ultraModernBookingData}
      />
    </div>
  )
} 