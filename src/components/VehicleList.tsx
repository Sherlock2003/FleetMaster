import React, { useEffect, useState } from 'react';
import { Vehicle } from '../types';
import VehicleCard from './VehicleCard';
import { Search, Plus, Filter } from 'lucide-react';
import AddVehicleModal from './AddVehicleModal';
import { authenticatedFetch } from '../utils/api';
import { motion } from 'motion/react';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Available' | 'Rented' | 'Maintenance'>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicles = async () => {
    try {
      const response = await authenticatedFetch('/api/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesFilter = filter === 'All' || vehicle.status === filter;
    const matchesSearch =
      vehicle.make.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center text-red-500 dark:text-red-400 py-10 glass-panel rounded-xl">
      Error: {error}
    </div>
  );

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row gap-6 justify-between items-center glass-panel p-6 rounded-2xl"
      >
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search make, model, or plate..."
            className="w-full pl-12 pr-4 py-3 rounded-xl glass-input outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 items-center no-scrollbar">
          {['All', 'Available', 'Rented', 'Maintenance'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                filter === status
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {status}
            </button>
          ))}
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-2 glass-button px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      </motion.div>

      {filteredVehicles.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 glass-panel rounded-2xl border-dashed border-slate-300 dark:border-slate-700"
        >
          <p className="text-slate-500 dark:text-slate-400 text-lg">No vehicles found matching your criteria.</p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <VehicleCard vehicle={vehicle} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {isModalOpen && (
        <AddVehicleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
                fetchVehicles();
                setIsModalOpen(false);
            }}
        />
      )}
    </div>
  );
}
