'use client';

import { AlertCircle, Key, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminAuth() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    accessKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/mt-operations');
        router.refresh();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8ede3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-[#1a5d1a] rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-[#e9b824]" />
          </div>
          <h1 className="text-3xl font-bold font-playfair text-[#1a5d1a] mb-2">
            Mystic Tours Operations
          </h1>
          <p className="text-[#85603f]">Admin Access Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#f8ede3] border-2 border-[#e9b824] rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#85603f] mb-2">
                Admin Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#85603f]" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#e9b824] rounded-lg bg-white text-[#85603f] placeholder-[#85603f]/60 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
                  placeholder="Enter admin email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#85603f] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#85603f]" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#e9b824] rounded-lg bg-white text-[#85603f] placeholder-[#85603f]/60 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
                  placeholder="Enter password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Access Key Field */}
            <div>
              <label htmlFor="accessKey" className="block text-sm font-medium text-[#85603f] mb-2">
                Access Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#85603f]" />
                <input
                  type="password"
                  id="accessKey"
                  name="accessKey"
                  required
                  value={formData.accessKey}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#e9b824] rounded-lg bg-white text-[#85603f] placeholder-[#85603f]/60 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
                  placeholder="Enter access key"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a5d1a] text-[#e9b824] py-3 px-4 rounded-lg font-bold text-lg hover:bg-[#388e3c] focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:ring-offset-2 focus:ring-offset-[#f8ede3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-[#e9b824] border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Operations Panel'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#85603f]/70">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </div>

        {/* Back to Public Site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-[#85603f] hover:text-[#1a5d1a] text-sm font-medium transition-colors"
          >
            ← Back to Mystic Tours
          </Link>
        </div>
      </div>
    </div>
  );
} 