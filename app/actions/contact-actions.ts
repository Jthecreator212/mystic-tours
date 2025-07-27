"use server"

import { formatContactMessage, sendTelegramMessage } from "@/lib/notifications/telegram";
import { z } from "zod";

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
    try {
      const message = formatContactMessage(parsedData.data);
      const notificationResult = await sendTelegramMessage(message);
      
      if (!notificationResult.success) {
        console.error("Telegram notification failed:", notificationResult.message);
      }
    } catch (telegramError) {
      console.error("Telegram notification failed:", telegramError);
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