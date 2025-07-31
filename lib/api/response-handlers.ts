import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

export class ApiResponseHandler {
  static success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data }, { status });
  }

  static error(message: string, status = 500, details?: unknown): NextResponse<ApiResponse> {
    return NextResponse.json(
      { success: false, error: message, ...(details && { details }) },
      { status }
    );
  }

  static validationError(validationResult: z.SafeParseError<unknown>): NextResponse<ApiResponse> {
    return this.error('Validation failed', 400, validationResult.error);
  }

  static databaseError(error: unknown, operation: string): NextResponse<ApiResponse> {
    console.error(`Database error during ${operation}:`, error);
    return this.error(`Failed to ${operation}`, 500);
  }

  static notFound(resource: string): NextResponse<ApiResponse> {
    return this.error(`${resource} not found`, 404);
  }

  static unauthorized(): NextResponse<ApiResponse> {
    return this.error('Unauthorized', 401);
  }

  static forbidden(): NextResponse<ApiResponse> {
    return this.error('Forbidden', 403);
  }

  static paginated<T>(
    data: T[],
    limit: number,
    offset: number,
    total: number
  ): NextResponse<ApiResponse<T[]>> {
    return NextResponse.json({
      success: true,
      data,
      pagination: { limit, offset, total }
    });
  }
}

export const apiHandler = {
  success: ApiResponseHandler.success,
  error: ApiResponseHandler.error,
  validationError: ApiResponseHandler.validationError,
  databaseError: ApiResponseHandler.databaseError,
  notFound: ApiResponseHandler.notFound,
  unauthorized: ApiResponseHandler.unauthorized,
  forbidden: ApiResponseHandler.forbidden,
  paginated: ApiResponseHandler.paginated,
}; 