import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { Vehicle } from '../types';
import StatusBadge from './StatusBadge';
import { motion } from 'motion/react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const [imageError, setImageError] = useState(false);

  // Determine the image source
  const imageSource = vehicle.image_path 
    ? vehicle.image_path 
    : `https://logo.clearbit.com/${vehicle.make.toLowerCase()}.com`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!imageError) {
      setImageError(true);
      e.currentTarget.src = `https://placehold.co/600x400/1e293b/94a3b8?text=${vehicle.make}+${vehicle.model}`;
    }
  };

  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="block glass-card rounded-2xl overflow-hidden group relative"
      >
        <div className="aspect-video bg-slate-800 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
          <img
            src={imageError ? `https://placehold.co/600x400/1e293b/94a3b8?text=${vehicle.make}+${vehicle.model}` : imageSource}
            alt={`${vehicle.make} ${vehicle.model}`}
            onError={handleImageError}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!vehicle.image_path && !imageError ? 'object-contain p-8 bg-slate-100 dark:bg-slate-900' : ''}`}
          />
          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={vehicle.status} />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent opacity-60" />
        </div>
        
        <div className="p-5 relative">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono tracking-wider">{vehicle.license_plate}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2">
              <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="truncate font-mono text-xs" title={vehicle.vin}>VIN: {vehicle.vin}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default VehicleCard;
