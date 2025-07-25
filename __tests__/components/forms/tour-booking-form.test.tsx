import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourBookingForm } from '@/components/forms/tour-booking-form';

// Mock the server action
jest.mock('@/app/actions/booking-actions', () => ({
  createTourBooking: jest.fn(),
}));

// Mock the tour data
const mockTour = {
  id: 'test-tour-id',
  name: 'Test Tour',
  slug: 'test-tour',
  price: 100,
  currency: 'USD',
  max_passengers: 10,
  min_passengers: 1,
};

describe('TourBookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with tour information', () => {
    render(<TourBookingForm tour={mockTour} />);
    
    expect(screen.getByText('Book Test Tour')).toBeInTheDocument();
    expect(screen.getByText('$100 USD per person')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of passengers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tour date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tour time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<TourBookingForm tour={mockTour} />);
    
    const submitButton = screen.getByRole('button', { name: /book tour/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 1 passenger is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<TourBookingForm tour={mockTour} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /book tour/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('validates passenger count', async () => {
    const user = userEvent.setup();
    render(<TourBookingForm tour={mockTour} />);
    
    const passengersInput = screen.getByLabelText(/number of passengers/i);
    await user.clear(passengersInput);
    await user.type(passengersInput, '15'); // More than max_passengers
    
    const submitButton = screen.getByRole('button', { name: /book tour/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/maximum 10 passengers per booking/i)).toBeInTheDocument();
    });
  });

  it('calculates total price correctly', async () => {
    const user = userEvent.setup();
    render(<TourBookingForm tour={mockTour} />);
    
    const passengersInput = screen.getByLabelText(/number of passengers/i);
    await user.clear(passengersInput);
    await user.type(passengersInput, '3');
    
    // Total should be 3 * $100 = $300
    expect(screen.getByText('Total: $300 USD')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockCreateBooking = jest.fn().mockResolvedValue({ success: true });
    
    // Mock the server action
    const { createTourBooking } = require('@/app/actions/booking-actions');
    createTourBooking.mockImplementation(mockCreateBooking);
    
    render(<TourBookingForm tour={mockTour} />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '1234567890');
    await user.clear(screen.getByLabelText(/number of passengers/i));
    await user.type(screen.getByLabelText(/number of passengers/i), '2');
    await user.type(screen.getByLabelText(/tour date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/tour time/i), '09:00');
    await user.type(screen.getByLabelText(/notes/i), 'Special request');
    
    const submitButton = screen.getByRole('button', { name: /book tour/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith({
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        tour_id: 'test-tour-id',
        passengers: 2,
        tour_date: '2024-12-25',
        tour_time: '09:00',
        notes: 'Special request',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const mockCreateBooking = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const { createTourBooking } = require('@/app/actions/booking-actions');
    createTourBooking.mockImplementation(mockCreateBooking);
    
    render(<TourBookingForm tour={mockTour} />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.clear(screen.getByLabelText(/number of passengers/i));
    await user.type(screen.getByLabelText(/number of passengers/i), '2');
    await user.type(screen.getByLabelText(/tour date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/tour time/i), '09:00');
    
    const submitButton = screen.getByRole('button', { name: /book tour/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/booking tour/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles submission errors', async () => {
    const user = userEvent.setup();
    const mockCreateBooking = jest.fn().mockRejectedValue(new Error('Booking failed'));
    
    const { createTourBooking } = require('@/app/actions/booking-actions');
    createTourBooking.mockImplementation(mockCreateBooking);
    
    render(<TourBookingForm tour={mockTour} />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.clear(screen.getByLabelText(/number of passengers/i));
    await user.type(screen.getByLabelText(/number of passengers/i), '2');
    await user.type(screen.getByLabelText(/tour date/i), '2024-12-25');
    await user.type(screen.getByLabelText(/tour time/i), '09:00');
    
    const submitButton = screen.getByRole('button', { name: /book tour/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
}); 