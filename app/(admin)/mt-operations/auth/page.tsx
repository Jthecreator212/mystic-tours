'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminAuth() {
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '', 
    accessKey: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        router.push('/mt-operations');
      } else {
        setError('Access denied');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-gray-100">System Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              className="bg-gray-700 border-gray-600 text-gray-100"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              className="bg-gray-700 border-gray-600 text-gray-100"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <Input
              type="text"
              placeholder="Access Code"
              className="bg-gray-700 border-gray-600 text-gray-100"
              value={credentials.accessKey}
              onChange={(e) => setCredentials(prev => ({ ...prev, accessKey: e.target.value }))}
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? 'Accessing...' : 'Access'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 