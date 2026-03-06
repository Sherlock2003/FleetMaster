import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vehicle, Document, MaintenanceLog, Media } from '../types';
import { ArrowLeft, FileText, Wrench, Image as ImageIcon, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { authenticatedFetch } from '../utils/api';
import UploadDocumentModal from './UploadDocumentModal';
import UploadMediaModal from './UploadMediaModal';
import LogServiceModal from './LogServiceModal';
import AddVehicleModal from './AddVehicleModal';
import { motion, AnimatePresence } from 'motion/react';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle & { documents: Document[], maintenance: MaintenanceLog[], media: Media[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'maintenance' | 'media'>('overview');
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isUploadMediaModalOpen, setIsUploadMediaModalOpen] = useState(false);
  const [isLogServiceModalOpen, setIsLogServiceModalOpen] = useState(false);
  const [isEditVehicleModalOpen, setIsEditVehicleModalOpen] = useState(false);

  const fetchVehicle = useCallback(async () => {
    if (!id) return;
    try {
      const response = await authenticatedFetch(`/api/vehicles/${id}`);
      if (!response.ok) throw new Error('Failed to fetch vehicle');
      const data = await response.json();
      setVehicle(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!vehicle) return (
    <div className="text-center py-20 glass-panel rounded-2xl border-dashed border-slate-300 dark:border-slate-700">
      <p className="text-red-500 dark:text-red-400 text-lg">Vehicle not found</p>
    </div>
  );

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors gap-2 text-sm font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </motion.button>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 font-mono">
            <span className="bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-200 dark:border-white/5">VIN: {vehicle.vin}</span>
            <span className="bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded border border-slate-200 dark:border-white/5">Plate: {vehicle.license_plate}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditVehicleModalOpen(true)}
            className="glass-button px-5 py-2.5 rounded-xl text-sm font-medium"
          >
            Edit Vehicle
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-white/5">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: FileText },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'media', label: 'Photos', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-all duration-300
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel rounded-2xl min-h-100 overflow-hidden"
      >
        {activeTab === 'overview' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Vehicle Stats</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-xl">
                  <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Maintenance Cost</dt>
                  <dd className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${vehicle.maintenance.reduce((acc, log) => acc + log.cost, 0).toFixed(2)}
                  </dd>
                </div>
                <div className="glass-card p-5 rounded-xl">
                  <dt className="text-sm text-slate-500 dark:text-slate-400 mb-1">Documents</dt>
                  <dd className="text-2xl font-bold text-slate-900 dark:text-white">
                    {vehicle.documents.length}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              <ul className="space-y-4">
                {vehicle.maintenance.slice(0, 3).map((log) => (
                  <li key={log.id} className="flex gap-4 items-start glass-card p-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                      <Wrench className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{log.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{format(new Date(log.service_date), 'MMM d, yyyy')}</p>
                    </div>
                  </li>
                ))}
                {vehicle.maintenance.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No recent activity recorded.</p>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Compliance Documents</h3>
              <button 
                onClick={() => setIsUploadDocModalOpen(true)}
                className="glass-button-secondary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Upload Document
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicle.documents.map((doc) => {
                const expired = isExpired(doc.expiration_date);
                return (
                  <div key={doc.id} className={`p-5 rounded-xl border transition-all ${expired ? 'bg-red-500/5 border-red-500/20' : 'glass-card'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-medium text-slate-900 dark:text-white">{doc.type}</span>
                      {expired ? (
                        <span className="px-2.5 py-1 bg-red-500/10 text-red-500 dark:text-red-400 text-xs rounded-full font-medium flex items-center gap-1 border border-red-500/20">
                          <AlertTriangle className="w-3 h-3" /> Expired
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-medium flex items-center gap-1 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Valid
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Expires: {format(new Date(doc.expiration_date), 'MMM d, yyyy')}</p>
                    {doc.file_path && (
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
                        <FileText className="w-3 h-3" /> View Document
                      </a>
                    )}
                  </div>
                );
              })}
              {vehicle.documents.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 glass-card rounded-xl border-dashed border-slate-300 dark:border-slate-700">
                  No documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Service History</h3>
              <button 
                onClick={() => setIsLogServiceModalOpen(true)}
                className="glass-button-secondary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Log Service
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/5">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 bg-white/50 dark:bg-slate-900/20">
                  {vehicle.maintenance.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                        {format(new Date(log.service_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{log.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white text-right font-mono">
                        ${log.cost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {vehicle.maintenance.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-500">
                        No maintenance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Vehicle Photos</h3>
              <button 
                onClick={() => setIsUploadMediaModalOpen(true)}
                className="glass-button-secondary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Upload Photo
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {vehicle.media.map((item) => (
                <div key={item.id} className="group relative aspect-square glass-card rounded-xl overflow-hidden">
                  <img src={item.file_path} alt={item.type} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white text-sm font-medium px-3 py-1 bg-white/10 rounded-full border border-white/20">{item.type}</span>
                  </div>
                </div>
              ))}
              {vehicle.media.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 glass-card rounded-xl border-dashed border-slate-300 dark:border-slate-700">
                  No photos uploaded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {id && (
        <>
          <UploadDocumentModal
            isOpen={isUploadDocModalOpen}
            onClose={() => setIsUploadDocModalOpen(false)}
            onSuccess={fetchVehicle}
            vehicleId={id}
          />
          <UploadMediaModal
            isOpen={isUploadMediaModalOpen}
            onClose={() => setIsUploadMediaModalOpen(false)}
            onSuccess={fetchVehicle}
            vehicleId={id}
          />
          <LogServiceModal
            isOpen={isLogServiceModalOpen}
            onClose={() => setIsLogServiceModalOpen(false)}
            onSuccess={fetchVehicle}
            vehicleId={id}
          />
          <AddVehicleModal
            isOpen={isEditVehicleModalOpen}
            onClose={() => setIsEditVehicleModalOpen(false)}
            onSuccess={fetchVehicle}
            vehicle={vehicle}
          />
        </>
      )}
    </div>
  );
}
