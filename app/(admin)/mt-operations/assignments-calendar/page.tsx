"use client";

import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useSWR from 'swr';

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Dummy events for initial scaffold
const dummyEvents: Event[] = [
  {
    title: "Driver: John Doe - Tour: Blue Lagoon",
    start: new Date(),
    end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours later
    allDay: false,
    resource: { driver: "John Doe", bookingType: "tour" },
  },
  {
    title: "Driver: Jane Smith - Airport Pickup",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    allDay: true,
    resource: { driver: "Jane Smith", bookingType: "airport" },
  },
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AssignmentsCalendarPage() {
  const { data, error, isLoading } = useSWR('/api/admin/driver-assignments', fetcher, { refreshInterval: 10000 });

  const events: Event[] = (data?.assignments || dummyEvents).map((a: Record<string, unknown>) => ({
    title: `Driver: ${a.driver_name} - ${a.booking_type === 'airport' ? 'Airport' : 'Tour'}: ${a.customer_name}`,
    start: new Date(a.date as string),
    end: new Date(a.date as string),
    allDay: true,
    resource: { driver: a.driver_name, bookingType: a.booking_type, status: a.assignment_status },
  }));

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-[#388e3c]">Driver Assignment Calendar</h1>
      {isLoading && <div className="mb-4 text-[#388e3c]">Loading assignments...</div>}
      {error && <div className="mb-4 text-red-600">Failed to load assignments.</div>}
      <div className="bg-white rounded-lg shadow p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          popup
          views={["month", "week", "day"]}
          eventPropGetter={(event) => {
            const color = event.resource?.bookingType === "airport" ? "#e9b824" : "#388e3c";
            return {
              style: {
                backgroundColor: color,
                color: "#fff",
                borderRadius: "6px",
                border: "none",
              },
            };
          }}
        />
      </div>
    </div>
  );
} 
