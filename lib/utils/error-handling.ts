// Comprehensive error handling utilities
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  userFriendly?: boolean;
}

export interface ErrorResponse {
  success: false;
  error: AppError;
  rateLimited?: boolean;
}

// Error codes for consistent error handling
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Database errors
  DB_CONNECTION: 'DB_CONNECTION',
  DB_QUERY: 'DB_QUERY',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  DB_CONSTRAINT: 'DB_CONSTRAINT',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // File/Image errors
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  IMAGE_PROCESSING_FAILED: 'IMAGE_PROCESSING_FAILED',
  
  // Business logic errors
  BOOKING_FAILED: 'BOOKING_FAILED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  TOUR_NOT_AVAILABLE: 'TOUR_NOT_AVAILABLE',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// User-friendly error messages
export const USER_FRIENDLY_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Please log in to continue.',
  [ERROR_CODES.AUTH_INVALID]: 'Invalid login credentials.',
  [ERROR_CODES.AUTH_EXPIRED]: 'Your session has expired. Please log in again.',
  
  [ERROR_CODES.DB_CONNECTION]: 'Unable to connect to our servers. Please try again.',
  [ERROR_CODES.DB_QUERY]: 'There was an issue processing your request.',
  [ERROR_CODES.DB_NOT_FOUND]: 'The requested information was not found.',
  [ERROR_CODES.DB_CONSTRAINT]: 'The information provided conflicts with our records.',
  
  [ERROR_CODES.VALIDATION_FAILED]: 'Please check your information and try again.',
  [ERROR_CODES.INVALID_INPUT]: 'Please provide valid information.',
  
  [ERROR_CODES.RATE_LIMITED]: 'Too many attempts. Please wait a moment and try again.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection issue. Please check your internet and try again.',
  [ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
  
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'Failed to upload file. Please try again.',
  [ERROR_CODES.IMAGE_PROCESSING_FAILED]: 'Failed to process image. Please try a different image.',
  
  [ERROR_CODES.BOOKING_FAILED]: 'Unable to complete booking. Please try again.',
  [ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed. Please try again.',
  [ERROR_CODES.TOUR_NOT_AVAILABLE]: 'This tour is not available for the selected date.',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_CODES.INTERNAL_ERROR]: 'We\'re experiencing technical difficulties. Please try again later.',
} as const;

// Create standardized error
export function createAppError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: unknown,
  userFriendly = true
): AppError {
  return {
    code: ERROR_CODES[code],
    message: message || USER_FRIENDLY_MESSAGES[code] || 'An error occurred.',
    details,
    timestamp: new Date().toISOString(),
    userFriendly,
  };
}

// Create error response for API routes
export function createErrorResponse(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: unknown,
  rateLimited = false
): ErrorResponse {
  return {
    success: false,
    error: createAppError(code, message, details),
    rateLimited,
  };
}

// Handle and log errors consistently
export function handleError(
  error: unknown,
  context: string,
  code: keyof typeof ERROR_CODES = 'UNKNOWN_ERROR'
): AppError {
  const appError = createAppError(code);
  
  // Log error with context
  console.error(`[${context}] Error:`, {
    code: appError.code,
    message: appError.message,
    originalError: error,
    timestamp: appError.timestamp,
    context,
  });
  
  return appError;
}

// Validate error is AppError
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  );
}

// Convert unknown error to AppError
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return createAppError('UNKNOWN_ERROR', error.message, error.stack);
  }
  
  return createAppError('UNKNOWN_ERROR', String(error));
}

// Error boundary helper
export function getErrorDisplayInfo(error: AppError) {
  return {
    title: 'Something went wrong',
    message: error.userFriendly ? error.message : 'An unexpected error occurred.',
    showDetails: process.env.NODE_ENV === 'development',
    details: error.details,
  };
} 