"use server"

import { z } from "zod"
import { supabase } from "@/lib/supabase"

const formSchema = z.object({
  customer_name: z.string(),
  customer_email: z.string().email(),
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
  passengers: z.coerce.number(),
  total_price: z.number(),
})

export async function createAirportPickupBooking(formData: z.infer<typeof formSchema>) {
  const parsedData = formSchema.safeParse(formData);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid form data.",
      errors: parsedData.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase
    .from("airport_pickup_bookings")
    .insert([
      {
        customer_name: parsedData.data.customer_name,
        customer_email: parsedData.data.customer_email,
        customer_phone: parsedData.data.customer_phone,
        service_type: parsedData.data.service_type,
        flight_number: parsedData.data.flight_number,
        arrival_date: parsedData.data.arrival_date ? parsedData.data.arrival_date.toISOString().split('T')[0] : null,
        arrival_time: parsedData.data.arrival_time,
        dropoff_location: parsedData.data.dropoff_location,
        departure_flight_number: parsedData.data.departure_flight_number,
        departure_date: parsedData.data.departure_date ? parsedData.data.departure_date.toISOString().split('T')[0] : null,
        departure_time: parsedData.data.departure_time,
        pickup_location: parsedData.data.pickup_location,
        passengers: parsedData.data.passengers,
        total_price: parsedData.data.total_price,
        status: 'pending',
      },
    ]);

  if (error) {
    console.error("Error inserting booking:", error)
    return {
      success: false,
      message: `Database error: ${error.message}`,
    }
  }

  return {
    success: true,
    message: "Thank you for your booking! We will contact you shortly to confirm.",
  }
} 