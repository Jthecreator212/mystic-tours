import { supabaseAdmin } from '@/lib/supabase';

import { NextResponse } from 'next/server';
import { z } from 'zod';

// Booking validation schema
const bookingSchema = z.object({
  tour_id: z.string().uuid('Invalid tour ID'),
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().min(10, 'Phone must be at least 10 characters'),
  booking_date: z.string().min(1, 'Booking date is required'),
  number_of_people: z.number().min(1, 'At least 1 person required').max(20, 'Maximum 20 people'),
  total_amount: z.number().positive('Total amount must be positive'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  special_requests: z.string().optional(),
});

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
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.error('Telegram bot token or chat ID is not configured');
      return { success: false, message: 'Telegram credentials not configured.' };
    }
    
    const message = formatTelegramMessage(data);
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
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
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
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

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 99);

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 503 }
      );
    }

    return NextResponse.json({ 
      success: true,
      bookings: data || [],
      message: 'Bookings retrieved successfully'
    });
            } catch {
        return NextResponse.json(
          { success: false, error: 'Unexpected error occurred' },
          { status: 500 }
        );
      }
}

export async function POST(req: Request) {
  try {
    console.log('[API] /api/admin/bookings POST called');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    console.log('[API] Received body:', JSON.stringify(body));
    
    // Validate input data
    const validationResult = bookingSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('[API] Validation failed:', JSON.stringify(validationResult.error.flatten().fieldErrors));
      return NextResponse.json(
        { success: false, error: 'Invalid booking data', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Extract special_requests from booking insert
    const { special_requests, ...bookingData } = validatedData;
    
    // Insert booking into database
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();
      
    if (bookingError) {
      console.log('[API] DB insert error:', bookingError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to create booking' },
        { status: 503 }
      );
    }
    
    console.log('[API] Booking inserted:', JSON.stringify(booking));
    
    // Handle special requests if present
    if (special_requests && booking && booking.id) {
      const { error: specialRequestError } = await supabaseAdmin
        .from('booking_special_requests')
        .upsert([
          {
            booking_id: booking.id,
            special_request: special_requests,
            updated_at: new Date().toISOString(),
          },
        ]);
        
      if (specialRequestError) {
        console.error('[API] Special requests upsert error:', specialRequestError);
        // Don't fail the booking if special requests fail
      } else {
        console.log('[API] Special requests upserted');
      }
    }
    
    // Send Telegram notification
    if (booking && booking.id) {
      try {
        const { data: tour } = await supabaseAdmin
          .from('tours')
          .select('title')
          .eq('id', validatedData.tour_id)
          .single();
          
        console.log('[API] Sending Telegram notification...');
        await sendTelegramNotification({
          bookingId: booking.id,
          tourName: tour?.title || 'Unknown Tour',
          customerName: booking.customer_name,
          customerPhone: booking.customer_phone || 'Not provided',
          customerEmail: booking.customer_email,
          bookingDate: booking.booking_date,
          numberOfGuests: booking.number_of_people,
          totalAmount: booking.total_amount,
          specialRequests: special_requests,
          isAdminBooking: true,
        });
        console.log('[API] Telegram notification sent');
      } catch (notificationError) {
        console.error('[API] Telegram notification failed:', notificationError);
        // Don't fail the booking if Telegram fails
      }
    }
    
    return NextResponse.json({ 
      success: true,
      booking: booking,
      message: 'Booking created successfully'
    });
    
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
} 