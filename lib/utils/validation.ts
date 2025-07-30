import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
  // Email validation
  email: z.string().email('Please enter a valid email address'),
  
  // Phone validation (international format)
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  
  // Name validation
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  
  // URL validation
  url: z.string().url('Please enter a valid URL'),
  
  // Date validation
  date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Please select a valid future date'),
  
  // Number validation
  positiveNumber: z.number().positive('Must be a positive number'),
  integer: z.number().int('Must be a whole number'),
  
  // Text validation
  text: z.string().min(1, 'This field is required'),
  optionalText: z.string().optional(),
  
  // UUID validation
  uuid: z.string().uuid('Invalid ID format'),
} as const;

// Tour booking validation schema
export const tourBookingSchema = z.object({
  tourId: commonSchemas.uuid,
  tourName: commonSchemas.text,
  date: commonSchemas.date,
  guests: z.coerce.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests'),
  name: commonSchemas.name,
  email: commonSchemas.email,
  phone: commonSchemas.phone,
  specialRequests: commonSchemas.optionalText,
});

// Airport pickup validation schema
export const airportPickupSchema = z.object({
  customerName: commonSchemas.name,
  customerEmail: commonSchemas.email,
  customerPhone: commonSchemas.phone,
  serviceType: z.enum(['Private Transfer', 'Shared Transfer', 'Luxury Transfer']),
  flightNumber: commonSchemas.optionalText,
  arrivalDate: commonSchemas.date,
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  dropoffLocation: commonSchemas.text,
  departureFlightNumber: commonSchemas.optionalText,
  departureDate: commonSchemas.date.optional(),
  departureTime: z.string().optional(),
  pickupLocation: commonSchemas.optionalText,
  passengers: z.coerce.number().min(1, 'At least 1 passenger required').max(10, 'Maximum 10 passengers'),
  notes: commonSchemas.optionalText,
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: commonSchemas.name,
  email: commonSchemas.email,
  subject: z.enum(['Tour Inquiry', 'Booking Question', 'Custom Tour Request', 'General Question']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

// Newsletter signup validation schema
export const newsletterSchema = z.object({
  email: commonSchemas.email,
});

// Admin authentication schema
export const adminAuthSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Image upload validation schema
export const imageUploadSchema = z.object({
  file: z.instanceof(File),
  bucket: z.string().min(1, 'Bucket is required'),
  path: z.string().min(1, 'Path is required'),
});

// Validation helper functions
export const validationUtils = {
  // Validate and sanitize input
  validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
  },

  // Get field-specific error message
  getFieldError(fieldName: string, errors: z.ZodError): string | undefined {
    const fieldError = errors.errors.find(error => error.path.includes(fieldName));
    return fieldError?.message;
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone format
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate date is in the future
  isFutureDate(date: string): boolean {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today;
  },

  // Sanitize text input
  sanitizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  },

  // Validate file size
  isValidFileSize(file: File, maxSizeMB: number): boolean {
    return file.size <= maxSizeMB * 1024 * 1024;
  },

  // Validate file type
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  },

  // Validate image dimensions
  async validateImageDimensions(file: File, maxWidth: number, maxHeight: number): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width <= maxWidth && img.height <= maxHeight);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  },

  // Validate analytics event data
  validateAnalyticsEvent(data: unknown): { success: true; data: AnalyticsEventData } | { success: false; message: string } {
    const result = analyticsEventSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { 
      success: false, 
      message: 'Invalid analytics event data. Please provide event, category, and action.' 
    };
  },

  // Validate analytics pageview data
  validateAnalyticsPageview(data: unknown): { success: true; data: AnalyticsPageviewData } | { success: false; message: string } {
    const result = analyticsPageviewSchema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { 
      success: false, 
      message: 'Invalid pageview data. Please provide a valid path.' 
    };
  },
};

// Analytics validation schemas
export const analyticsEventSchema = z.object({
  event: z.string().min(1, 'Event is required'),
  category: z.string().min(1, 'Category is required'),
  action: z.string().min(1, 'Action is required'),
  label: z.string().optional(),
  value: z.number().optional(),
  custom_parameters: z.record(z.unknown()).optional(),
  timestamp: z.string().optional(),
  user_agent: z.string().optional(),
  url: z.string().optional(),
});

export const analyticsPageviewSchema = z.object({
  path: z.string().min(1, 'Path is required'),
  title: z.string().optional(),
  timestamp: z.string().optional(),
  user_agent: z.string().optional(),
  referrer: z.string().optional(),
});

// Type exports for use in components
export type TourBookingData = z.infer<typeof tourBookingSchema>;
export type AirportPickupData = z.infer<typeof airportPickupSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
export type AdminAuthData = z.infer<typeof adminAuthSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;
export type AnalyticsEventData = z.infer<typeof analyticsEventSchema>;
export type AnalyticsPageviewData = z.infer<typeof analyticsPageviewSchema>; 