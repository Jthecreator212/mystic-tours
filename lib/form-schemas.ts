import * as z from "zod"

// Helper function to validate dates
const validateDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (date < today) {
    return false;
  }
  if (date > oneYearFromNow) {
    return false;
  }
  return true;
};

const baseSchema = z.object({
  customer_name: z.string().min(1, "Your name is required."),
  customer_email: z.string().min(1, "Your email is required.").email("Invalid email address."),
  customer_phone: z.string().optional(),
  passengers: z.coerce
    .number()
    .min(1, "At least 1 passenger is required.")
    .max(10, "Maximum 10 passengers per booking."),
});

const dateSchema = z.coerce
  .date()
  .refine((date) => validateDate(date), {
    message: "Date must be between tomorrow and one year from now.",
  });

const pickupSchema = baseSchema.extend({
  service_type: z.literal("pickup"),
  flight_number: z.string().min(1, "Arrival flight number is required for airport pickup."),
  arrival_date: dateSchema,
  arrival_time: z.string().min(1, "Arrival time is required for airport pickup."),
  dropoff_location: z.string().min(1, "Drop-off location is required for airport pickup."),
  // Optional departure fields
  departure_flight_number: z.string().optional(),
  departure_date: z.coerce.date().optional(),
  departure_time: z.string().optional(),
  pickup_location: z.string().optional(),
});

const dropoffSchema = baseSchema.extend({
  service_type: z.literal("dropoff"),
  departure_flight_number: z.string().min(1, "Departure flight number is required for airport drop-off."),
  departure_date: dateSchema,
  departure_time: z.string().min(1, "Departure time is required for airport drop-off."),
  pickup_location: z.string().min(1, "Pickup location is required for airport drop-off."),
  // Optional arrival fields
  flight_number: z.string().optional(),
  arrival_date: z.coerce.date().optional(),
  arrival_time: z.string().optional(),
  dropoff_location: z.string().optional(),
});

const roundTripSchema = baseSchema.extend({
  service_type: z.literal("both"),
  flight_number: z.string().min(1, "Arrival flight number is required for round trip."),
  arrival_date: dateSchema,
  arrival_time: z.string().min(1, "Arrival time is required for round trip."),
  dropoff_location: z.string().min(1, "Drop-off location is required for round trip."),
  departure_flight_number: z.string().min(1, "Departure flight number is required for round trip."),
  departure_date: dateSchema,
  departure_time: z.string().min(1, "Departure time is required for round trip."),
  pickup_location: z.string().min(1, "Pickup location is required for round trip."),
});

export const airportPickupSchema = z.discriminatedUnion("service_type", [
  pickupSchema,
  dropoffSchema,
  roundTripSchema,
]); 