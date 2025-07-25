// Admin API types
export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'viewer';

export type AdminPermission = 
  | 'read_bookings'
  | 'write_bookings'
  | 'delete_bookings'
  | 'read_tours'
  | 'write_tours'
  | 'delete_tours'
  | 'read_customers'
  | 'write_customers'
  | 'delete_customers'
  | 'read_drivers'
  | 'write_drivers'
  | 'delete_drivers'
  | 'read_finances'
  | 'write_finances'
  | 'read_content'
  | 'write_content'
  | 'delete_content'
  | 'read_settings'
  | 'write_settings';

export interface AdminStats {
  total_bookings: number;
  total_revenue: number;
  total_customers: number;
  total_tours: number;
  bookings_this_month: number;
  revenue_this_month: number;
  new_customers_this_month: number;
  popular_tours: PopularTour[];
  recent_bookings: RecentBooking[];
}

export interface PopularTour {
  tour_id: string;
  tour_name: string;
  booking_count: number;
  revenue: number;
}

export interface RecentBooking {
  id: string;
  customer_name: string;
  tour_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_info: VehicleInfo;
  availability: DriverAvailability;
  rating: number;
  total_trips: number;
  status: DriverStatus;
  created_at: string;
  updated_at: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  capacity: number;
}

export interface DriverAvailability {
  available_days: string[];
  available_hours: {
    start: string;
    end: string;
  };
  current_location?: {
    lat: number;
    lng: number;
  };
}

export type DriverStatus = 'available' | 'busy' | 'offline' | 'suspended';

export interface DriverAssignment {
  id: string;
  driver_id: string;
  booking_id: string;
  assignment_date: string;
  pickup_time: string;
  pickup_location: string;
  dropoff_location: string;
  status: AssignmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AssignmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface AdminResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AdminListResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  filters?: Record<string, unknown>;
}

export interface AdminFilters {
  date_range?: {
    start: string;
    end: string;
  };
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
} 