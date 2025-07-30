import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Test data validation schema
const testDataSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().min(10, 'Phone must be at least 10 characters'),
  service_type: z.enum(['pickup', 'dropoff', 'both']),
  flight_number: z.string().optional(),
  arrival_date: z.string().optional(),
  arrival_time: z.string().optional(),
  dropoff_location: z.string().optional(),
  departure_flight_number: z.string().optional(),
  departure_date: z.string().optional(),
  departure_time: z.string().optional(),
  pickup_location: z.string().optional(),
  passengers: z.number().min(1, 'At least 1 passenger required').max(10, 'Maximum 10 passengers'),
  notes: z.string().optional(),
});

function calculateTestPrice(serviceType: 'pickup' | 'dropoff' | 'both'): number {
  switch (serviceType) {
    case 'pickup':
    case 'dropoff':
      return 75.00;
    case 'both':
      return 140.00;
    default:
      return 0;
  }
}

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid JSON in request body',
        'Please check your request format'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid request format'),
        { status: 400 }
      );
    }
    
    // Validate input data
    const validationResult = testDataSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Test data validation failed:', validationResult.error.flatten().fieldErrors);
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid test data',
        'Please check all required fields'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid test data', validationResult.error.flatten().fieldErrors),
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    const totalPrice = calculateTestPrice(validatedData.service_type);
    
    // Create test booking data
    const testBooking = {
      customer_name: validatedData.customer_name,
      customer_email: validatedData.customer_email,
      customer_phone: validatedData.customer_phone,
      service_type: validatedData.service_type,
      flight_number: validatedData.flight_number || null,
      arrival_date: validatedData.arrival_date ? new Date(validatedData.arrival_date).toISOString() : null,
      arrival_time: validatedData.arrival_time || null,
      dropoff_location: validatedData.dropoff_location || null,
      departure_flight_number: validatedData.departure_flight_number || null,
      departure_date: validatedData.departure_date ? new Date(validatedData.departure_date).toISOString() : null,
      departure_time: validatedData.departure_time || null,
      pickup_location: validatedData.pickup_location || null,
      passengers: validatedData.passengers,
      total_price: totalPrice,
      status: 'pending',
      notes: validatedData.notes || null,
      is_test: true, // Mark as test booking
    };
    
    // For testing, we'll just return the calculated data without saving to database
    const testResult = {
      booking: testBooking,
      calculated_price: totalPrice,
      validation_passed: true,
      test_mode: true,
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json({ 
      success: true,
      test_result: testResult,
      message: 'Test airport pickup booking validated successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error in test airport pickup:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return test configuration and sample data
    const testConfig = {
      service_types: ['pickup', 'dropoff', 'both'],
      pricing: {
        pickup: 75.00,
        dropoff: 75.00,
        both: 140.00,
      },
      max_passengers: 10,
      required_fields: [
        'customer_name',
        'customer_email', 
        'customer_phone',
        'service_type',
        'passengers'
      ],
      optional_fields: [
        'flight_number',
        'arrival_date',
        'arrival_time',
        'dropoff_location',
        'departure_flight_number',
        'departure_date',
        'departure_time',
        'pickup_location',
        'notes'
      ],
      sample_data: {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        service_type: 'pickup',
        flight_number: 'AA123',
        arrival_date: '2024-02-15',
        arrival_time: '14:30',
        dropoff_location: 'Montego Bay Resort',
        passengers: 2,
        notes: 'Test booking'
      }
    };
    
    return NextResponse.json({ 
      success: true,
      test_config: testConfig,
      message: 'Test configuration retrieved successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error fetching test config:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 