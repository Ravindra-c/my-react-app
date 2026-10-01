import React, { useState, useEffect } from 'react';
import { Bell, Calendar, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [upcomingTodos, setUpcomingTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUpcomingTodos();
  }, []);

  async function fetchUpcomingTodos() {
    setLoading(true);

    // Calculate Today & Tomorrow date strings (YYYY-MM-DD)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch non-completed tasks due today or tomorrow
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('is_completed', false)
      .gte('due_date', todayStr)
      .lte('due_date', tomorrowStr)
      .order('due_date', { ascending: true });

    if (!error) {
      setUpcomingTodos(data || []);
    }
    setLoading(false);
  }

  // Label due date relative to today
  const getDueLabel = (dateStr) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr === todayStr) {
      return { text: 'Due Today', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { text: 'Due Tomorrow', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchUpcomingTodos();
        }}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {upcomingTodos.length > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-100">Upcoming Reminders</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List Content */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-xs text-center text-slate-500 py-6">Checking tasks...</p>
            ) : upcomingTodos.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">All caught up!</p>
                <p className="text-[11px] text-slate-500">No pending tasks due today or tomorrow.</p>
              </div>
            ) : (
              upcomingTodos.map((todo) => {
                const label = getDueLabel(todo.due_date);
                return (
                  <div
                    key={todo.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-slate-200 line-clamp-2">{todo.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold flex-shrink-0 ${label.color}`}>
                        {label.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{todo.due_date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}