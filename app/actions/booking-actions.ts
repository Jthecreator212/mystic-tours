"use server"

import { formatBookingMessage, sendTelegramMessage } from "@/lib/notifications/telegram";
import { supabaseAdmin } from "@/lib/supabase";
import { checkTourBookingRateLimit, getClientIP } from "@/lib/utils/rate-limiting";
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
  const parsedData = bookingFormSchema.safeParse(formData);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid form data.",
      errors: parsedData.error.flatten().fieldErrors,
    }
  }

  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const clientIP = getClientIP(headersList);
    
    // Check rate limits before processing
    const rateLimitResult = await checkTourBookingRateLimit(clientIP, parsedData.data.email);
    
    if (!rateLimitResult.success) {
      console.log(`🚫 Rate limit exceeded for IP: ${clientIP}, Email: ${parsedData.data.email}`);
      return {
        success: false,
        message: rateLimitResult.message || "Too many booking attempts. Please try again later.",
        rateLimited: true,
      };
    }

    console.log(`✅ Rate limit check passed for IP: ${clientIP}, Email: ${parsedData.data.email}, Remaining: ${rateLimitResult.remaining}`);

    const { data: tour, error: tourError } = await supabaseAdmin
      .from("tours")
      .select("price")
      .eq("id", parsedData.data.tourId)
      .single();

    if (tourError || !tour) {
      return {
        success: false,
        message: "Tour not found.",
      }
    }

    const totalAmount = tour.price * parsedData.data.guests;

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
      console.error("Error inserting booking:", bookingError)
      return {
        success: false,
        message: `Database error: ${bookingError.message}`,
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
      // Don't fail the booking if Telegram fails
    }

    return {
      success: true,
      message: "Booking created successfully!",
      booking: booking,
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}
