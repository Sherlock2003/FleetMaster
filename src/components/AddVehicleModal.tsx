import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { authenticatedFetch } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';
import { VEHICLE_MAKES } from '../constants/vehicles';
import { Vehicle } from '../types';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle?: Vehicle; // Optional vehicle for editing
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess, vehicle }: AddVehicleModalProps) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    status: 'Available',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Initialize form data when vehicle prop changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        status: vehicle.status,
      });
      // Check if make/model are in the list, if not set manual entry
      const isKnownMake = VEHICLE_MAKES.some(v => v.make === vehicle.make);
      setIsManualEntry(!isKnownMake);
    } else {
      // Reset for add mode
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        license_plate: '',
        status: 'Available',
      });
      setIsManualEntry(false);
    }
  }, [vehicle, isOpen]);

  const availableModels = VEHICLE_MAKES.find(v => v.make === formData.make)?.models || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = vehicle ? `/api/vehicles/${vehicle.id}` : '/api/vehicles';
      const method = vehicle ? 'PUT' : 'POST';

      const response = await authenticatedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${vehicle ? 'update' : 'add'} vehicle`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, make: e.target.value, model: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-panel rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/5">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
              <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsManualEntry(!isManualEntry);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  {isManualEntry ? 'Select from list' : 'Enter manually'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Make</label>
                  {isManualEntry ? (
                    <input
                      type="text"
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      placeholder="e.g. Toyota"
                    />
                  ) : (
                    <select
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl outline-none bg-slate-100 dark:bg-slate-900"
                      value={formData.make}
                      onChange={handleMakeChange}
                    >
                      <option value="">Select Make</option>
                      {VEHICLE_MAKES.map((v) => (
                        <option key={v.make} value={v.make}>{v.make}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Model</label>
                  {isManualEntry ? (
                    <input
                      type="text"
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. Camry"
                    />
                  ) : (
                    <select
                      required
                      className="glass-input w-full px-4 py-3 rounded-xl outline-none bg-slate-100 dark:bg-slate-900"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      disabled={!formData.make}
                    >
                      <option value="">Select Model</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Year</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                  <select
                    className="glass-input w-full px-4 py-3 rounded-xl outline-none bg-slate-100 dark:bg-slate-900"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">VIN</label>
                <input
                  type="text"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl outline-none uppercase font-mono"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">License Plate</label>
                <input
                  type="text"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl outline-none uppercase font-mono"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button px-6 py-2 text-sm font-medium rounded-xl disabled:opacity-50"
                >
                  {loading ? (vehicle ? 'Updating...' : 'Adding...') : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
