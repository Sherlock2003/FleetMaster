import React, { useEffect, useState } from 'react';
import { authenticatedFetch } from '../utils/api';
import { motion } from 'motion/react';
import { Car, Wrench, FileText, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import AddVehicleModal from '../components/AddVehicleModal';

interface DashboardData {
  vehicleStatus: { status: string; count: number }[];
  maintenanceCosts: { month: string; total_cost: number }[];
  documentStatus: { name: string; value: number }[];
  recentActivity: any[];
  recentVehicles: any[];
}

const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await authenticatedFetch('/api/reports/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return null;

  const totalVehicles = data.vehicleStatus.reduce((acc, curr) => acc + curr.count, 0);
  const availableVehicles = data.vehicleStatus.find(s => s.status === 'Available')?.count || 0;
  const rentedVehicles = data.vehicleStatus.find(s => s.status === 'Rented')?.count || 0;
  const maintenanceVehicles = data.vehicleStatus.find(s => s.status === 'Maintenance')?.count || 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's what's happening with your fleet today.</p>
        </div>
        <button 
          onClick={() => setIsAddVehicleModalOpen(true)}
          className="glass-button px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Vehicles" 
          value={totalVehicles} 
          icon={Car} 
          color="text-blue-400" 
          bg="bg-blue-500/10" 
          border="border-blue-500/20"
        />
        <StatCard 
          title="Available" 
          value={availableVehicles} 
          icon={CheckCircle} 
          color="text-emerald-400" 
          bg="bg-emerald-500/10" 
          border="border-emerald-500/20"
        />
        <StatCard 
          title="Rented" 
          value={rentedVehicles} 
          icon={Clock} 
          color="text-amber-400" 
          bg="bg-amber-500/10" 
          border="border-amber-500/20"
        />
        <StatCard 
          title="In Maintenance" 
          value={maintenanceVehicles} 
          icon={Wrench} 
          color="text-red-400" 
          bg="bg-red-500/10" 
          border="border-red-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {data.recentActivity.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4 glass-card rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                    <Wrench className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{log.description}</p>
                    <p className="text-xs text-slate-400">{log.make} {log.model} • {log.license_plate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">${log.cost}</p>
                  <p className="text-xs text-slate-500">{new Date(log.service_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <p className="text-center text-slate-500 py-8">No recent activity found.</p>
            )}
          </div>
        </motion.div>

        {/* Fleet Status Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-6 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Fleet Status</h3>
          <div className="flex-1 min-h-62.5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.vehicleStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.vehicleStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.vehicleStatus.map((status) => (
              <div key={status.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(status.status) }} />
                  <span className="text-slate-300">{status.status}</span>
                </div>
                <span className="font-medium text-white">{status.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Vehicles */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Recently Added Vehicles</h3>
          <Link to="/vehicles" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {data.recentVehicles.map((vehicle: any) => (
            <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`} className="glass-card p-4 rounded-xl hover:bg-white/5 transition-all group">
              <div className="aspect-video bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                 {/* Simple placeholder logic for dashboard cards */}
                 <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold text-xs">
                    {vehicle.make}
                 </div>
              </div>
              <h4 className="font-medium text-white truncate group-hover:text-indigo-400 transition-colors">{vehicle.year} {vehicle.make} {vehicle.model}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">{vehicle.license_plate}</p>
              <div className="mt-2 flex justify-between items-center">
                 <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    vehicle.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    vehicle.status === 'Rented' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                 }`}>
                    {vehicle.status}
                 </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <AddVehicleModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, border }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl ${bg} ${border} border flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
    </motion.div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Available': return '#10B981';
    case 'Rented': return '#3B82F6';
    case 'Maintenance': return '#EF4444';
    default: return '#64748B';
  }
}
