"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase"
import { airportPickupSchema } from "@/lib/form-schemas"

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
  console.log("✈️ Airport Pickup Booking Action Initiated");
  console.log("1. Received Raw FormData:", formData);

  const parsedData = airportPickupSchema.safeParse(formData);

  if (!parsedData.success) {
    console.error("❌ 2. Validation Failed:", parsedData.error.flatten());
    return {
      success: false,
      message: "Invalid form data. Please check the fields and try again.",
      errors: parsedData.error.flatten().fieldErrors,
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
  };

  console.log(" Inserting into Database:", dataToInsert);

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("airport_pickup_bookings")
    .insert([dataToInsert])
    .select()
    .single();
    
  if (bookingError) {
    console.error("❌ 5. Database Insertion Failed:", bookingError);
    return {
      success: false,
      message: `Database error: Could not save your booking.`,
    }
  }

  console.log("✅ 5. Database Insertion Successful. Booking ID:", booking.id);

  console.log("💬 6. Sending Telegram Notification...");
  const notificationResult = await sendAirportPickupNotification({
    ...parsedData.data,
    bookingId: booking.id,
    total_price: totalPrice,
  });

  if (!notificationResult.success) {
    console.error("Telegram notification failed:", notificationResult.message);
  }

  return {
    success: true,
    message: "Thank you for your booking! We will contact you shortly to confirm.",
    bookingId: booking.id,
  }
} 

interface AirportNotificationData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: "pickup" | "dropoff" | "both";
  flight_number?: string;
  arrival_date?: Date;
  arrival_time?: string;
  dropoff_location?: string;
  departure_flight_number?: string;
  departure_date?: Date;
  departure_time?: string;
  pickup_location?: string;
  passengers: number;
  bookingId: number;
  total_price: number;
}

async function sendAirportPickupNotification(data: AirportNotificationData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return { success: false, message: "Telegram credentials not configured." };
  }

  const message = formatAirportPickupMessage(data);
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    const result = await response.json() as any;
    if (!result.ok) throw new Error(`Telegram API error: ${result.description}`);
    return { success: true, message: "Telegram notification sent successfully" };
  } catch (error) {
    console.error("Telegram notification error:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
}

function formatAirportPickupMessage(data: AirportNotificationData): string {
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total_price);

  let message = `🚐 *Airport Transfer Request* ✈️\n\n`;
  
  message += `👤 *Customer:* ${data.customer_name}\n`;
  message += `📞 *Phone:* \`${data.customer_phone || 'N/A'}\`\n`;
  message += `✉️ *Email:* ${data.customer_email}\n\n`;

  message += `🛠️ *Service Type:* ${data.service_type.charAt(0).toUpperCase() + data.service_type.slice(1)}\n`;
  message += `🧑‍🤝‍🧑 *Passengers:* ${data.passengers}\n`;
  message += `💰 *Total Price:* *${formattedPrice}*\n\n`;

  if (data.service_type === 'pickup' || data.service_type === 'both') {
    message += `*Arrival Details*\n`;
    message += `Flight: \`${data.flight_number}\`\n`;
    message += `Date: ${data.arrival_date ? new Date(data.arrival_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}\n`;
    message += `Time: ${data.arrival_time}\n`;
    message += `Drop-off: ${data.dropoff_location}\n\n`;
  }

  if (data.service_type === 'dropoff' || data.service_type === 'both') {
    message += `*Departure Details*\n`;
    message += `Flight: \`${data.departure_flight_number}\`\n`;
    message += `Date: ${data.departure_date ? new Date(data.departure_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}\n`;
    message += `Time: ${data.departure_time}\n`;
    message += `Pickup: ${data.pickup_location}\n\n`;
  }

  message += `*🚨 ACTION REQUIRED 🚨*\n`;
  message += `Confirm booking with customer at \`${data.customer_phone || data.customer_email}\`.\n\n`;
  message += `🤖 _Mystic Booking Bot_`;

  return message;
} 