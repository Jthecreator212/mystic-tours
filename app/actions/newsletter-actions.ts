"use server"

import { z } from "zod"

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export async function subscribeToNewsletter(formData: z.infer<typeof newsletterSchema>) {
  try {
    console.log("📧 1. Newsletter Subscription Started");
    console.log("Email:", formData.email);

    // Validate the email
    const parsedData = newsletterSchema.safeParse(formData);
    
    if (!parsedData.success) {
      console.error("❌ 2. Validation Failed:", parsedData.error.flatten().fieldErrors);
      return {
        success: false,
        message: "Please enter a valid email address.",
        errors: parsedData.error.flatten().fieldErrors,
      }
    }

    console.log("✅ 2. Email Validation Successful");

    // Send Telegram notification
    console.log("💬 3. Sending Telegram Notification...");
    const notificationResult = await sendNewsletterNotification(parsedData.data);

    if (!notificationResult.success) {
      console.error("Telegram notification failed:", notificationResult.message);
    }

    return {
      success: true,
      message: "Thank you for subscribing! Welcome to the Island Mystic Tours tribe! 🌴",
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}

interface NewsletterNotificationData {
  email: string;
}

async function sendNewsletterNotification(data: NewsletterNotificationData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram bot token or chat ID is not configured in .env.local");
    return {
      success: false,
      message: "Telegram credentials not configured."
    };
  }

  const message = formatNewsletterTelegramMessage(data);
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

    const result = await response.json();

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

function formatNewsletterTelegramMessage(data: NewsletterNotificationData): string {
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