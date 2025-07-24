import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// --- Telegram Notification Logic ---
async function sendTelegramNotification(data: {
  bookingId: string;
  tourName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  numberOfGuests: number;
  totalAmount: number;
  specialRequests?: string;
  isAdminBooking?: boolean;
}) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID is not configured');
    return { success: false, message: 'Telegram credentials not configured.' };
  }
  const message = formatTelegramMessage(data);
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
  } catch (error) {
    console.error('Telegram notification error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function formatTelegramMessage(data: {
  bookingId: string;
  tourName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  numberOfGuests: number;
  totalAmount: number;
  specialRequests?: string;
  isAdminBooking?: boolean;
}): string {
  const formattedDate = new Date(data.bookingDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(data.totalAmount);
  let message = `🌴 *Mystic Tours - New Booking!* 🌴\n\n`;
  if (data.isAdminBooking) message += `📞 *ADMIN BOOKING* - Created by dispatch\n\n`;
  message += `A new booking has been requested. Please review the details below.\n\n`;
  message += `🎫 *Booking Details*\n`;
  message += `------------------------------------\n`;
  message += `🗺️ *Tour:* ${data.tourName}\n`;
  message += `🗓️ *Date:* ${formattedDate}\n`;
  message += `🧑‍🤝‍🧑 *Guests:* ${data.numberOfGuests}\n`;
  message += `💰 *Total Amount:* *${formattedAmount}*\n`;
  if (data.specialRequests) message += `📝 *Special Requests:* ${data.specialRequests}\n`;
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
// --- End Telegram Notification Logic ---

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 99);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log('[API] /api/admin/bookings POST called');
  const body = await req.json();
  console.log('[API] Received body:', JSON.stringify(body));
  // Basic validation (required fields)
  if (!body.tour_id || !body.customer_name || !body.customer_email || !body.booking_date || !body.number_of_people || !body.total_amount || !body.status) {
    console.log('[API] Validation failed');
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  // Remove id and special_requests from booking insert
  const { id, special_requests, ...bookingData } = body;
  const { data, error } = await supabaseAdmin.from('bookings').insert([bookingData]).select().single();
  if (error) {
    console.log('[API] DB insert error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log('[API] Booking inserted:', JSON.stringify(data));
  // If special_requests is present, insert into booking_special_requests
  if (special_requests && data && data.id) {
    await supabaseAdmin.from('booking_special_requests').upsert([
      {
        booking_id: data.id,
        special_request: special_requests,
        updated_at: new Date().toISOString(),
      },
    ]);
    console.log('[API] Special requests upserted');
  }
  // Send Telegram notification
  if (data && data.id) {
    const { data: tour } = await supabaseAdmin
      .from('tours')
      .select('title')
      .eq('id', body.tour_id)
      .single();
    console.log('[API] Sending Telegram notification...');
    await sendTelegramNotification({
      bookingId: data.id,
      tourName: tour?.title || 'Unknown Tour',
      customerName: data.customer_name,
      customerPhone: data.customer_phone || 'Not provided',
      customerEmail: data.customer_email,
      bookingDate: data.booking_date,
      numberOfGuests: data.number_of_people,
      totalAmount: data.total_amount,
      specialRequests: special_requests,
      isAdminBooking: true,
    });
    console.log('[API] Telegram notification sent');
  }
  return NextResponse.json({ booking: data });
} 