"use client"

import Image from "next/image"

interface TestimonialProps {
  testimonial: {
    id: number;
    name: string;
    location: string;
    quote: string;
    image_url: string;
  }
}

export function Testimonial({ testimonial }: TestimonialProps) {
  return (
    <div className="text-center p-6 md:p-8 rounded-lg bg-[#f8ede3]/50 shadow-lg transition-all duration-300 hover:shadow-2xl hover:bg-[#f8ede3]">
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-md border-4 border-[#e9b824]">
          <Image
            src={testimonial.image_url || '/placeholder.svg'}
            alt={`Testimonial from ${testimonial.name}`}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div>
        <blockquote className="text-lg italic text-[#85603f] mb-4 relative">
          <span className="absolute -left-4 -top-2 text-6xl text-[#e9b824] opacity-30 font-serif">“</span>
          {testimonial.quote}
          <span className="absolute -right-2 -bottom-4 text-6xl text-[#e9b824] opacity-30 font-serif">”</span>
        </blockquote>
        <p className="font-bold text-[#1a5d1a] text-xl">{testimonial.name}</p>
        <p className="text-sm text-[#85603f]">{testimonial.location}</p>
      </div>
    </div>
  )
}
