import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, FileText, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 dark:text-slate-200 transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 glass-panel border-r border-white/5 flex flex-col z-20 m-4 rounded-2xl"
      >
        <div className="p-8 border-b border-white/5">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <Car className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            FleetMaster
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'relative flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 group overflow-hidden',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-indigo-600/90 dark:bg-indigo-600/20 border border-indigo-500/30 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={clsx("w-5 h-5 z-10 transition-colors", isActive ? "text-white dark:text-indigo-400" : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />
                <span className="z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="glass-card p-4 rounded-xl mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={user?.name}>{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={user?.email}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="px-8 py-6 flex items-center justify-between z-10">
          <motion.h2 
            key={location.pathname}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {navItems.find((item) => item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href))?.name || 'Dashboard'}
          </motion.h2>
          
          {/* Header Actions could go here */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full glass-card flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
              <Settings className="w-5 h-5" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
