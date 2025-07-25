// Booking API types
export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tour_id: string;
  tour_name: string;
  tour_slug: string;
  passengers: number;
  tour_date: string;
  tour_time: string;
  total_price: number;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AirportPickupBooking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: 'pickup' | 'dropoff' | 'both';
  flight_number: string;
  arrival_date: string;
  arrival_time: string;
  dropoff_location: string;
  departure_flight_number?: string;
  departure_date?: string;
  departure_time?: string;
  pickup_location?: string;
  passengers: number;
  notes?: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface BookingResponse {
  success: boolean;
  data?: Booking | AirportPickupBooking;
  error?: string;
  message?: string;
}

export interface BookingListResponse {
  success: boolean;
  data?: (Booking | AirportPickupBooking)[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface CreateBookingRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tour_id: string;
  passengers: number;
  tour_date: string;
  tour_time: string;
  notes?: string;
}

export interface CreateAirportPickupRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: 'pickup' | 'dropoff' | 'both';
  flight_number: string;
  arrival_date: string;
  arrival_time: string;
  dropoff_location: string;
  departure_flight_number?: string;
  departure_date?: string;
  departure_time?: string;
  pickup_location?: string;
  passengers: number;
  notes?: string;
} 