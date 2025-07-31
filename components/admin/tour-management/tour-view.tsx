'use client';

import { Tour } from '@/types/api/tour';
import { Clock, DollarSign, MapPin, Star, Users, X } from 'lucide-react';

interface TourViewProps {
  tour: Tour;
  onClose: () => void;
  onEdit: () => void;
}

export default function TourView({ tour, onClose, onEdit }: TourViewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#388e3c]">Tour Preview</h2>
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-[#388e3c] text-white rounded-lg hover:bg-[#2e7d32] transition-colors"
              >
                Edit Tour
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Header with Image */}
          <div className="relative">
            {tour.featured_image && (
              <img
                src={tour.featured_image}
                alt={tour.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div className="absolute top-4 left-4 bg-[#388e3c] text-white px-3 py-1 rounded-full text-sm font-semibold">
              {tour.status}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-[#388e3c]">{tour.name}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span className="font-semibold">${tour.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Max {tour.max_passengers} people</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{tour.location?.city}, {tour.location?.country}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.0 (25 reviews)</span>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#388e3c] mb-2">Short Description</h3>
              <p className="text-gray-700">{tour.short_description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#388e3c] mb-2">Full Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{tour.description}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Highlights */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#388e3c] mb-2">Highlights</h3>
                <ul className="space-y-1">
                  {tour.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#388e3c] rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Included */}
            {tour.included && tour.included.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#388e3c] mb-2">What&apos;s Included</h3>
                <ul className="space-y-1">
                  {tour.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Not Included */}
            {tour.not_included && tour.not_included.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#388e3c] mb-2">What&apos;s Not Included</h3>
                <ul className="space-y-1">
                  {tour.not_included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {tour.requirements && tour.requirements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#388e3c] mb-2">Requirements</h3>
                <ul className="space-y-1">
                  {tour.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-[#388e3c] mb-2">Category</h4>
              <p className="text-gray-700">{tour.category || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-[#388e3c] mb-2">Difficulty</h4>
              <p className="text-gray-700 capitalize">{tour.difficulty || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-[#388e3c] mb-2">Status</h4>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                tour.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : tour.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {tour.status}
              </span>
            </div>
          </div>

          {/* SEO Info */}
          {(tour.seo_title || tour.seo_description) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-[#388e3c] mb-2">SEO Information</h3>
              {tour.seo_title && (
                <div className="mb-2">
                  <h4 className="font-medium text-gray-700 mb-1">SEO Title</h4>
                  <p className="text-sm text-gray-600">{tour.seo_title}</p>
                </div>
              )}
              {tour.seo_description && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">SEO Description</h4>
                  <p className="text-sm text-gray-600">{tour.seo_description}</p>
                </div>
              )}
            </div>
          )}

          {/* Gallery Images */}
          {tour.gallery_images && tour.gallery_images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#388e3c] mb-4">Gallery Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tour.gallery_images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-[#388e3c] text-white rounded-lg hover:bg-[#2e7d32] transition-colors"
            >
              Edit Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 