"use server"

import { formatNewsletterMessage, sendTelegramMessage } from "@/lib/notifications/telegram";
import { z } from "zod";

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
    try {
      const message = formatNewsletterMessage(parsedData.data);
      const notificationResult = await sendTelegramMessage(message);
      
      if (!notificationResult.success) {
        console.error("Telegram notification failed:", notificationResult.message);
      }
    } catch (telegramError) {
      console.error("Telegram notification failed:", telegramError);
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