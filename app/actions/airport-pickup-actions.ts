"use server"

import { formatAirportPickupMessage, sendTelegramMessage } from "@/lib/notifications/telegram";
import { airportPickupSchema } from '@/lib/schemas/form-schemas';
import { supabaseAdmin } from "@/lib/supabase";
import { createAppError, ERROR_CODES } from "@/lib/utils/error-handling";

import { z } from "zod";

function calculatePrice(serviceType: "pickup" | "dropoff" | "both"): number {
  switch (serviceType) {
    case "pickup":
      return 75.00;
    case "dropoff":
      return 75.00;
    case "both":
      return 140.00;
    default:
      return 0;
  }
}

export async function createAirportPickupBooking(formData: z.infer<typeof airportPickupSchema>) {
  try {
    console.log("✈️ Airport Pickup Booking Action Initiated");
    console.log("1. Received Raw FormData:", formData);

    const parsedData = airportPickupSchema.safeParse(formData);

    if (!parsedData.success) {
      console.error("❌ 2. Validation Failed:", parsedData.error.flatten());
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid airport pickup form data',
        'Please check your information and try again'
      );
      return {
        success: false,
        message: error.message,
        errors: parsedData.error.flatten().fieldErrors,
        errorCode: error.code
      }
    }
    
    console.log("✅ 2. Validation Successful. Parsed Data:", parsedData.data);

    const totalPrice = calculatePrice(parsedData.data.service_type);
    console.log(`💰 3. Calculated Price: $${totalPrice}`);

    const dataToInsert = {
      customer_name: parsedData.data.customer_name,
      customer_email: parsedData.data.customer_email,
      customer_phone: parsedData.data.customer_phone,
      service_type: parsedData.data.service_type,
      flight_number: parsedData.data.flight_number,
      arrival_date: parsedData.data.arrival_date ? new Date(parsedData.data.arrival_date).toISOString() : null,
      arrival_time: parsedData.data.arrival_time,
      dropoff_location: parsedData.data.dropoff_location,
      departure_flight_number: parsedData.data.departure_flight_number,
      departure_date: parsedData.data.departure_date ? new Date(parsedData.data.departure_date).toISOString() : null,
      departure_time: parsedData.data.departure_time,
      pickup_location: parsedData.data.pickup_location,
      passengers: parsedData.data.passengers,
      total_price: totalPrice,
      status: 'pending',
      notes: parsedData.data.notes || null,
    };

    console.log("4. Inserting into Database:", dataToInsert);

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("airport_pickup_bookings")
      .insert([dataToInsert])
      .select()
      .single();
      
    if (bookingError) {
      console.error("❌ 5. Database Insertion Failed:", bookingError);
      const error = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to create airport pickup booking',
        'Please try again or contact support if the problem persists'
      );
      return {
        success: false,
        message: error.message,
        errorCode: error.code
      }
    }

    console.log("✅ 5. Database Insertion Successful. Booking ID:", booking.id);

    console.log("💬 6. Sending Telegram Notification...");
    try {
      const message = formatAirportPickupMessage({
        customer_name: parsedData.data.customer_name,
        customer_email: parsedData.data.customer_email,
        customer_phone: parsedData.data.customer_phone,
        service_type: parsedData.data.service_type,
        flight_number: parsedData.data.flight_number || '',
        arrival_date: parsedData.data.arrival_date ? parsedData.data.arrival_date.toISOString() : undefined,
        arrival_time: parsedData.data.arrival_time || '',
        dropoff_location: parsedData.data.dropoff_location || '',
        departure_flight_number: parsedData.data.departure_flight_number,
        departure_date: parsedData.data.departure_date ? parsedData.data.departure_date.toISOString() : undefined,
        departure_time: parsedData.data.departure_time,
        pickup_location: parsedData.data.pickup_location,
        passengers: parsedData.data.passengers,
        total_price: totalPrice,
        notes: parsedData.data.notes,
      });
      const notificationResult = await sendTelegramMessage(message);
      console.log("✅ 7. Telegram Notification Result:", notificationResult);
    } catch (notificationError) {
      console.error("Telegram notification failed:", notificationError);
      // Don't fail the booking if Telegram fails - just log it
    }

    return {
      success: true,
      message: "Thank you for your booking! We will contact you shortly to confirm.",
      bookingId: booking.id,
    }
  } catch (error) {
    console.error("Error creating airport pickup booking:", error);
    const appError = createAppError(
      ERROR_CODES.UNKNOWN_ERROR,
      'Unexpected error during airport pickup booking creation',
      'Please try again or contact support'
    );
    return {
      success: false,
      message: appError.message,
      errorCode: appError.code
    }
  }
}