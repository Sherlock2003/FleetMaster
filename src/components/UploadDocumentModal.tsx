import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { authenticatedFetch } from '../utils/api';
import { motion, AnimatePresence } from 'motion/react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId: string;
}

export default function UploadDocumentModal({ isOpen, onClose, onSuccess, vehicleId }: UploadDocumentModalProps) {
  const [type, setType] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('expiration_date', expirationDate);
      formData.append('file', file);

      const response = await authenticatedFetch(`/api/vehicles/${vehicleId}/documents`, {
        method: 'POST',
        body: formData,
        headers: {}, 
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload document');
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
              <h2 className="text-xl font-semibold text-white">Upload Document</h2>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Document Type</label>
                <input
                  type="text"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl outline-none"
                  placeholder="e.g., Insurance, Registration"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Expiration Date</label>
                <input
                  type="date"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl outline-none scheme-dark"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">File</label>
                <div className="relative group cursor-pointer">
                  <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        {file ? file.name : 'PDF, PNG, JPG up to 10MB'}
                      </p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
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
                  className="glass-button px-6 py-2 text-sm font-medium rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
