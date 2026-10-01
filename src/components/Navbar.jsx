import React from 'react';
import NotificationDropdown from './NotificationDropdown';
import { Menu, LogOut } from 'lucide-react';

export default function Navbar({ onLogout, toggleSidebar }) {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xl font-black tracking-widest bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          RAVINDRA
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Dropdown with Due Today & Tomorrow Reminders */}
        <NotificationDropdown />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="px-3.5 py-2 text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}