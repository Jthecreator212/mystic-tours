"use client"

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"

function FormSkeleton() {
  return (
    <div className="bg-white/50 p-8 rounded-2xl shadow-lg border border-black/10 backdrop-blur-sm space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <Skeleton className="h-12 w-full" />
    </div>
  )
}

const AirportPickupForm = dynamic(
  () => import('./airport-pickup-form').then(mod => mod.AirportPickupForm),
  {
    ssr: false,
    loading: () => <FormSkeleton />,
  }
)

export function AirportPickupFormLoader() {
  return <AirportPickupForm />
} 
