'use client';

import { Tour } from '@/types/api/tour';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';

interface TourFormProps {
  tour?: Tour | null;
  onSave: (tourData: Partial<Tour>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export default function TourForm({ tour, onSave, onCancel, mode }: TourFormProps) {
  const [formData, setFormData] = useState({
    name: tour?.name || '',
    slug: tour?.slug || '',
    short_description: tour?.short_description || '',
    description: tour?.description || '',
    price: tour?.price || 0,
    duration: tour?.duration || '',
    group_size: tour?.max_passengers?.toString() || '',
    category: tour?.category || '',
    difficulty: tour?.difficulty || 'easy',
    featured_image: tour?.featured_image || '',
    gallery_images: tour?.gallery_images || [],
    highlights: tour?.highlights || [],
    included: tour?.included || [],
    not_included: tour?.not_included || [],
    requirements: tour?.requirements || [],
    status: tour?.status || 'draft',
    seo_title: tour?.seo_title || '',
    seo_description: tour?.seo_description || '',
  });

  const [loading, setLoading] = useState(false);
  const [_imageUploading, setImageUploading] = useState(false);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        handleInputChange('featured_image', data.url);
      } else {
        alert('Failed to upload image');
      }
    } catch {
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const tourData = {
        ...formData,
        price: Number(formData.price),
        max_passengers: Number(formData.group_size),
        min_passengers: 1,
        currency: 'USD',
        location: {
          city: 'Jamaica',
          region: 'Caribbean',
          country: 'Jamaica',
          coordinates: { lat: 18.1096, lng: -77.2975 },
          pickup_locations: ['Hotel pickup', 'Airport pickup', 'Port pickup']
        },
        availability: {
          available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          start_times: ['08:00', '09:00', '10:00'],
          seasonal_availability: {
            start_month: 1,
            end_month: 12
          }
        }
      };
      
      onSave(tourData);
    } catch {
      alert('Failed to save tour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#388e3c]">
              {mode === 'create' ? 'Create New Tour' : 'Edit Tour'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., Full Day (8 Hours)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Size *
              </label>
              <input
                type="number"
                value={formData.group_size}
                onChange={(e) => handleInputChange('group_size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Cultural, Adventure, Nature"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="Brief description for tour cards..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="Detailed description of the tour..."
                required
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="flex items-center space-x-4">
              {formData.featured_image && (
                <img
                  src={formData.featured_image}
                  alt="Featured"
                  className="w-32 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => handleInputChange('featured_image', e.target.value)}
                  placeholder="Image URL or upload file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                />
              </div>
              <label className="cursor-pointer bg-[#388e3c] text-white px-4 py-2 rounded-lg hover:bg-[#2e7d32] transition-colors">
                <Upload size={16} className="inline mr-2" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Arrays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlights (comma-separated)
              </label>
              <textarea
                value={formData.highlights.join(', ')}
                onChange={(e) => handleArrayInputChange('highlights', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="Scenic views, Local culture, Photography..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s Included (comma-separated)
              </label>
              <textarea
                value={formData.included.join(', ')}
                onChange={(e) => handleArrayInputChange('included', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="Transportation, Guide, Lunch..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s Not Included (comma-separated)
              </label>
              <textarea
                value={formData.not_included.join(', ')}
                onChange={(e) => handleArrayInputChange('not_included', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="Personal expenses, Tips, Insurance..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements (comma-separated)
              </label>
              <textarea
                value={formData.requirements.join(', ')}
                onChange={(e) => handleArrayInputChange('requirements', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="Comfortable shoes, Water bottle, Camera..."
              />
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => handleInputChange('seo_title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="SEO optimized title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                value={formData.seo_description}
                onChange={(e) => handleInputChange('seo_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#388e3c] focus:border-transparent"
                placeholder="SEO meta description..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#388e3c] text-white rounded-lg hover:bg-[#2e7d32] transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Tour' : 'Update Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 