"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase"

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

    return {
      success: true,
      message: "Thank you for your booking! We will contact you shortly to confirm and discuss payment options.",
      bookingId: booking.id,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}

interface NotificationData {
  bookingId: string;
  tourName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  numberOfGuests: number;
  totalAmount: number;
  specialRequests?: string;
}

async function sendTelegramNotification(data: NotificationData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram bot token or chat ID is not configured in .env.local");
    return {
      success: false,
      message: "Telegram credentials not configured."
    };
  }

  const message = formatTelegramMessage(data);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json() as Record<string, unknown>;

    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }

    return {
      success: true,
      message: "Telegram notification sent successfully",
    }
  } catch (error) {
    console.error("Telegram notification error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function formatTelegramMessage(data: NotificationData): string {
  const formattedDate = new Date(data.bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(data.totalAmount);

  let message = `🌴 *Mystic Tours - New Booking!* 🌴\n\n`;
  message += `A new booking has been requested. Please review the details below.\n\n`;

  message += `🎫 *Booking Details*\n`;
  message += `------------------------------------\n`;
  message += `🗺️ *Tour:* ${data.tourName}\n`;
  message += `🗓️ *Date:* ${formattedDate}\n`;
  message += `🧑‍🤝‍🧑 *Guests:* ${data.numberOfGuests}\n`;
  message += `💰 *Total Amount:* *${formattedAmount}*\n`;
  if (data.specialRequests) {
    message += `📝 *Special Requests:* ${data.specialRequests}\n`;
  }
  message += `🆔 *Booking ID:* \`${data.bookingId}\`\n`;
  message += `------------------------------------\n\n`;

  message += `👤 *Customer Info*\n`;
  message += `------------------------------------\n`;
  message += `👨‍🦱 *Name:* ${data.customerName}\n`;
  message += `📞 *Phone:* \`${data.customerPhone}\`\n`;
  message += `✉️ *Email:* ${data.customerEmail}\n`;
  message += `------------------------------------\n\n`;

  message += `*🚨 ACTION REQUIRED 🚨*\n`;
  message += `Please call the customer at *${data.customerPhone}* to confirm the booking and discuss payment options.\n\n`;
  message += `🤖 _Mystic Booking Bot_`;

  return message;
} 