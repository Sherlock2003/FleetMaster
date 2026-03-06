import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { authenticatedFetch } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';

interface LogServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId: string;
}

export default function LogServiceModal({ isOpen, onClose, onSuccess, vehicleId }: LogServiceModalProps) {
  const [description, setDescription] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [cost, setCost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authenticatedFetch(`/api/vehicles/${vehicleId}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          service_date: serviceDate,
          cost: parseFloat(cost),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to log service');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-xl font-semibold text-white">Log Service</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <input
                  type="text"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                  placeholder="e.g., Oil Change, Brake Replacement"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Service Date</label>
                <input
                  type="date"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl outline-none scheme-dark"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cost ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button px-6 py-2 text-sm font-medium rounded-xl disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
