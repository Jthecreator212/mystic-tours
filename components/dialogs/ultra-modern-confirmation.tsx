"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plane, Calendar, Users, DollarSign, Hash, Sparkles, Star, Heart } from "lucide-react";

interface UltraModernConfirmationProps {
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

export function UltraModernConfirmation({ 
  isOpen, 
  onClose, 
  bookingDetails 
}: UltraModernConfirmationProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({length: 15}, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60 + 20,
        delay: i * 120
      }));
      setParticles(newParticles);
      
      setTimeout(() => setShowCelebration(true), 800);

      return () => {
        setParticles([]);
        setShowCelebration(false);
      };
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay 
        className="fixed inset-0 bg-black/70 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <DialogContent 
          className={`
            relative max-w-md w-full mx-auto
            bg-gradient-to-br from-white/95 via-white/92 to-slate-50/90
            backdrop-blur-3xl border border-white/30 shadow-2xl
            rounded-3xl p-6 space-y-6
            ${isOpen ? 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-700' : ''}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Celebration particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 rounded-full opacity-80 animate-ping"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  background: `hsl(${145 + particle.id * 15}, 70%, 60%)`,
                  animationDelay: `${particle.delay}ms`,
                  animationDuration: '3s'
                }}
              />
            ))}
          </div>

          {/* Ambient lighting */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-full blur-3xl opacity-60 animate-pulse" />

          {/* Success Icon */}
          <div className="text-center relative">
            <div className="relative inline-flex">
              <div className="absolute inset-0 w-20 h-20 bg-emerald-400/30 rounded-full blur-xl animate-ping" />
              <CheckCircle 
                className={`
                  relative w-20 h-20 text-emerald-500 z-10
                  ${isOpen ? 'animate-in zoom-in-0 spin-in-180 duration-800' : ''}
                  ${showCelebration ? 'animate-bounce' : ''}
                `}
                style={{ 
                  filter: 'drop-shadow(0 8px 32px rgba(16, 185, 129, 0.4))'
                }}
              />
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {bookingDetails.type === 'tour' ? '🎉 Adventure Secured!' : '✈️ Transfer Confirmed!'}
            </h2>
            <p className="text-emerald-700/80 font-medium">
              {bookingDetails.type === 'tour' 
                ? 'Get ready for an amazing experience! 🌴✨' 
                : 'Your smooth ride is all set! 🚗💨'
              }
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur-xl border border-emerald-200/40 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                {bookingDetails.type === 'tour' ? (
                  <Star className="w-6 h-6 text-emerald-600 mt-1" />
                ) : (
                  <Plane className="w-6 h-6 text-emerald-600 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 text-lg mb-3">
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

            {/* Price and ID cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-xl p-4 hover:bg-white/90 hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Total</p>
                    <p className="text-lg font-bold text-emerald-800">${bookingDetails.totalAmount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-xl p-4 hover:bg-white/90 hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <Hash className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">ID</p>
                    <p className="text-lg font-bold text-blue-800">#{bookingDetails.bookingId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart messaging */}
          <div className="bg-gradient-to-r from-amber-50/90 to-yellow-50/90 backdrop-blur-xl border border-amber-200/40 rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Heart className="w-5 h-5 text-amber-600 animate-pulse" />
                              <p className="text-sm font-bold text-amber-800">We&apos;ve Got You Covered</p>
            </div>
            <p className="text-sm text-amber-700">
              Confirmation sent to <span className="font-semibold">{bookingDetails.customerEmail}</span> 📧<br/>
                              <span className="font-medium">Questions? We&apos;re here 24/7! 💬</span>
            </p>
          </div>

          {/* Ultra-modern button */}
          <Button
            onClick={onClose}
            className="w-full h-14 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-2xl hover:scale-[1.02] transition-all duration-500 border-0 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Continue Exploring Jamaica 
              <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              🌴
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>

          {/* Floating close button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 w-10 h-10 bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
} 