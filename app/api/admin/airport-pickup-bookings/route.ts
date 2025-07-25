import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { airportPickupSchema } from '@/lib/schemas/form-schemas';

function calculatePrice(serviceType: 'pickup' | 'dropoff' | 'both'): number {
  switch (serviceType) {
    case 'pickup':
    case 'dropoff':
      return 75.00;
    case 'both':
      return 140.00;
    default:
      return 0;
  }
}

interface AirportPickupNotificationData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: 'pickup' | 'dropoff' | 'both';
  flight_number?: string;
  arrival_date?: string;
  arrival_time?: string;
  dropoff_location?: string;
  departure_flight_number?: string;
  departure_date?: string;
  departure_time?: string;
  pickup_location?: string;
  passengers: number;
  bookingId: number;
  total_price: number;
  notes: string;
}

async function sendAirportPickupNotification(data: AirportPickupNotificationData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return { success: false, message: 'Telegram credentials not configured.' };
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
    const result = await response.json();
    if (!result.ok) throw new Error(`Telegram API error: ${result.description}`);
    return { success: true, message: 'Telegram notification sent successfully' };
  } catch {
    return { success: false, message: 'Unknown error' };
  }
}

function formatAirportPickupMessage(data: AirportPickupNotificationData): string {
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total_price);
  let message = `🚐 *Airport Transfer Request* ✈️\n\n`;
  message += `👤 *Customer:* ${data.customer_name}\n`;
  message += `📞 *Phone:* \`${data.customer_phone || 'N/A'}\`\n`;
  message += `✉️ *Email:* ${data.customer_email}\n\n`;
  message += `🛠️ *Service Type:* ${data.service_type.charAt(0).toUpperCase() + data.service_type.slice(1)}\n`;
  message += `🧑‍🤝‍🧑 *Passengers:* ${data.passengers}\n`;
  message += `💰 *Total Price:* *${formattedPrice}*\n\n`;
  if (data.notes) {
    message += `📝 *Notes:* ${data.notes}\n\n`;
  }
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[API] /api/admin/airport-pickup-bookings POST called');
    console.log('[API] Received body:', JSON.stringify(body));
    const parsedData = airportPickupSchema.safeParse(body);
    if (!parsedData.success) {
      console.log('[API] Validation failed:', JSON.stringify(parsedData.error.flatten().fieldErrors));
      return NextResponse.json({ error: 'Invalid form data', details: parsedData.error.flatten().fieldErrors }, { status: 400 });
    }
    const totalPrice = calculatePrice(parsedData.data.service_type);
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
    console.log('[API] Inserting into DB:', JSON.stringify(dataToInsert));
    const { data: booking, error: booking_error } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .insert([dataToInsert])
      .select()
      .single();
    if (booking_error) {
      console.log('[API] DB insert error:', booking_error.message);
      return NextResponse.json({ error: 'Database error: Could not save your booking.' }, { status: 500 });
    }
    console.log('[API] Booking inserted:', JSON.stringify(booking));
    await sendAirportPickupNotification({
      ...parsedData.data,
      bookingId: booking.id,
      total_price: totalPrice,
      notes: parsedData.data.notes || '',
      arrival_date: parsedData.data.arrival_date ? new Date(parsedData.data.arrival_date).toISOString() : undefined,
      departure_date: parsedData.data.departure_date ? new Date(parsedData.data.departure_date).toISOString() : undefined,
    });
    console.log('[API] Telegram notification sent');
    return NextResponse.json({ booking });
  } catch {
    console.log('[API] Unexpected error occurred');
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}

// GET: Return all airport pickup bookings
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ bookings: data });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch airport pickup bookings.' }, { status: 500 });
  }
} 
