// Shared Telegram notification utilities

// Type definitions for different notification types
export interface BookingNotificationData {
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

export interface ContactNotificationData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterNotificationData {
  email: string;
}

export interface AirportNotificationData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: string;
  flight_number: string;
  arrival_date?: string;
  arrival_time: string;
  dropoff_location: string;
  departure_flight_number?: string;
  departure_date?: string;
  departure_time?: string;
  pickup_location?: string;
  passengers: number;
  total_price: number;
  notes?: string;
}

// Shared Telegram sending function - to be used in server actions
export async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram bot token or chat ID is not configured in .env.local");
    return {
      success: false,
      message: "Telegram credentials not configured."
    };
  }

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

// Message formatters - keeping exact same formats as original
export function formatBookingMessage(data: BookingNotificationData): string {
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

export function formatContactMessage(data: ContactNotificationData): string {
  const subjectEmoji = {
    "Tour Inquiry": "🎫",
    "Booking Question": "❓", 
    "Custom Tour Request": "✨",
    "General Question": "💬"
  };

  const emoji = subjectEmoji[data.subject as keyof typeof subjectEmoji] || "📧";

  let message = `${emoji} *Contact Form Submission* 📝\n\n`;
  message += `A new message has been received through the contact form.\n\n`;

  message += `*📋 Message Details*\n`;
  message += `------------------------------------\n`;
  message += `${emoji} *Subject:* ${data.subject}\n`;
  message += `👤 *Name:* ${data.name}\n`;
  message += `✉️ *Email:* ${data.email}\n`;
  message += `------------------------------------\n\n`;

  message += `*💬 Message:*\n`;
  message += `\`\`\`\n${data.message}\n\`\`\`\n\n`;

  message += `*🚨 ACTION REQUIRED 🚨*\n`;
  message += `Please respond to the customer at *${data.email}*.\n\n`;

  message += `🤖 _Mystic Contact Bot_`;

  return message;
}

export function formatNewsletterMessage(data: NewsletterNotificationData): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `📧 *New Newsletter Subscription* 🌴\n\n`;
  message += `Someone just joined the Island Mystic Tours tribe!\n\n`;

  message += `*📋 Subscription Details*\n`;
  message += `------------------------------------\n`;
  message += `📧 *Email:* ${data.email}\n`;
  message += `📅 *Date:* ${currentDate}\n`;
  message += `📍 *Source:* Website Newsletter Form\n`;
  message += `------------------------------------\n\n`;

  message += `*📝 ACTIONS TO TAKE*\n`;
  message += `✅ Add email to newsletter list\n`;
  message += `✅ Send welcome email with travel tips\n`;
  message += `✅ Include in future tour promotions\n\n`;

  message += `*💡 Marketing Opportunity*\n`;
  message += `Consider following up with exclusive offers or upcoming tour announcements!\n\n`;

  message += `🤖 _Mystic Newsletter Bot_`;

  return message;
}

export function formatAirportPickupMessage(data: AirportNotificationData): string {
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