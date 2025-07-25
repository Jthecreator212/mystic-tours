// Common utility types used throughout the application

// Generic response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Filter types
export interface BaseFilters {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Form states
export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Modal/Dialog types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Toast notification types
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// File upload types
export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Image types
export interface ImageData {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

// Location types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  country?: string;
}

// Date range types
export interface DateRange {
  start: Date;
  end: Date;
}

// Currency types
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate?: number; // Exchange rate to base currency
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Language types
export type Language = 'en' | 'es' | 'fr';

// Device types
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Breakpoint types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'none';

// Validation types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

// Permission types
export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'moderate'
  | 'view';

// Role types
export type Role = 
  | 'user'
  | 'admin'
  | 'moderator'
  | 'guest'
  | 'super_admin';

// Status types
export type Status = 
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'published';

// Priority types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Sort order types
export type SortOrder = 'asc' | 'desc';

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Content type types
export type ContentType = 'text' | 'html' | 'markdown' | 'json' | 'xml';

// MIME type types
export type MimeType = 
  | 'text/plain'
  | 'text/html'
  | 'text/markdown'
  | 'application/json'
  | 'application/xml'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'video/mp4'
  | 'audio/mpeg'; 