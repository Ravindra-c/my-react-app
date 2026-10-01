import React from 'react';
import NotificationDropdown from './NotificationDropdown';
import { Menu, LogOut } from 'lucide-react';

export default function Navbar({ onLogout, toggleSidebar }) {
  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xl font-black tracking-widest bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-500 dark:from-amber-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
          RAVINDRA
        </span>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />

        <button
          onClick={onLogout}
          className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 dark:hover:bg-rose-600 rounded-xl transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}