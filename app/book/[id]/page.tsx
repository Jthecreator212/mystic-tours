"use client"

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, ChevronRight } from "lucide-react";
import { tourData } from "../../../data/tours";
import { use } from "react";

// Component that handles the booking form and logic
function BookingContent({ tourId }: { tourId: number }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const router = useRouter();
  
  // Find the tour based on the passed tourId
  const tour = tourData.find(tour => tour.id === tourId);
  
  // Redirect to tours page if tour not found
  useEffect(() => {
    if (!tour) {
      router.push('/tours');
    }
  }, [tour, router]);
  
  // Tour price from the selected tour
  const tourPrice = tour?.price || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare booking data with tour details
    const bookingData = {
      tourId,
      tourName: tour?.title,
      tourPrice: tour?.price,
      date,
      time,
      guests,
      customerInfo: {
        name,
        email,
        phone,
        specialRequests
      },
      paymentMethod,
      // Only include partial card info for security
      paymentDetails: paymentMethod === 'credit' ? {
        lastFourDigits: cardNumber.slice(-4),
        expiryMonth,
        expiryYear
      } : {}
    };
    
    console.log('Booking submitted:', bookingData);
    
    // Placeholder for payment processing
    setPaymentStatus("success");
    
    // In a real app, you would send this data to your backend
    // and then redirect after successful payment confirmation
    
    // Redirect after successful payment
    setTimeout(() => {
      // Pass tour ID in the redirect to show relevant confirmation
      router.push(`/booking-confirmation?tourId=${tourId}`);
    }, 2000);
  };
  
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-0 md:p-10 bg-gradient-to-br from-[#f8fafc] via-white to-[#e9b824]/10 rounded-2xl shadow-2xl mt-10 border-b-4 border-[#e9b824] relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-10">
        <section aria-labelledby="book-tour-heading" className="flex-1">
          {/* Main booking form fields */}
          {/* Add your form fields here, e.g. name, email, date, time, guests, payment, etc. */}
        </section>
        <aside className="w-full md:w-96 bg-[#fffbe6] rounded-xl shadow-lg p-6 border border-[#e9b824]/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="inline-block w-2 h-8 bg-[#e9b824] mr-3 rounded-full"></span>
            Order Summary
          </h2>
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-[#e9b824]/20">
            <h3 className="text-xl font-bold text-[#1a5d1a] flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#e9b824] mr-2"></span>
              {tour?.title || "Tour Package"}
            </h3>
            <p className="text-[#85603f] ml-5 text-sm">One-time payment</p>
            <div className="flex justify-between items-center mt-3 ml-5">
              <span className="text-[#85603f]">Tour Price</span>
              <span className="text-xl font-bold text-[#ef3340]">${tourPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 ml-5">
              <span className="text-[#85603f]">Duration</span>
              <span className="text-[#85603f]">{tour?.duration || "N/A"}</span>
            </div>
          </div>
          <div className="border-t-2 border-dashed border-[#fcd116]/40 my-6 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#85603f]">Total</span>
              <span className="text-2xl font-bold text-[#ef3340]">${tourPrice.toFixed(2)}</span>
            </div>
            <p className="text-sm text-[#85603f] mt-1 italic">Lifetime access, no recurring fees</p>
          </div>
          <div className="border-t-2 border-dashed border-[#e9b824]/40 my-6 pt-6">
            <h3 className="text-lg font-bold text-[#1a5d1a] mb-4 flex items-center">
              <span className="w-3 h-3 rounded-full bg-[#e9b824] mr-2"></span>
              What's included:
            </h3>
            <ul className="space-y-3">
              {(tour?.includes || [
                "Professional guide",
                "Transportation",
                "Entrance fees",
                "Lunch and refreshments",
                "24/7 customer support"
              ]).map((item, index) => (
                <li key={index} className="flex items-start group">
                  <span className="inline-flex items-center justify-center p-1 bg-[#1a5d1a] text-white rounded-full mr-2 mt-1 group-hover:bg-[#e9b824] group-hover:text-[#1a5d1a] transition-colors duration-300">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-[#85603f] group-hover:text-[#1a5d1a] transition-colors duration-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 mb-4 text-center">
            <h4 className="font-bold text-[#1a5d1a] mb-2">Discover the mystical island experience</h4>
            <p className="text-sm text-[#85603f] italic">"{tour?.shortDescription || "Embark on a journey of discovery with us!"}"</p>
          </div>
          <p className="text-sm text-[#85603f] mb-2">Need a custom tour experience?</p>
          <a href="mailto:info@islandmystic.com" className="inline-block bg-[#1a5d1a] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#e9b824] hover:text-[#1a5d1a] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#e9b824]/50 transform hover:scale-105" aria-label="Email Island Mystic to arrange a custom tour">
            Contact Us
          </a>
        </aside>
      </div>
    </form>
  );
}

// Loading component
function BookingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a5d1a]" />
    </div>
  );
}

// Main page component with Suspense boundary
export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tourId = parseInt(resolvedParams.id);
  
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingContent tourId={tourId} />
    </Suspense>
  );
}
