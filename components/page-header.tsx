import Image from "next/image"

interface PageHeaderProps {
  title: string
  subtitle: string
  imagePath: string
}

export function PageHeader({ title, subtitle, imagePath }: PageHeaderProps) {
  return (
    <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
      <div className="absolute inset-0">
        <Image src={imagePath || "/placeholder.svg"} alt={title} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a5d1a]/70 to-transparent"></div>
      </div>

      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl text-[#e9b824] mb-4 drop-shadow-lg">{title}</h1>
          <p className="text-xl text-[#f8ede3] max-w-xl drop-shadow-md">{subtitle}</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#f8ede3"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  )
}
