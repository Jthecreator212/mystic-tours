import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plane, Calendar, Users, DollarSign, Hash, MapPin, Clock, Sparkles, Star, Heart } from "lucide-react";

interface UltraModernConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    type: 'tour' | 'airport';
    tourName?: string;
    serviceType?: 'pickup' | 'dropoff' | 'both';
    date: string;
    guests?: number;
    passengers?: number;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    bookingId: string;
    flightNumber?: string;
    destination?: string;
  };
}

export function UltraModernConfirmationDialog({ 
  isOpen, 
  onClose, 
  bookingDetails 
}: UltraModernConfirmationDialogProps) {
  const [celebrationComplete, setCelebrationComplete] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);

  // Create particle animation on mount
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setParticleCount(prev => (prev < 12 ? prev + 1 : prev));
      }, 150);

      // Celebration sequence
      const celebrationTimer = setTimeout(() => {
        setCelebrationComplete(true);
      }, 2000);

      // Pulse animation
      const pulseInterval = setInterval(() => {
        setPulseCount(prev => prev + 1);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(celebrationTimer);
        clearInterval(pulseInterval);
      };
    } else {
      setParticleCount(0);
      setCelebrationComplete(false);
      setPulseCount(0);
    }
  }, [isOpen]);

  const renderParticles = () => {
    return Array.from({ length: particleCount }, (_, i) => (
      <div
        key={i}
        className={`absolute w-3 h-3 rounded-full animate-ping opacity-70 pointer-events-none`}
        style={{
          background: `hsl(${60 + i * 30}, 80%, 60%)`,
          left: `${20 + (i * 7) % 60}%`,
          top: `${15 + (i * 11) % 40}%`,
          animationDelay: `${i * 100}ms`,
          animationDuration: '2s',
        }}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay 
        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <DialogContent 
          className={`
            relative max-w-sm w-full mx-auto
            bg-gradient-to-br from-white/95 via-white/90 to-white/85
            backdrop-blur-2xl border border-white/20 shadow-2xl
            rounded-3xl p-6 space-y-5
            ${isOpen ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2' : ''}
            duration-700 ease-out
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {renderParticles()}
          </div>

          {/* Floating orbs for ambient effect */}
          <div 
            className={`
              absolute -top-4 -right-4 w-20 h-20 
              bg-gradient-to-br from-emerald-400/30 to-teal-500/30 
              rounded-full blur-xl animate-pulse
              ${pulseCount > 0 ? 'animate-bounce' : ''}
            `}
            style={{ animationDelay: '0.5s' }}
          />
          <div 
            className={`
              absolute -bottom-6 -left-6 w-16 h-16 
              bg-gradient-to-br from-yellow-400/30 to-orange-500/30 
              rounded-full blur-xl animate-pulse
              ${pulseCount > 1 ? 'animate-bounce' : ''}
            `}
            style={{ animationDelay: '1.5s' }}
          />

          {/* Header with advanced depth */}
          <div 
            className={`
              text-center space-y-3 relative
              ${isOpen ? 'animate-in slide-in-from-top-4' : ''}
            `}
            style={{ animationDelay: '400ms' }}
          >
            <div className="relative inline-flex">
              <CheckCircle 
                className={`
                  w-16 h-16 text-emerald-500 mx-auto 
                  drop-shadow-2xl filter
                  ${isOpen ? 'animate-in zoom-in-0 spin-in-180' : ''}
                  ${celebrationComplete ? 'animate-pulse' : ''}
                `}
                style={{ 
                  animationDelay: '600ms',
                  filter: 'drop-shadow(0 4px 20px rgba(16, 185, 129, 0.4))'
                }}
              />
              {/* Glow effect */}
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-emerald-500/20 blur-xl animate-ping" 
                   style={{ animationDelay: '800ms' }} />
            </div>
            
            <div className="space-y-2">
              <h2 className={`
                text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 
                bg-clip-text text-transparent leading-tight
                ${isOpen ? 'animate-in slide-in-from-left-4' : ''}
              `}
              style={{ animationDelay: '800ms' }}>
                {bookingDetails.type === 'tour' ? '🎉 Adventure Secured!' : '✈️ Transfer Locked In!'}
              </h2>
              <p className={`
                text-emerald-700/80 font-medium text-sm
                ${isOpen ? 'animate-in slide-in-from-right-4' : ''}
              `}
              style={{ animationDelay: '1000ms' }}>
                {bookingDetails.type === 'tour' 
                  ? 'Your Jamaican experience awaits! 🌴' 
                  : 'Your ride is confirmed and ready! 🚗'
                }
              </p>
            </div>
          </div>

          {/* Modern card-based details with glass-morphism */}
          <div 
            className={`
              space-y-3
              ${isOpen ? 'animate-in slide-in-from-bottom-4' : ''}
            `}
            style={{ animationDelay: '1200ms' }}
          >
            {/* Primary details card */}
            <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/30 rounded-2xl p-4 space-y-3">
              {bookingDetails.type === 'tour' ? (
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-emerald-900 text-sm truncate">
                      {bookingDetails.tourName}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-emerald-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {bookingDetails.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {bookingDetails.guests} guests
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Plane className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-emerald-900 text-sm">
                      Airport {bookingDetails.serviceType === 'both' ? 'Round Trip' : 
                              bookingDetails.serviceType === 'pickup' ? 'Pickup' : 'Drop-off'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-emerald-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {bookingDetails.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {bookingDetails.passengers} passengers
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary details with micro-interactions */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-3 hover:bg-white/80 transition-all duration-300 hover:scale-[1.02] cursor-default">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Total</p>
                    <p className="text-sm font-bold text-emerald-800">${bookingDetails.totalAmount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-3 hover:bg-white/80 transition-all duration-300 hover:scale-[1.02] cursor-default">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Booking ID</p>
                    <p className="text-sm font-bold text-emerald-800">#{bookingDetails.bookingId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight info for airport bookings */}
            {bookingDetails.type === 'airport' && bookingDetails.flightNumber && (
              <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/30 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Flight</p>
                    <p className="text-sm font-bold text-blue-800">{bookingDetails.flightNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Smart notification */}
          <div 
            className={`
              bg-gradient-to-r from-amber-50/80 to-yellow-50/80 
              backdrop-blur-sm border border-amber-200/30 
              rounded-2xl p-4 text-center
              ${isOpen ? 'animate-in slide-in-from-bottom-4' : ''}
            `}
            style={{ animationDelay: '1400ms' }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-amber-600 animate-pulse" />
              <p className="text-xs font-semibold text-amber-800">Smart Reminder</p>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              We'll send you a confirmation email and WhatsApp reminder 24 hours before your {bookingDetails.type}. 
              <span className="font-medium"> Questions? We're always here! 💬</span>
            </p>
          </div>

          {/* Ultra-modern action button */}
          <div 
            className={`
              pt-2 space-y-3
              ${isOpen ? 'animate-in slide-in-from-bottom-4' : ''}
            `}
            style={{ animationDelay: '1600ms' }}
          >
            <Button
              onClick={onClose}
              className={`
                w-full h-12 rounded-2xl font-semibold text-white
                bg-gradient-to-r from-emerald-500 to-teal-600
                hover:from-emerald-600 hover:to-teal-700
                shadow-xl hover:shadow-2xl
                transition-all duration-300 ease-out
                hover:scale-[1.02] active:scale-[0.98]
                border-0 relative overflow-hidden
                group
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue Exploring Jamaica 
                <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                🌴
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            </Button>

            {/* Subtle accessibility info */}
            <p className="text-center text-xs text-gray-500 px-2">
              Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to close • 
              Confirmation details sent to {bookingDetails.customerEmail}
            </p>
          </div>

          {/* Floating close button with depth */}
          <button
            onClick={onClose}
            className={`
              absolute -top-3 -right-3 w-8 h-8 
              bg-white/90 backdrop-blur-sm
              border border-gray-200/50 shadow-lg
              rounded-full flex items-center justify-center
              hover:bg-white hover:scale-110 
              transition-all duration-200 ease-out
              text-gray-500 hover:text-gray-700
              ${isOpen ? 'animate-in zoom-in-0 spin-in-90' : ''}
            `}
            style={{ animationDelay: '1800ms' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
} 