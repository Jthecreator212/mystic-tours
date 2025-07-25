# API Documentation

## Overview

The Mystic Tours API provides endpoints for managing tours, bookings, customers, and administrative functions. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://your-domain.com/api`

## Authentication

Most endpoints require authentication. Include the session token in cookies or use the admin session for administrative endpoints.

## Common Response Format

```typescript
interface ApiResponse<T> {
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
```

## Tours API

### Get All Tours

```http
GET /api/tours
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `difficulty` (optional): Filter by difficulty level
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter

**Response:**
```typescript
interface TourListResponse {
  success: boolean;
  data: Tour[];
  total: number;
  page: number;
  limit: number;
}
```

### Get Tour by Slug

```http
GET /api/tours/[slug]
```

**Response:**
```typescript
interface TourResponse {
  success: boolean;
  data: Tour;
}
```

### Create Tour (Admin)

```http
POST /api/admin/tours
```

**Request Body:**
```typescript
interface CreateTourRequest {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  duration: string;
  price: number;
  currency: string;
  max_passengers: number;
  min_passengers: number;
  category: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  included: string[];
  not_included: string[];
  itinerary: TourItinerary[];
  highlights: string[];
  requirements: string[];
  location: TourLocation;
  availability: TourAvailability;
}
```

## Bookings API

### Create Booking

```http
POST /api/bookings
```

**Request Body:**
```typescript
interface CreateBookingRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tour_id: string;
  passengers: number;
  tour_date: string;
  tour_time: string;
  notes?: string;
}
```

**Response:**
```typescript
interface BookingResponse {
  success: boolean;
  data: Booking;
  message: string;
}
```

### Get Bookings (Admin)

```http
GET /api/admin/bookings
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date

## Airport Pickup API

### Create Airport Pickup Booking

```http
POST /api/airport-pickup-bookings
```

**Request Body:**
```typescript
interface CreateAirportPickupRequest {
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
```

## Admin API

### Get Admin Stats

```http
GET /api/admin/stats
```

**Response:**
```typescript
interface AdminStatsResponse {
  success: boolean;
  data: {
    total_bookings: number;
    total_revenue: number;
    total_customers: number;
    total_tours: number;
    bookings_this_month: number;
    revenue_this_month: number;
    new_customers_this_month: number;
    popular_tours: PopularTour[];
    recent_bookings: RecentBooking[];
  };
}
```

### Get Drivers

```http
GET /api/admin/drivers
```

**Response:**
```typescript
interface DriverListResponse {
  success: boolean;
  data: Driver[];
  total: number;
  page: number;
  limit: number;
}
```

### Create Driver Assignment

```http
POST /api/admin/driver-assignments
```

**Request Body:**
```typescript
interface CreateDriverAssignmentRequest {
  driver_id: string;
  booking_id: string;
  assignment_date: string;
  pickup_time: string;
  pickup_location: string;
  dropoff_location: string;
  notes?: string;
}
```

## Content Management API

### Get Content

```http
GET /api/admin/content
```

**Query Parameters:**
- `type` (optional): Filter by content type
- `published` (optional): Filter by published status

### Update Content

```http
PUT /api/admin/content/[id]
```

**Request Body:**
```typescript
interface UpdateContentRequest {
  title?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  published?: boolean;
}
```

## Image Management API

### Upload Image

```http
POST /api/admin/images/upload
```

**Request:** Multipart form data with image file

**Response:**
```typescript
interface ImageUploadResponse {
  success: boolean;
  data: {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
  };
}
```

### Delete Image

```http
DELETE /api/admin/images/[id]
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a message explaining the issue:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Public endpoints:** 100 requests per minute
- **Admin endpoints:** 1000 requests per minute
- **Authentication endpoints:** 10 requests per minute

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (1-based)
- `limit`: Items per page (max 100)

Response includes pagination metadata:

```typescript
interface PaginatedResponse<T> {
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
```

## Webhooks

The API supports webhooks for real-time notifications:

### Booking Created Webhook

```http
POST /webhooks/booking-created
```

**Payload:**
```typescript
interface BookingWebhookPayload {
  event: 'booking.created';
  data: Booking;
  timestamp: string;
}
```

### Telegram Integration

All bookings automatically trigger Telegram notifications to the configured chat group.

## SDK Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@mystic-tours/sdk';

const client = createClient({
  baseUrl: 'https://api.mystictours.com',
  apiKey: 'your-api-key'
});

// Get tours
const tours = await client.tours.list({
  page: 1,
  limit: 10,
  category: 'adventure'
});

// Create booking
const booking = await client.bookings.create({
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  tour_id: 'tour-slug',
  passengers: 2,
  tour_date: '2024-12-25',
  tour_time: '09:00'
});
```

### cURL Examples

```bash
# Get all tours
curl -X GET "https://api.mystictours.com/api/tours" \
  -H "Content-Type: application/json"

# Create booking
curl -X POST "https://api.mystictours.com/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "tour_id": "tour-slug",
    "passengers": 2,
    "tour_date": "2024-12-25",
    "tour_time": "09:00"
  }'
```

## Support

For API support and questions:

- **Email:** api-support@mystictours.com
- **Documentation:** https://docs.mystictours.com/api
- **Status Page:** https://status.mystictours.com 