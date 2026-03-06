import React, { useEffect, useState } from 'react';
import { authenticatedFetch } from '../utils/api';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsData {
  vehicleStatus: { status: string; count: number }[];
  maintenanceCosts: { month: string; total_cost: number }[];
  documentStatus: { name: string; value: number }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];
const DOC_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authenticatedFetch('/api/reports/dashboard');
        if (!response.ok) throw new Error('Failed to fetch reports data');
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-400 glass-panel rounded-xl">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-white tracking-tight"
      >
        Fleet Analytics
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Status Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-8 rounded-2xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Vehicle Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.vehicleStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                  stroke="none"
                >
                  {data.vehicleStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Document Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-8 rounded-2xl"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Document Compliance Status</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.documentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.documentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DOC_COLORS[index % DOC_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Maintenance Costs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-8 rounded-2xl col-span-1 lg:col-span-2"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Maintenance Costs (Last 6 Months)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.maintenanceCosts}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="total_cost" name="Total Cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
