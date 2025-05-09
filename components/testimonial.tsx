import Image from "next/image"

interface TestimonialProps {
  testimonial: {
    id: number
    name: string
    quote: string
    location: string
    image: string
  }
}

export function Testimonial({ testimonial }: TestimonialProps) {
  return (
    <div className="bg-[#f8ede3] rounded-lg p-6 shadow-lg border-4 border-[#e9b824]">
      <div className="flex items-center mb-4">
        <div className="relative w-16 h-16 mr-4 overflow-hidden rounded-full border-2 border-[#e9b824]">
          <Image src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1a5d1a]">{testimonial.name}</h3>
          <p className="text-[#85603f]">{testimonial.location}</p>
        </div>
      </div>

      <blockquote className="relative">
        <span className="absolute top-0 left-0 text-6xl text-[#e9b824] opacity-30">"</span>
        <p className="pl-8 pt-2 italic text-[#85603f]">{testimonial.quote}</p>
      </blockquote>
    </div>
  )
}
