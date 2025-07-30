'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function AdminAuth() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/mt-operations');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8ede3] to-[#e9b824] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-[#85603f]">
        <CardHeader className="text-center bg-[#1a5d1a] text-[#f8ede3] rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-[#e9b824]" />
          </div>
          <CardTitle className="text-2xl font-bold">MT Operations</CardTitle>
          <CardDescription className="text-[#f8ede3]/80">
            Secure Admin Access Portal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#85603f]" />
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 border border-[#e9b824] rounded-lg bg-white text-[#85603f] placeholder-[#85603f]/60 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
                placeholder="Admin Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#85603f]" />
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 border border-[#e9b824] rounded-lg bg-white text-[#85603f] placeholder-[#85603f]/60 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a5d1a] hover:bg-[#d83f31] text-[#f8ede3] font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 border-2 border-[#85603f] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Access Portal'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#85603f]/70">
              Authorized Personnel Only
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 