"use client";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Calendar, Plane, UserCheck } from "lucide-react";
import { tourData } from "@/data/tours";

interface Driver {
  id: string;
  name: string;
  status: string;
}

export interface TourBooking {
  id: string;
  tour_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  booking_date: string;
  number_of_people: number;
  total_amount: number;
  status: string;
  created_at: string;
  special_requests?: string;
}

export interface AirportPickupBooking {
  id: number; // keep for legacy, but don't use for lookups
  uuid: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: "pickup" | "dropoff" | "both";
  flight_number?: string;
  arrival_date?: string;
  arrival_time?: string;
  dropoff_location?: string;
  departure_flight_number?: string;
  departure_date?: string;
  departure_time?: string;
  pickup_location?: string;
  passengers: number;
  total_price: number;
  status: string;
  created_at: string;
  notes?: string;
}

type BookingType = "tour" | "airport";

export type AdminBooking = (TourBooking & { type: 'tour' }) | (AirportPickupBooking & { type: 'airport' });

function EditBookingModal({ booking, open, onClose, onSave }: { booking: TourBooking | null; open: boolean; onClose: () => void; onSave: (updated: TourBooking) => void }) {
  const [form, setForm] = useState<TourBooking | null>(booking);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(booking);
    setError(null);
  }, [booking, open]);

  if (!open || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: name === 'number_of_people' ? Number(value) : value } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          booking_date: form.booking_date,
          number_of_people: form.number_of_people,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (data.booking) {
        onSave(data.booking);
        onClose();
      } else {
        setError(data.error || 'Update failed.');
      }
    } catch {
      setError('Update failed.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4 text-[#388e3c]">Edit Booking</h2>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Name</label>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Email</label>
          <input name="customer_email" value={form.customer_email} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Phone</label>
          <input name="customer_phone" value={form.customer_phone || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Date</label>
          <input name="booking_date" type="date" value={form.booking_date} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Guests</label>
          <input name="number_of_people" type="number" min={1} max={20} value={form.number_of_people} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-4">
          <label className="block text-[#85603f] mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button type="button" className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

function EditAirportPickupBookingModal({ booking, open, onClose, onSave }: { booking: AirportPickupBooking | null; open: boolean; onClose: () => void; onSave: (updated: AirportPickupBooking) => void }) {
  const [form, setForm] = useState<AirportPickupBooking | null>(booking);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(booking);
    setError(null);
  }, [booking, open]);

  if (!open || !form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: name === 'passengers' ? Number(value) : value } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Build payload with only required fields for the selected service_type
    const payload: Record<string, unknown> = {
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      service_type: form.service_type,
      passengers: form.passengers,
      status: form.status,
    };
    // Always include notes if present
    if (form.notes !== undefined && form.notes !== null && form.notes !== '') {
      payload.notes = String(form.notes);
    }

    if (form.service_type === 'pickup' || form.service_type === 'both') {
      payload.flight_number = form.flight_number;
      payload.arrival_date = form.arrival_date ? form.arrival_date.slice(0, 10) : undefined;
      payload.arrival_time = form.arrival_time;
      payload.dropoff_location = form.dropoff_location;
    }
    if (form.service_type === 'dropoff' || form.service_type === 'both') {
      payload.departure_flight_number = form.departure_flight_number;
      payload.departure_date = form.departure_date ? form.departure_date.slice(0, 10) : undefined;
      payload.departure_time = form.departure_time;
      payload.pickup_location = form.pickup_location;
    }

    try {
      const res = await fetch(`/api/admin/airport-pickup-bookings/${form.uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.booking) {
        onSave(data.booking);
        onClose();
      } else {
        setError(data.error || (data.details && JSON.stringify(data.details)) || 'Update failed.');
      }
    } catch {
      setError('Update failed.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-[#388e3c]">Edit Airport Pickup</h2>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Name</label>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Email</label>
          <input name="customer_email" value={form.customer_email} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Phone</label>
          <input name="customer_phone" value={form.customer_phone || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Service Type</label>
          <select name="service_type" value={form.service_type} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="pickup">Pickup</option>
            <option value="dropoff">Dropoff</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Passengers</label>
          <input name="passengers" type="number" min={1} max={10} value={form.passengers} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
        </div>
        {(form.service_type === 'pickup' || form.service_type === 'both') && (
          <>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Flight Number (Arrival)</label>
              <input name="flight_number" value={form.flight_number || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Arrival Date</label>
              <input name="arrival_date" type="date" value={form.arrival_date ? form.arrival_date.slice(0,10) : ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Arrival Time</label>
              <input name="arrival_time" type="time" value={form.arrival_time || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Drop-off Location</label>
              <input name="dropoff_location" value={form.dropoff_location || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
          </>
        )}
        {(form.service_type === 'dropoff' || form.service_type === 'both') && (
          <>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Flight Number (Departure)</label>
              <input name="departure_flight_number" value={form.departure_flight_number || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Departure Date</label>
              <input name="departure_date" type="date" value={form.departure_date ? form.departure_date.slice(0,10) : ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Departure Time</label>
              <input name="departure_time" type="time" value={form.departure_time || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="mb-2">
              <label className="block text-[#85603f] mb-1">Pickup Location</label>
              <input name="pickup_location" value={form.pickup_location || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
          </>
        )}
        <div className="mb-2">
          <label className="block text-[#85603f] mb-1">Notes</label>
          <textarea name="notes" value={form.notes || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" rows={2} />
        </div>
        <div className="mb-4">
          <label className="block text-[#85603f] mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button type="button" className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

function CreateBookingModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (booking: Record<string, unknown>) => void }) {
  const [formType, setFormType] = useState<BookingType>("tour");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tour booking form state
  const [tourForm, setTourForm] = useState({
    tour_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    booking_date: "",
    number_of_people: 1,
    special_requests: "",
    status: "pending"
  });

  // Airport pickup form state
  const [airportForm, setAirportForm] = useState<{
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    service_type: "pickup" | "dropoff" | "both";
    flight_number: string;
    arrival_date: string;
    arrival_time: string;
    dropoff_location: string;
    departure_flight_number: string;
    departure_date: string;
    departure_time: string;
    pickup_location: string;
    passengers: number;
    status: string;
    notes: string;
  }>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_type: "pickup",
    flight_number: "",
    arrival_date: "",
    arrival_time: "14:00",
    dropoff_location: "",
    departure_flight_number: "",
    departure_date: "",
    departure_time: "10:00",
    pickup_location: "",
    passengers: 1,
    status: "pending",
    notes: ""
  });

  const handleTourChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTourForm(prev => ({ ...prev, [name]: name === 'number_of_people' ? Number(value) : value }));
  };

  const handleAirportChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAirportForm(prev => ({ ...prev, [name]: name === 'passengers' ? Number(value) : value }));
  };

  const calculateTourPrice = () => {
    const tour = tourData.find(t => t.id.toString() === tourForm.tour_id);
    return tour ? tour.price * tourForm.number_of_people : 0;
  };

  const calculateAirportPrice = () => {
    switch (airportForm.service_type) {
      case "pickup":
      case "dropoff":
        return 75;
      case "both":
        return 140;
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; // Prevent double submit
    setSaving(true);
    setError(null);
    try {
      let endpoint = "";
      let data = {};
      switch (formType) {
        case "tour":
          endpoint = "/api/admin/bookings";
          data = {
            ...tourForm,
            total_amount: calculateTourPrice()
          };
          break;
        case "airport":
          endpoint = "/api/admin/airport-pickup-bookings";
          const { arrival_date, departure_date, ...restAirportForm } = airportForm;
          data = {
            ...restAirportForm,
            total_price: calculateAirportPrice(),
            arrival_date: arrival_date ? arrival_date : null,
            departure_date: departure_date ? departure_date : null,
          };
          break;
      }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.booking) {
        onSave(result.booking);
        onClose();
        // Reset forms
        setTourForm({
          tour_id: "",
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          booking_date: "",
          number_of_people: 1,
          special_requests: "",
          status: "pending"
        });
        setAirportForm({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          service_type: "pickup",
          flight_number: "",
          arrival_date: "",
          arrival_time: "14:00",
          dropoff_location: "",
          departure_flight_number: "",
          departure_date: "",
          departure_time: "10:00",
          pickup_location: "",
          passengers: 1,
          status: "pending",
          notes: ""
        });
      } else {
        setError(result.error || 'Creation failed.');
      }
    } catch {
      setError('Creation failed.');
    }
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-[#388e3c]">Create New Booking</h2>
        
        {/* Form Type Selector - Only Tour and Airport */}
        <div className="mb-6">
          <label className="block text-[#85603f] mb-2 font-semibold">Booking Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormType("tour")}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formType === "tour" 
                  ? "border-[#388e3c] bg-[#388e3c] text-white" 
                  : "border-[#85603f] text-[#85603f] hover:bg-[#f8ede3]"
              }`}
            >
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Tour Booking</span>
            </button>
            <button
              type="button"
              onClick={() => setFormType("airport")}
              className={`p-4 rounded-lg border-2 text-center transition ${
                formType === "airport" 
                  ? "border-[#388e3c] bg-[#388e3c] text-white" 
                  : "border-[#85603f] text-[#85603f] hover:bg-[#f8ede3]"
              }`}
            >
              <Plane className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Airport Transfer</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formType === "tour" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#85603f] mb-1">Tour <span className="text-red-500">*</span></label>
                  <select
                    name="tour_id"
                    value={tourForm.tour_id}
                    onChange={handleTourChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  >
                    <option value="">Select a tour</option>
                    {tourData.map(tour => (
                      <option key={tour.id} value={tour.id}>
                        {tour.title} - ${tour.price}
                        {/* TODO: Use tour.uuid as value when available */}
                      </option>
                    ))}
                  </select>
                  {tourForm.tour_id && tourForm.tour_id.length !== 36 && (
                    <div className="text-red-600 text-xs mt-1">Warning: This tour ID is not a valid UUID. Please update tourData to use UUIDs.</div>
                  )}
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Booking Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="booking_date"
                    value={tourForm.booking_date}
                    onChange={handleTourChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Customer Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="customer_name"
                    value={tourForm.customer_name}
                    onChange={handleTourChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="customer_email"
                    value={tourForm.customer_email}
                    onChange={handleTourChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Phone</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={tourForm.customer_phone}
                    onChange={handleTourChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                  />
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Number of Guests <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="number_of_people"
                    min="1"
                    max="20"
                    value={tourForm.number_of_people}
                    onChange={handleTourChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#85603f] mb-1">Special Requests</label>
                <textarea
                  name="special_requests"
                  value={tourForm.special_requests}
                  onChange={handleTourChange}
                  rows={3}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                  placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                />
              </div>
              {tourForm.tour_id && (
                <div className="bg-[#f8ede3] p-3 rounded">
                  <p className="text-[#85603f] font-semibold">
                    Total Amount: ${calculateTourPrice().toFixed(2)}
                  </p>
                </div>
              )}
            </>
          )}

          {formType === "airport" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#85603f] mb-1">Service Type <span className="text-red-500">*</span></label>
                  <select
                    name="service_type"
                    value={airportForm.service_type}
                    onChange={handleAirportChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  >
                    <option value="pickup">Airport Pickup ($75)</option>
                    <option value="dropoff">Airport Drop-off ($75)</option>
                    <option value="both">Round Trip ($140)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Passengers <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="passengers"
                    min="1"
                    max="10"
                    value={airportForm.passengers}
                    onChange={handleAirportChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Customer Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="customer_name"
                    value={airportForm.customer_name}
                    onChange={handleAirportChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="customer_email"
                    value={airportForm.customer_email}
                    onChange={handleAirportChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#85603f] mb-1">Phone</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={airportForm.customer_phone}
                    onChange={handleAirportChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                  />
                </div>
              </div>

              {/* Service-specific fields */}
              {(airportForm.service_type === "pickup" || airportForm.service_type === "both") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <h3 className="col-span-2 text-[#388e3c] font-semibold">Arrival Details</h3>
                  <div>
                    <label className="block text-[#85603f] mb-1">Flight Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="flight_number"
                      value={airportForm.flight_number}
                      onChange={handleAirportChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#85603f] mb-1">Arrival Date</label>
                    <input
                      type="date"
                      name="arrival_date"
                      value={airportForm.arrival_date}
                      onChange={handleAirportChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#85603f] mb-1">Arrival Time</label>
                    <input
                      type="time"
                      name="arrival_time"
                      value={airportForm.arrival_time}
                      onChange={handleAirportChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#85603f] mb-1">Drop-off Location</label>
                    <input
                      type="text"
                      name="dropoff_location"
                      value={airportForm.dropoff_location}
                      onChange={handleAirportChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      placeholder="e.g., Hotel, Resort, Address"
                      required
                    />
                  </div>
                </div>
              )}

              {(airportForm.service_type === "dropoff" || airportForm.service_type === "both") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <h3 className="col-span-2 text-[#388e3c] font-semibold">Departure Details</h3>
                  <div>
                    <label className="block text-[#85603f] mb-1">Flight Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="departure_flight_number"
                      value={airportForm.departure_flight_number}
                      onChange={handleAirportChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#85603f] mb-1">Departure Date</label>
                    <input
                      type="date"
                      name="departure_date"
                      value={airportForm.departure_date}
                      onChange={handleAirportChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#85603f] mb-1">Departure Time</label>
                    <input
                      type="time"
                      name="departure_time"
                      value={airportForm.departure_time}
                      onChange={handleAirportChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#85603f] mb-1">Pickup Location <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="pickup_location"
                      value={airportForm.pickup_location}
                      onChange={handleAirportChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#388e3c]"
                      placeholder="e.g., Hotel, Resort, Address"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="notes" className="block text-[#85603f] font-semibold mb-1">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={airportForm.notes}
                  onChange={handleAirportChange}
                  placeholder="Add any notes for this booking (optional)"
                />
              </div>

              <div className="bg-[#f8ede3] p-3 rounded">
                <p className="text-[#85603f] font-semibold">
                  Total Amount: ${calculateAirportPrice().toFixed(2)}
                </p>
              </div>
            </>
          )}

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
          
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add driver assignment modal
function AssignDriverModal({ booking, open, onClose, onAssigned }: { booking: AdminBooking | null; open: boolean; onClose: () => void; onAssigned: (updated: AdminBooking, driver: Driver) => void }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/admin/drivers')
        .then(res => res.json())
        .then(data => {
          setDrivers(data.drivers || []);
          setLoading(false);
        })
        .catch(() => {
          setDrivers([]);
          setLoading(false);
        });
      setSelectedDriver('');
      setError(null);
    }
  }, [open]);

  if (!open || !booking) return null;

  // Render booking details based on type
  let bookingDetails = null;
  if (booking.type === 'tour') {
    bookingDetails = (
      <>
        <div className="text-[#85603f] font-semibold">Tour ID: <span className="text-[#388e3c]">{booking.tour_id}</span></div>
        <div className="text-[#85603f]">Customer: {booking.customer_name}</div>
        <div className="text-[#85603f]">Date: {booking.booking_date}</div>
      </>
    );
  } else if (booking.type === 'airport') {
    bookingDetails = (
      <>
        <div className="text-[#85603f] font-semibold">Service: <span className="text-[#388e3c]">{booking.service_type}</span></div>
        <div className="text-[#85603f]">Customer: {booking.customer_name}</div>
        <div className="text-[#85603f]">Arrival: {booking.arrival_date || '-'}</div>
        <div className="text-[#85603f]">Departure: {booking.departure_date || '-'}</div>
      </>
    );
  }

  const handleAssign = async () => {
    if (!selectedDriver) {
      setError('Please select a driver.');
      return;
    }
    setAssigning(true);
    setError(null);
    try {
      // Use id for tour, uuid for airport
      const booking_id = booking.type === 'airport'
        ? (booking as AirportPickupBooking).uuid
        : (booking as TourBooking).id;

      const res = await fetch('/api/admin/driver-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, driver_id: selectedDriver }),
      });
      const data = await res.json();
      if (data.booking && data.assignment) {
        onAssigned(data.booking, data.assignment);
        onClose();
      } else {
        setError(data.error || 'Assignment failed.');
      }
    } catch {
      setError('Assignment failed.');
    }
    setAssigning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4 text-[#388e3c]">Assign Driver & Confirm</h2>
        <div className="mb-2">{bookingDetails}</div>
        <div className="mb-4">
          <label className="block text-[#85603f] mb-1">Select Driver</label>
          {loading ? (
            <div className="text-[#388e3c]">Loading drivers...</div>
          ) : (
            <select
              className="w-full border rounded px-2 py-2"
              value={selectedDriver}
              onChange={e => setSelectedDriver(e.target.value)}
            >
              <option value="">Select a driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
              ))}
            </select>
          )}
        </div>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button type="button" className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]" onClick={onClose} disabled={assigning}>Cancel</button>
          <button type="button" className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]" onClick={handleAssign} disabled={assigning}>{assigning ? 'Assigning...' : 'Assign & Confirm'}</button>
        </div>
      </div>
    </div>
  );
}

function BookingsTable() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editBooking, setEditBooking] = useState<AdminBooking | null>(null);
  const [creating, setCreating] = useState(false);
  const [assigningBooking, setAssigningBooking] = useState<AdminBooking | null>(null);
  const [assignedDrivers, setAssignedDrivers] = useState<Record<string, Driver>>({});

  // Search and filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tour' | 'airport'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/bookings').then(res => res.json()),
      fetch('/api/admin/airport-pickup-bookings').then(res => res.json()),
    ]).then(([tourData, airportData]) => {
      const tourBookings: AdminBooking[] = (tourData.bookings || []).map((b: TourBooking) => ({ ...b, type: 'tour' }));
      const airportBookings: AdminBooking[] = (airportData.bookings || []).map((b: AirportPickupBooking) => ({ ...b, type: 'airport' }));
      setBookings([...tourBookings, ...airportBookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setLoading(false);
    }).catch(() => {
      setError('Failed to load bookings.');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string, type: 'tour' | 'airport') => {
    setDeletingId(id);
    try {
      const endpoint = type === 'tour' ? `/api/admin/bookings/${id}` : `/api/admin/airport-pickup-bookings/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => (b.type === 'airport' ? (b as AirportPickupBooking & { type: 'airport' }).uuid : (b as TourBooking & { type: 'tour' }).id) !== id));
        setToast({ type: 'success', message: 'Booking deleted.' });
      } else {
        setToast({ type: 'error', message: data.error || 'Delete failed.' });
      }
    } catch {
      setToast({ type: 'error', message: 'Delete failed.' });
    }
    setDeletingId(null);
    setConfirmId(null);
  };

  const handleEditSave = (updated: AdminBooking) => {
    setBookings((prev) => prev.map((b) => (isAirportBooking(b) ? b.uuid : b.id) === (isAirportBooking(updated) ? updated.uuid : updated.id) ? { ...updated } : b));
    setToast({ type: 'success', message: 'Booking updated.' });
    setEditBooking(null);
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      (b.customer_phone && b.customer_phone.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || b.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Add a type guard for airport bookings
  function isAirportBooking(b: AdminBooking): b is AirportPickupBooking & { type: 'airport' } {
    return b.type === 'airport';
  }

  if (loading) return <div className="p-6 text-center text-[#388e3c]">Loading bookings...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!bookings.length) return <div className="p-6 text-center text-[#85603f]">No bookings found.</div>;

  return (
    <div className="bg-white/80 rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:border-[#388e3c]"
            style={{ minWidth: 220 }}
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'all' | 'tour' | 'airport')}
            className="border rounded px-2 py-2 text-sm focus:outline-none focus:border-[#388e3c]"
          >
            <option value="all">All Types</option>
            <option value="tour">Tour</option>
            <option value="airport">Airport</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'cancelled')}
            className="border rounded px-2 py-2 text-sm focus:outline-none focus:border-[#388e3c]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]"
          onClick={() => setCreating(true)}
        >
          + New Booking
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.map((b) => (
          <div
            key={`${b.type}-${isAirportBooking(b) ? b.uuid : b.id}`}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-2 border border-[#f8ede3] transition-transform hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#388e3c]">
                {b.type === 'tour' ? <Calendar className="w-4 h-4 inline-block text-[#e9b824]" /> : <Plane className="w-4 h-4 inline-block text-[#388e3c]" />}
                {b.type === 'tour' ? 'Tour' : 'Airport'}
              </span>
              <span className="text-xs text-[#85603f]">{new Date(b.created_at).toLocaleString()}</span>
            </div>
            <div className="font-semibold text-lg text-[#1a5d1a]">{b.customer_name}</div>
            <div className="text-sm text-[#85603f]">
              <div>{b.customer_email}</div>
              {b.customer_phone && <div className="text-xs text-[#388e3c]">{b.customer_phone}</div>}
            </div>
            <div className="flex flex-wrap gap-2 text-sm mt-2">
              <div><span className="font-semibold">Date:</span> {b.type === 'tour' ? (b as TourBooking).booking_date : (b as AirportPickupBooking).arrival_date || (b as AirportPickupBooking).departure_date || '-'}</div>
              <div><span className="font-semibold">Guests/Passengers:</span> {b.type === 'tour' ? (b as TourBooking).number_of_people : (b as AirportPickupBooking).passengers}</div>
              <div><span className="font-semibold">Amount:</span> ${b.type === 'tour' ? (b as TourBooking).total_amount.toFixed(2) : (b as AirportPickupBooking).total_price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full shadow text-xs font-bold tracking-wide transition bg-gradient-to-r ${
                  b.status === 'pending'
                    ? 'from-yellow-300 to-yellow-500 text-yellow-900'
                    : b.status === 'confirmed'
                    ? 'from-green-400 to-green-700 text-white'
                    : 'from-red-400 to-red-700 text-white'
                }`}
              >
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </span>
            </div>
            <div className="flex gap-2 justify-end mt-2">
                <button
                  className="text-green-700 hover:text-green-900 p-1 rounded"
                  onClick={() => setEditBooking(b)}
                  aria-label="Edit booking"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50"
                  disabled={deletingId === (isAirportBooking(b) ? b.uuid : b.id)}
                  onClick={() => setConfirmId(isAirportBooking(b) ? b.uuid : b.id)}
                  aria-label="Delete booking"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
            </div>
            {b.status === 'pending' && (
              <button
                className="px-3 py-1 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3] text-xs mt-2"
                onClick={() => setAssigningBooking(b)}
              >
                Confirm & Assign Driver
              </button>
            )}
            {b.status === 'confirmed' && assignedDrivers[isAirportBooking(b) ? b.uuid : b.id] && (
              <div className="flex items-center gap-1 text-xs text-[#388e3c] mt-2">
                <UserCheck className="w-4 h-4" />
                Driver: {(assignedDrivers[isAirportBooking(b) ? b.uuid : b.id] as Driver).name}
              </div>
            )}
            {confirmId === (isAirportBooking(b) ? b.uuid : b.id) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
                  <p className="mb-4 text-[#85603f]">Delete this booking?</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="px-4 py-2 rounded bg-[#d83f31] text-white font-bold hover:bg-[#b91c1c]"
                      onClick={() => handleDelete(isAirportBooking(b) ? b.uuid : b.id, b.type)}
                      disabled={deletingId === (isAirportBooking(b) ? b.uuid : b.id)}
                    >
                      {deletingId === (isAirportBooking(b) ? b.uuid : b.id) ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]"
                      onClick={() => setConfirmId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          ))}
      </div>
      <CreateBookingModal
        open={creating}
        onClose={() => setCreating(false)}
        onSave={() => window.location.reload()}
      />
      {editBooking && editBooking.type === 'tour' ? (
      <EditBookingModal
          booking={editBooking as TourBooking}
        open={!!editBooking}
        onClose={() => setEditBooking(null)}
          onSave={(updated) => handleEditSave({ ...updated, type: 'tour' })}
        />
      ) : null}
      {editBooking && editBooking.type === 'airport' ? (
        <EditAirportPickupBookingModal
          booking={editBooking as AirportPickupBooking}
          open={!!editBooking}
          onClose={() => setEditBooking(null)}
          onSave={(updated) => handleEditSave({ ...updated, type: 'airport' })}
        />
      ) : null}
      <AssignDriverModal
        booking={assigningBooking}
        open={!!assigningBooking}
        onClose={() => setAssigningBooking(null)}
        onAssigned={(updated, driver) => {
          setBookings(prev => prev.map(b => (isAirportBooking(b) ? b.uuid : b.id) === (isAirportBooking(updated) ? updated.uuid : updated.id) ? { ...b, ...updated } : b));
          setAssignedDrivers(prev => ({ ...prev, [(isAirportBooking(updated) ? updated.uuid : updated.id)]: driver }));
          setAssigningBooking(null);
          setToast({ type: 'success', message: 'Driver assigned and booking confirmed.' });
        }}
      />
    </div>
  );
}

export default function AdminBookingsPage() {
  return (
    <div className="pt-2">
      <h1 className="text-2xl font-bold text-[#388e3c] mb-4">Bookings</h1>
      <BookingsTable />
    </div>
  );
} 
