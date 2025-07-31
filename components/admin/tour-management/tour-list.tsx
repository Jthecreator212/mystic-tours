'use client';

import { Tour } from '@/types/api/tour';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TourListProps {
  onEdit: (tour: Tour) => void;
  onDelete: (tourId: string) => void;
  onView: (tour: Tour) => void;
  onAddNew: () => void;
}

export default function TourList({ onEdit, onView, onAddNew }: TourListProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tours');
      const data = await response.json();
      
      if (data.success) {
        setTours(data.data);
      } else {
        setError(data.error || 'Failed to fetch tours');
      }
    } catch {
      setError('Failed to fetch tours');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the tour from the local state
        setTours(tours.filter(tour => tour.id !== tourId));
        alert('Tour deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete tour: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Failed to delete tour. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#388e3c]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#388e3c]">Tour Management</h2>
        <button
          onClick={onAddNew}
          className="bg-[#388e3c] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2e7d32] transition-colors"
        >
          <Plus size={16} />
          Add New Tour
        </button>
      </div>

      {tours.length === 0 ? (
        <div className="bg-white/80 rounded-lg shadow p-8 text-center">
          <p className="text-[#85603f] mb-4">No tours found</p>
          <button
            onClick={onAddNew}
            className="bg-[#388e3c] text-white px-4 py-2 rounded-lg hover:bg-[#2e7d32] transition-colors"
          >
            Create Your First Tour
          </button>
        </div>
      ) : (
        <div className="bg-white/80 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#388e3c] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tour</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={tour.featured_image || '/placeholder-tour.jpg'}
                          alt={tour.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="font-medium text-[#388e3c]">{tour.name}</div>
                          <div className="text-sm text-gray-500">{tour.short_description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#388e3c]">
                        ${tour.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tour.duration}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tour.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tour.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onView(tour)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Tour"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(tour)}
                          className="text-[#388e3c] hover:text-[#2e7d32] p-1"
                          title="Edit Tour"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(tour.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Tour"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 

