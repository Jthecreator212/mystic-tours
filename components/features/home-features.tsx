"use client"

import Link from 'next/link';
import { Map, Plane } from "lucide-react";

const services = [
  {
    icon: <Map className="h-10 w-10 text-[#e9b824]" />,
    title: "Listed Tours & Custom Transport",
    description: "Choose from our curated tours or tell us where you want to go. Whether it's a listed destination or your own special spot, we'll take you there.",
    link: "/tours",
    linkLabel: "View Tours",
  },
  {
    icon: <Plane className="h-10 w-10 text-[#e9b824]" />,
    title: "Reliable Airport Transfers",
    description: "Start and end your trip stress-free. We provide comfortable, private, and timely transfers to your accommodation.",
    link: "/airport-pickup",
    linkLabel: "Book Transfer",
  },
];

export function HomeFeatures() {
  return (
    <section className="py-20 bg-black bg-opacity-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 text-[#e9b824] green-outline-heading">Our Services</h2>
        <p className="text-lg text-[#f8ede3] max-w-2xl mx-auto mb-12">
          Whether you&apos;re seeking adventure or a smooth arrival, we have you covered.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-[#1a5d1a]/50 backdrop-blur-md p-8 rounded-lg border border-[#e9b824]/30 text-white transform hover:scale-105 transition-transform duration-300 flex flex-col items-center"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="font-bold mb-3 text-2xl text-[#e9b824]">{service.title}</h3>
              <p className="text-[#f8ede3] mb-6 flex-grow">{service.description}</p>
              <Link href={service.link} className="vintage-button-secondary mt-auto">
                {service.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 