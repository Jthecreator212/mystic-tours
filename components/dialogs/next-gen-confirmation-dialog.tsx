"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plane, Calendar, Users, DollarSign, Hash, Sparkles, Star, Heart, Zap } from "lucide-react";

interface NextGenConfirmationDialogProps {
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

export function NextGenConfirmationDialog({ 
  isOpen, 
  onClose, 
  bookingDetails 
}: NextGenConfirmationDialogProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [, setPulseCount] = useState(0);

  // 2024 Trend: Celebration micro-interactions with staggered timing
  useEffect(() => {
    if (isOpen) {
      // Generate celebration particles
      const newParticles = Array.from({length: 15}, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60 + 20,
        delay: i * 120
      }));
      setParticles(newParticles);
      
      // Celebration sequence
      setTimeout(() => setShowCelebration(true), 800);
      
      // Pulse effects
      const pulseInterval = setInterval(() => {
        setPulseCount(prev => prev + 1);
      }, 1200);

      return () => clearInterval(pulseInterval);
    } else {
      setParticles([]);
      setShowCelebration(false);
      setPulseCount(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay 
        className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <DialogContent 
          className={`
            relative max-w-md w-full mx-auto
            bg-gradient-to-br from-white/95 via-white/92 to-slate-50/90
            backdrop-blur-3xl border border-white/30 shadow-2xl
            rounded-3xl p-6 space-y-6
            transform transition-all duration-700 ease-out
            ${isOpen ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4' : ''}
          `}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.92) 50%, rgba(248,250,252,0.90) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          }}
        >
          {/* 2024 Trend: Celebration particles with physics */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full opacity-80"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  background: `hsl(${145 + particle.id * 15}, 70%, 60%)`,
                  animation: `celebration-float 3s ease-out ${particle.delay}ms infinite`,
                  transform: 'scale(0)',
                  animationFillMode: 'forwards'
                }}
              />
            ))}
          </div>

          {/* 2024 Trend: Ambient lighting effects */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-300/30 to-orange-400/30 rounded-full blur-2xl animate-bounce" 
               style={{animationDelay: '1s', animationDuration: '3s'}} />

          {/* Header with 2024 depth effects */}
          <div 
            className={`text-center space-y-4 relative ${isOpen ? 'animate-in slide-in-from-top-4' : ''}`}
            style={{ animationDelay: '300ms' }}
          >
            <div className="relative inline-flex">
              {/* 2024 Trend: Layered depth with multiple glows */}
              <div className="absolute inset-0 w-20 h-20 bg-emerald-400/30 rounded-full blur-xl animate-ping" 
                   style={{animationDuration: '2s'}} />
              <div className="absolute inset-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
              
              <CheckCircle 
                className={`
                  relative w-20 h-20 text-emerald-500 z-10
                  ${isOpen ? 'animate-in zoom-in-0 spin-in-180' : ''}
                  ${showCelebration ? 'animate-bounce' : ''}
                `}
                style={{ 
                  animationDelay: '500ms',
                  filter: 'drop-shadow(0 8px 32px rgba(16, 185, 129, 0.4)) drop-shadow(0 4px 16px rgba(16, 185, 129, 0.3))'
                }}
              />
            </div>
            
            {/* 2024 Trend: Conversational, emoji-rich copy */}
            <div className="space-y-2">
              <h2 className={`
                text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 
                bg-clip-text text-transparent leading-tight
                ${isOpen ? 'animate-in slide-in-from-left-4' : ''}
              `}
              style={{ animationDelay: '700ms' }}>
                {bookingDetails.type === 'tour' ? '🎉 Adventure Locked In!' : '✈️ Ride Confirmed!'}
              </h2>
              <p className={`
                text-emerald-700/80 font-medium
                ${isOpen ? 'animate-in slide-in-from-right-4' : ''}
              `}
              style={{ animationDelay: '900ms' }}>
                {bookingDetails.type === 'tour' 
                  ? 'Get ready for an epic Jamaican experience! 🌴✨' 
                  : 'Your smooth airport transfer is all set! 🚗💨'
                }
              </p>
            </div>
          </div>

          {/* 2024 Trend: Glass-morphism cards with enhanced depth */}
          <div 
            className={`space-y-4 ${isOpen ? 'animate-in slide-in-from-bottom-4' : ''}`}
            style={{ animationDelay: '1100ms' }}
          >
            {/* Primary booking card */}
            <div 
              className="relative bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-xl border border-emerald-200/40 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(16, 185, 129, 0.2)'
              }}
            >
              <div className="flex items-start gap-4">
                {bookingDetails.type === 'tour' ? (
                  <Star className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0 animate-pulse" />
                ) : (
                  <Plane className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0 animate-pulse" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 text-lg leading-tight mb-3">
                    {bookingDetails.type === 'tour' ? bookingDetails.tourName : 
                     `Airport ${bookingDetails.serviceType === 'both' ? 'Round Trip' : 
                               bookingDetails.serviceType === 'pickup' ? 'Pickup' : 'Drop-off'}`}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{bookingDetails.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {bookingDetails.type === 'tour' ? bookingDetails.guests : bookingDetails.passengers} 
                        {bookingDetails.type === 'tour' ? ' guests' : ' passengers'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2024 Trend: Micro-interaction cards */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-xl p-4 hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-default shadow-lg"
                style={{backdropFilter: 'blur(20px)'}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Total Cost</p>
                    <p className="text-lg font-bold text-emerald-800">${bookingDetails.totalAmount}</p>
                  </div>
                </div>
              </div>
              
              <div 
                className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-xl p-4 hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-default shadow-lg"
                style={{backdropFilter: 'blur(20px)'}}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <Hash className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Booking ID</p>
                    <p className="text-lg font-bold text-blue-800">#{bookingDetails.bookingId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight information for airport bookings */}
            {bookingDetails.type === 'airport' && bookingDetails.flightNumber && (
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-xl border border-blue-200/40 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Flight Details</p>
                    <p className="text-lg font-bold text-blue-800">{bookingDetails.flightNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2024 Trend: Human-centered smart messaging */}
          <div 
            className={`
              bg-gradient-to-r from-amber-50/90 to-yellow-50/90 
              backdrop-blur-xl border border-amber-200/40 
              rounded-2xl p-5 text-center shadow-inner
              ${isOpen ? 'animate-in slide-in-from-bottom-4' : ''}
            `}
            style={{ 
              animationDelay: '1300ms',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.08) 100%)'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-amber-600 animate-pulse" />
              <p className="text-sm font-bold text-amber-800">We&apos;ve Got You Covered</p>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed">
              Confirmation details sent to <span className="font-semibold">{bookingDetails.customerEmail}</span> 📧<br/>
              <span className="font-medium">Need help? Our team is here 24/7! 💬</span>
            </p>
          </div>

          {/* 2024 Trend: Ultra-modern button with shimmer effect */}
          <div 
            className={`pt-2 ${isOpen ? 'animate-in slide-in-from-bottom-4' : ''}`}
            style={{ animationDelay: '1500ms' }}
          >
            <Button
              onClick={onClose}
              className={`
                w-full h-14 rounded-2xl font-bold text-white text-base
                bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
                hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600
                shadow-2xl hover:shadow-emerald-500/25
                transition-all duration-500 ease-out
                hover:scale-[1.02] active:scale-[0.98]
                border-0 relative overflow-hidden
                group
              `}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
                boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.4), 0 4px 16px -4px rgba(16, 185, 129, 0.3)'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Continue Exploring Jamaica 
                <Sparkles className="w-5 h-5 group-hover:animate-spin transition-transform duration-300" />
                🌴
              </span>
              {/* 2024 Trend: Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out delay-200" />
            </Button>

            {/* 2024 Trend: Accessibility-first design */}
            <p className="text-center text-xs text-gray-500 mt-3 px-2">
              Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Esc</kbd> to close • 
              <span className="text-emerald-600 font-medium">Booking confirmed</span> ✓
            </p>
          </div>

          {/* 2024 Trend: Floating action with depth */}
          <button
            onClick={onClose}
            className={`
              absolute -top-4 -right-4 w-10 h-10 
              bg-white/95 backdrop-blur-xl
              border border-gray-200/60 shadow-xl
              rounded-full flex items-center justify-center
              hover:bg-white hover:scale-110 hover:shadow-2xl
              transition-all duration-300 ease-out
              text-gray-500 hover:text-gray-700
              ${isOpen ? 'animate-in zoom-in-0 spin-in-90' : ''}
            `}
            style={{ animationDelay: '1700ms' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </DialogContent>
      </DialogOverlay>

      {/* 2024 Trend: Custom CSS for celebration animations */}
      <style jsx>{`
        @keyframes celebration-float {
          0% { transform: scale(0) translateY(0px); opacity: 0; }
          15% { transform: scale(1) translateY(-10px); opacity: 1; }
          50% { transform: scale(0.8) translateY(-25px); opacity: 0.8; }
          100% { transform: scale(0) translateY(-50px); opacity: 0; }
        }
      `}</style>
    </Dialog>
  );
} 