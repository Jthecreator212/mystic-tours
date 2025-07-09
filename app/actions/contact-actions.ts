"use server"

import { z } from "zod"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.enum(["Tour Inquiry", "Booking Question", "Custom Tour Request", "General Question"], {
    required_error: "Please select a subject"
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function submitContactForm(formData: z.infer<typeof contactFormSchema>) {
  try {
    console.log("📝 1. Contact Form Submission Started");
    console.log("Form data:", formData);

    // Validate the form data
    const parsedData = contactFormSchema.safeParse(formData);
    
    if (!parsedData.success) {
      console.error("❌ 2. Validation Failed:", parsedData.error.flatten().fieldErrors);
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: parsedData.error.flatten().fieldErrors,
      }
    }

    console.log("✅ 2. Form Validation Successful");

    // Send Telegram notification
    console.log("💬 3. Sending Telegram Notification...");
    const notificationResult = await sendContactNotification(parsedData.data);

    if (!notificationResult.success) {
      console.error("Telegram notification failed:", notificationResult.message);
    }

    return {
      success: true,
      message: "Thank you for your message! We'll get back to you as soon as possible.",
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}

interface ContactNotificationData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

async function sendContactNotification(data: ContactNotificationData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram bot token or chat ID is not configured in .env.local");
    return {
      success: false,
      message: "Telegram credentials not configured."
    };
  }

  const message = formatContactTelegramMessage(data);
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

function formatContactTelegramMessage(data: ContactNotificationData): string {
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