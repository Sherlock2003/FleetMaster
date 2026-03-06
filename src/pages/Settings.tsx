import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Bell, Database, Save, LogOut, Download, AlertTriangle, Wrench, Moon, Sun, Monitor } from 'lucide-react';
import { authenticatedFetch } from '../utils/api';
import { motion } from 'motion/react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'data' | 'appearance'>('profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mock settings state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    maintenanceReminders: true,
    documentExpiry: true,
  });

  const handleSaveNotifications = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage('Notification settings saved successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/vehicles');
      const data = await response.json();
      
      // Create CSV content
      const headers = ['Make', 'Model', 'Year', 'VIN', 'License Plate', 'Status'];
      const csvContent = [
        headers.join(','),
        ...data.map((v: any) => 
          [v.make, v.model, v.year, v.vin, v.license_plate, v.status].join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-white tracking-tight"
      >
        Settings
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-2xl overflow-hidden"
      >
        <div className="border-b border-white/5">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'appearance', icon: Monitor, label: 'Appearance' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'data', icon: Database, label: 'Data Management' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-5 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400 bg-white/5'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 min-h-96">
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              {successMessage}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-lg font-medium text-white mb-4">User Profile</h3>
                <div className="glass-card p-6 rounded-xl max-w-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg shadow-indigo-500/20">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-white text-lg">{user?.name || 'User'}</p>
                      <p className="text-sm text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono bg-slate-950/50 p-2 rounded-lg border border-white/5">
                    User ID: {user?.uid}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Account Actions</h3>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20 hover:border-red-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Theme Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      theme === 'dark'
                        ? 'border-indigo-500 bg-slate-800/50'
                        : 'border-white/5 bg-slate-900/30 hover:bg-slate-800/50 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white">Dark Mode</p>
                      <p className="text-xs text-slate-400">Easy on the eyes, perfect for low light.</p>
                    </div>
                    {theme === 'dark' && <div className="ml-auto w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      theme === 'light'
                        ? 'border-indigo-500 bg-slate-100'
                        : 'border-white/5 bg-slate-900/30 hover:bg-slate-800/50 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${theme === 'light' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Light Mode</p>
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Bright and clear, high contrast.</p>
                    </div>
                    {theme === 'light' && <div className="ml-auto w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 max-w-lg"
            >
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Email Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-5 glass-card rounded-xl cursor-pointer hover:bg-slate-800/60 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                        <Bell className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Document Expiration Alerts</p>
                        <p className="text-xs text-slate-400">Get notified when insurance or registration is expiring</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.documentExpiry}
                      onChange={(e) => setNotifications({ ...notifications, documentExpiry: e.target.checked })}
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-600 bg-slate-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-5 glass-card rounded-xl cursor-pointer hover:bg-slate-800/60 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                        <Wrench className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Maintenance Reminders</p>
                        <p className="text-xs text-slate-400">Get reminders for scheduled maintenance</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.maintenanceReminders}
                      onChange={(e) => setNotifications({ ...notifications, maintenanceReminders: e.target.checked })}
                      className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-600 bg-slate-900"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="glass-button px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Export Data</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Download a CSV file containing all vehicle data, including status, VIN, and license plate information.
                </p>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="glass-button-secondary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {loading ? 'Exporting...' : 'Export Vehicles CSV'}
                </button>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h3 className="text-lg font-medium text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h3>
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-400">Delete All Data</p>
                    <p className="text-sm text-red-400/70">This action cannot be undone. All vehicles and logs will be lost.</p>
                  </div>
                  <button
                    disabled
                    className="px-5 py-2.5 bg-transparent border border-red-500/30 text-red-400 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed hover:bg-red-500/10 transition-colors"
                    title="Contact administrator to perform this action"
                  >
                    Delete Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}