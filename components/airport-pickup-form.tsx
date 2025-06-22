"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, PlaneLanding, PlaneTakeoff } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { createAirportPickupBooking } from "@/app/actions/airport-pickup-actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters."),
  customer_email: z.string().email("Invalid email address."),
  customer_phone: z.string().optional(),
  service_type: z.enum(["pickup", "dropoff", "both"]),
  flight_number: z.string().optional(),
  arrival_date: z.date().optional(),
  arrival_time: z.string().optional(),
  dropoff_location: z.string().optional(),
  departure_flight_number: z.string().optional(),
  departure_date: z.date().optional(),
  departure_time: z.string().optional(),
  pickup_location: z.string().optional(),
  passengers: z.coerce.number().min(1, "At least 1 passenger is required."),
}).refine((data) => {
  if (data.service_type === 'pickup' || data.service_type === 'both') {
    return !!data.flight_number && !!data.arrival_date && !!data.arrival_time && !!data.dropoff_location;
  }
  return true;
}, {
  message: "Arrival details are required for pickup.",
  path: ['flight_number'], 
}).refine((data) => {
  if (data.service_type === 'dropoff' || data.service_type === 'both') {
    return !!data.departure_flight_number && !!data.departure_date && !!data.departure_time && !!data.pickup_location;
  }
  return true;
}, {
  message: "Departure details are required for drop-off.",
  path: ['departure_flight_number'],
});

export function AirportPickupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [isError, setIsError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      service_type: "pickup",
      flight_number: "",
      arrival_time: "14:00",
      dropoff_location: "",
      departure_flight_number: "",
      departure_time: "10:00",
      pickup_location: "",
      passengers: 1,
    },
  })

  const selectedServiceType = form.watch("service_type")

  const getPrice = () => {
    switch (selectedServiceType) {
      case "pickup": return 75.00;
      case "dropoff": return 75.00;
      case "both": return 140.00;
      default: return 0;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitMessage("")
    setIsError(false)

    const result = await createAirportPickupBooking({
      ...values,
      total_price: getPrice(),
    });

    if (result.success) {
      setSubmitMessage(result.message);
      form.reset();
    } else {
      setSubmitMessage(result.message || "An unexpected error occurred.");
      setIsError(true);
    }

    setIsSubmitting(false)
  }

  return (
    <div className="vintage-card p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="customer_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl><Input placeholder="So we can contact you if needed" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Select Service</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                    
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="pickup" /></FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-normal">Airport Pickup ($75)</FormLabel>
                        <FormDescription>
                          We'll meet you at Montego Bay Airport (MBJ) and transport you to your accommodation.
                        </FormDescription>
                      </div>
                    </FormItem>

                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="dropoff" /></FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-normal">Airport Drop-off ($75)</FormLabel>
                        <FormDescription>
                          We'll pick you up from your accommodation and transport you to Montego Bay Airport (MBJ).
                        </FormDescription>
                      </div>
                    </FormItem>

                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="both" /></FormControl>
                      <div className="space-y-1">
                        <FormLabel className="font-normal">Round Trip ($140 - Save $10)</FormLabel>
                        <FormDescription>
                          We'll handle both your arrival and departure transportation.
                        </FormDescription>
                      </div>
                    </FormItem>
                    
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(selectedServiceType === 'pickup' || selectedServiceType === 'both') && (
            <div className="space-y-4 p-5 border border-yellow-300/80 rounded-lg bg-yellow-50/30 shadow-sm">
              <h3 className="font-bold text-lg text-[#1a5d1a] flex items-center gap-3">
                <PlaneLanding className="w-6 h-6 text-[#e9b824]" />
                Arrival Details
              </h3>
              <FormField control={form.control} name="flight_number" render={({ field }) => (<FormItem><FormLabel>Arrival Flight Number</FormLabel><FormControl><Input placeholder="e.g., AA1234" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="arrival_date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Arrival Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="arrival_time" render={({ field }) => (<FormItem><FormLabel>Arrival Time</FormLabel><FormControl><Input placeholder="HH:MM" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="dropoff_location" render={({ field }) => (<FormItem><FormLabel>Drop-off Location</FormLabel><FormControl><Input placeholder="e.g., Villa, Airbnb, Private Residence" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          )}
          
          {(selectedServiceType === 'dropoff' || selectedServiceType === 'both') && (
            <div className="space-y-4 p-5 border border-yellow-300/80 rounded-lg bg-yellow-50/30 shadow-sm">
              <h3 className="font-bold text-lg text-[#1a5d1a] flex items-center gap-3">
                <PlaneTakeoff className="w-6 h-6 text-[#e9b824]" />
                Departure Details
              </h3>
              <FormField control={form.control} name="departure_flight_number" render={({ field }) => (<FormItem><FormLabel>Departure Flight Number</FormLabel><FormControl><Input placeholder="e.g., DL5678" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="departure_date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Departure Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="departure_time" render={({ field }) => (<FormItem><FormLabel>Departure Time</FormLabel><FormControl><Input placeholder="HH:MM" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="pickup_location" render={({ field }) => (<FormItem><FormLabel>Pickup Location</FormLabel><FormControl><Input placeholder="e.g., Villa, Airbnb, Private Residence" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          )}

          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Passengers</FormLabel>
                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full vintage-button" disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : `Book Now ($${getPrice().toFixed(2)})`}
          </Button>

          {submitMessage && (
             <div className={`text-center p-4 mt-4 rounded-md ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {submitMessage}
            </div>
          )}
        </form>
      </Form>
    </div>
  )
} 