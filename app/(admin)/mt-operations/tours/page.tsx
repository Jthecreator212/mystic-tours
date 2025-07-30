'use client';

import TourForm from '@/components/admin/tour-management/tour-form';
import TourList from '@/components/admin/tour-management/tour-list';
import TourView from '@/components/admin/tour-management/tour-view';
import { Tour } from '@/types/api/tour';
import { useState } from 'react';

export default function AdminToursPage() {
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const handleAddNew = () => {
    setSelectedTour(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleView = (tour: Tour) => {
    setSelectedTour(tour);
    setShowView(true);
  };

  const handleSave = async (tourData: Partial<Tour>) => {
    try {
      const url = formMode === 'create' ? '/api/admin/tours' : `/api/admin/tours/${selectedTour?.id}`;
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
      });

      if (response.ok) {
        setShowForm(false);
        setSelectedTour(null);
        // Refresh the tour list
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save tour');
      }
    } catch (err) {
      alert('Failed to save tour');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowView(false);
    setSelectedTour(null);
  };

  const handleViewEdit = () => {
    setShowView(false);
    setFormMode('edit');
    setShowForm(true);
  };

  return (
    <div className="pt-2">
      <h1 className="text-2xl font-bold text-[#388e3c] mb-4">Tour Management</h1>
      
      <TourList
        onEdit={handleEdit}
        onDelete={(tourId) => {
          // Delete functionality is handled in the TourList component
        }}
        onView={handleView}
        onAddNew={handleAddNew}
      />

      {/* Tour Form Modal */}
      {showForm && (
        <TourForm
          tour={selectedTour}
          onSave={handleSave}
          onCancel={handleCancel}
          mode={formMode}
        />
      )}

      {/* Tour View Modal */}
      {showView && selectedTour && (
        <TourView
          tour={selectedTour}
          onClose={handleCancel}
          onEdit={handleViewEdit}
        />
      )}
    </div>
  );
} 