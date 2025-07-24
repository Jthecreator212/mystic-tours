"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface TourItineraryProps {
  itinerary: {
    title: string
    description: string
  }[]
}

export function TourItinerary({ itinerary }: TourItineraryProps) {
  const [openItem, setOpenItem] = useState(0)

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? -1 : index)
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl text-[#1a5d1a] mb-6">Tour Itinerary</h2>

      <div className="space-y-4">
        {itinerary.map((item, index) => (
          <div key={index} className="vintage-card">
            <button onClick={() => toggleItem(index)} className="flex justify-between items-center w-full text-left">
              <h3 className="text-xl text-[#1a5d1a] font-bold">{item.title}</h3>
              {openItem === index ? (
                <ChevronUp className="text-[#1a5d1a]" />
              ) : (
                <ChevronDown className="text-[#1a5d1a]" />
              )}
            </button>

            {openItem === index && (
              <div className="mt-4 pt-4 border-t border-[#e9b824]">
                <p>{item.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
