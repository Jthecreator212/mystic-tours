"use client";
import { useEffect, useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import useSWR from 'swr';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle: string;
  status: string;
  created_at: string;
}

interface DriverJob {
  id: string;
  type: string;
  customer_name: string;
  date: string;
  status: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/drivers")
      .then(res => res.json())
      .then(data => {
        setDrivers(data.drivers || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load drivers.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-2">
      <h1 className="text-2xl font-bold text-[#388e3c] mb-4">Drivers</h1>
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]"
          onClick={() => setShowAddModal(true)}
        >
          + Add Driver
        </button>
      </div>
      {loading ? (
        <div className="p-6 text-center text-[#388e3c]">Loading drivers...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white rounded-lg shadow-md p-4 border border-[#f8ede3] relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="text-green-700 hover:text-green-900 p-1 rounded" onClick={() => setEditingDriver(driver)} aria-label="Edit driver"><Pencil className="w-4 h-4" /></button>
                <button className="text-red-600 hover:text-red-800 p-1 rounded" onClick={() => setDeletingDriver(driver)} aria-label="Delete driver"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="font-bold text-lg text-[#1a5d1a] mb-1">{driver.name}</div>
              <div className="text-sm text-[#85603f] mb-1">{driver.email}</div>
              <div className="text-xs text-[#388e3c] mb-1">{driver.phone}</div>
              <div className="text-sm mb-1">Vehicle: <span className="font-semibold">{driver.vehicle}</span></div>
              <div className="text-xs mb-1">Status: <span className="font-semibold text-[#388e3c]">{driver.status}</span></div>
              <div className="text-xs text-[#85603f]">Added: {new Date(driver.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-[#388e3c]">Add Driver</h2>
            <AddDriverForm
              onSuccess={driver => {
                setDrivers(prev => [driver, ...prev]);
                setShowAddModal(false);
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-[#388e3c]">Edit Driver</h2>
            <EditDriverForm
              driver={editingDriver}
              onSuccess={updated => {
                setDrivers(prev => prev.map(d => d.id === updated.id ? updated : d));
                setEditingDriver(null);
              }}
              onCancel={() => setEditingDriver(null)}
            />
          </div>
        </div>
      )}
      {deletingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
            <p className="mb-4 text-[#85603f]">Delete driver <span className="font-bold">{deletingDriver.name}</span>?</p>
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-2 rounded bg-[#d83f31] text-white font-bold hover:bg-[#b91c1c]"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/drivers/${deletingDriver.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                      setDrivers(prev => prev.filter(d => d.id !== deletingDriver.id));
                    }
                  } catch {}
                  setDeletingDriver(null);
                }}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]"
                onClick={() => setDeletingDriver(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddDriverForm({ onSuccess, onCancel }: { onSuccess: (driver: Driver) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle: '',
    status: 'available',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.driver) {
        onSuccess(data.driver);
      } else {
        setError(data.error || 'Failed to add driver.');
      }
    } catch {
      setError('Failed to add driver.');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#85603f] mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-2 py-1" type="email" />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Vehicle</label>
        <input name="vehicle" value={form.vehicle} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="off-duty">Off-duty</option>
        </select>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]" disabled={saving}>{saving ? 'Adding...' : 'Add Driver'}</button>
      </div>
    </form>
  );
}

function EditDriverForm({ driver, onSuccess, onCancel }: { driver: Driver; onSuccess: (driver: Driver) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: driver.name || '',
    phone: driver.phone || '',
    email: driver.email || '',
    vehicle: driver.vehicle || '',
    status: driver.status || 'available',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SWR for assignments
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error: jobsError, isLoading } = useSWR(driver.id ? `/api/admin/drivers/${driver.id}/jobs` : null, fetcher, { refreshInterval: 10000 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/drivers/${driver.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.driver) {
        onSuccess(data.driver);
      } else {
        setError(data.error || 'Failed to update driver.');
      }
    } catch {
      setError('Failed to update driver.');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[#85603f] mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-2 py-1" type="email" />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Vehicle</label>
        <input name="vehicle" value={form.vehicle} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
      </div>
      <div>
        <label className="block text-[#85603f] mb-1">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="off-duty">Off-duty</option>
        </select>
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2 text-[#388e3c]">Assignments</h3>
        {isLoading && <div className="text-[#388e3c]">Loading assignments...</div>}
        {jobsError && <div className="text-red-600">Failed to load assignments.</div>}
        {data && data.jobs && data.jobs.length === 0 && <div className="text-[#85603f]">No assignments found.</div>}
        {data && data.jobs && data.jobs.length > 0 && (
          <ul className="divide-y divide-[#f8ede3]">
            {data.jobs.map((job: Record<string, unknown>) => {
              const typedJob = job as unknown as DriverJob;
              return (
                <li key={typedJob.id} className="py-2 flex items-center gap-3">
                  <span className="inline-block px-2 py-1 rounded text-xs font-bold" style={{ background: typedJob.type === 'airport' ? '#e9b824' : '#388e3c', color: '#fff' }}>{typedJob.type === 'airport' ? 'Airport' : 'Tour'}</span>
                  <span className="text-[#1a5d1a] font-semibold">{typedJob.customer_name}</span>
                  <span className="text-[#85603f]">{typedJob.date ? new Date(typedJob.date).toLocaleDateString() : '-'}</span>
                  <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${typedJob.status === 'assigned' ? 'bg-yellow-200 text-yellow-900' : typedJob.status === 'completed' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{typedJob.status.charAt(0).toUpperCase() + typedJob.status.slice(1)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="px-4 py-2 rounded bg-[#e9b824] text-[#1a5d1a] font-bold hover:bg-[#f8ede3]" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded bg-[#388e3c] text-white font-bold hover:bg-[#1a5d1a]" disabled={saving}>{saving ? 'Updating...' : 'Update Driver'}</button>
      </div>
    </form>
  );
}
