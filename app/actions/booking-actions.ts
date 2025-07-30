"use server"

import { formatBookingMessage, sendTelegramMessage } from "@/lib/notifications/telegram";
import { supabaseAdmin } from "@/lib/supabase";
import { checkTourBookingRateLimit, getClientIP } from "@/lib/utils/rate-limiting";
import { createAppError, ERROR_CODES } from "@/lib/utils/error-handling";

import { headers } from "next/headers";
import { z } from "zod";

const bookingFormSchema = z.object({
  tourId: z.string().uuid(),
  tourName: z.string(),
  date: z.string(),
  guests: z.coerce.number().min(1).max(20),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  specialRequests: z.string().optional(),
})

export async function createTourBooking(formData: z.infer<typeof bookingFormSchema>) {
  try {
    // Validate form data
    const parsedData = bookingFormSchema.safeParse(formData);

    if (!parsedData.success) {
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid booking form data',
        'Please check your information and try again'
      );
      return {
        success: false,
        message: error.message,
        errors: parsedData.error.flatten().fieldErrors,
        errorCode: error.code
      }
    }

    // Get client IP for rate limiting
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    
    // Check rate limits before processing
    const rateLimitResult = await checkTourBookingRateLimit(clientIP, parsedData.data.email);
    
    if (!rateLimitResult.success) {
      console.log(`🚫 Rate limit exceeded for IP: ${clientIP}, Email: ${parsedData.data.email}`);
      const error = createAppError(
        ERROR_CODES.RATE_LIMITED,
        'Too many booking attempts',
        'Please wait a moment before trying again'
      );
      return {
        success: false,
        message: error.message,
        rateLimited: true,
        errorCode: error.code
      };
    }

    console.log(`✅ Rate limit check passed for IP: ${clientIP}, Email: ${parsedData.data.email}, Remaining: ${rateLimitResult.remaining}`);

    // Fetch tour details
    const { data: tour, error: tourError } = await supabaseAdmin
      .from("tours")
      .select("price")
      .eq("id", parsedData.data.tourId)
      .single();

    if (tourError || !tour) {
      const error = createAppError(
        ERROR_CODES.DB_NOT_FOUND,
        'Tour not found',
        'The selected tour is no longer available'
      );
      return {
        success: false,
        message: error.message,
        errorCode: error.code
      }
    }

    const totalAmount = tour.price * parsedData.data.guests;

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert([
        {
          tour_id: parsedData.data.tourId,
          customer_name: parsedData.data.name,
          customer_email: parsedData.data.email,
          customer_phone: parsedData.data.phone,
          booking_date: parsedData.data.date,
          number_of_people: parsedData.data.guests,
          total_amount: totalAmount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error("Error inserting booking:", bookingError);
      const error = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to create booking',
        'Please try again or contact support if the problem persists'
      );
      return {
        success: false,
        message: error.message,
        errorCode: error.code
      }
    }

    // Send Telegram notification
    console.log("💬 Sending Telegram notification...");
    try {
      const message = formatBookingMessage({
        customerName: parsedData.data.name,
        customerEmail: parsedData.data.email,
        customerPhone: parsedData.data.phone,
        tourName: parsedData.data.tourName,
        bookingDate: parsedData.data.date,
        numberOfGuests: parsedData.data.guests,
        totalAmount: totalAmount,
        specialRequests: parsedData.data.specialRequests,
        bookingId: booking.id
      });

      await sendTelegramMessage(message);
      console.log("✅ Telegram notification sent successfully");
    } catch (telegramError) {
      console.error("❌ Failed to send Telegram notification:", telegramError);
      // Don't fail the booking if Telegram fails - just log it
    }

    return {
      success: true,
      message: "Booking created successfully! We'll contact you shortly to confirm.",
      booking: booking,
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    const appError = createAppError(
      ERROR_CODES.UNKNOWN_ERROR,
      'Unexpected error during booking creation',
      'Please try again or contact support'
    );
    return {
      success: false,
      message: appError.message,
      errorCode: appError.code
    }
  }
}
