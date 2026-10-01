import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Trash2, X, MessageSquare, Loader2, Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const STICKY_COLORS = [
  { name: 'Gold', bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 border-amber-300/80 dark:border-amber-500/30 shadow-amber-900/5' },
  { name: 'Rose', bg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 border-rose-300/80 dark:border-rose-500/30 shadow-rose-900/5' },
  { name: 'Emerald', bg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 border-emerald-300/80 dark:border-emerald-500/30 shadow-emerald-900/5' },
  { name: 'Sky', bg: 'bg-sky-100 dark:bg-sky-950/40 text-sky-950 dark:text-sky-100 border-sky-300/80 dark:border-sky-500/30 shadow-sky-900/5' },
  { name: 'Purple', bg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 border-purple-300/80 dark:border-purple-500/30 shadow-purple-900/5' },
];

export default function GoalsTab() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0].bg);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [activeGoal, setActiveGoal] = useState(null);
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState('');
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setGoals(data || []);
    setLoading(false);
  }

  async function addGoal(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const { data, error } = await supabase
      .from('goals')
      .insert([{ title: title.trim(), description: description.trim(), color: selectedColor }])
      .select();

    if (!error && data) {
      setGoals([data[0], ...goals]);
      setTitle('');
      setDescription('');
      setShowAddModal(false);
    }
  }

  async function deleteGoal(id, e) {
    e.stopPropagation();
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) {
      setGoals(goals.filter((g) => g.id !== id));
      if (activeGoal?.id === id) setActiveGoal(null);
    }
  }

  async function openGoalDetail(goal) {
    setActiveGoal(goal);
    setLogLoading(true);
    const { data } = await supabase
      .from('goal_logs')
      .select('*')
      .eq('goal_id', goal.id)
      .order('created_at', { ascending: false });

    setLogs(data || []);
    setLogLoading(false);
  }

  async function addProgressLog(e) {
    e.preventDefault();
    if (!newLog.trim() || !activeGoal) return;

    const { data, error } = await supabase
      .from('goal_logs')
      .insert([{ goal_id: activeGoal.id, action_note: newLog.trim() }])
      .select();

    if (!error && data) {
      setLogs([data[0], ...logs]);
      setNewLog('');
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {/* Replaced Goal Symbol with Trophy */}
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Vision Board & Goals</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pin your aspirations and track daily progress</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" /> Pin New Goal
        </button>
      </div>

      {/* Corkboard Container with Motivational Background Image */}
      <div
        className="relative min-h-[500px] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        {/* Overlay to ensure dark/light mode board visibility */}
        <div className="absolute inset-0 bg-white/75 dark:bg-slate-900/80 backdrop-blur-xs pointer-events-none" />

        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {loading ? (
          <div className="flex justify-center items-center py-24 text-slate-500 dark:text-slate-400 relative z-10">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mr-2" />
            <span>Setting up your goal board...</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-24 relative z-10">
            <Trophy className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3 opacity-50" />
            <p className="text-slate-700 dark:text-slate-300 font-medium">Your Goal Board is empty!</p>
            <p className="text-xs text-slate-500 mt-1">Click "Pin New Goal" above to create your first note.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => openGoalDetail(goal)}
                className={`group relative p-5 rounded-2xl border shadow-md cursor-pointer transform transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[200px] ${
                  goal.color || STICKY_COLORS[0].bg
                }`}
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md z-20" />

                <div className="space-y-2">
                  <h3 className="font-bold text-base leading-snug break-words">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-xs opacity-80 line-clamp-4 whitespace-pre-line">{goal.description}</p>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-black/10 dark:border-white/10 mt-3 text-xs opacity-75 font-medium">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Click to log work
                  </span>
                  <button
                    onClick={(e) => deleteGoal(goal.id, e)}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors text-rose-700 dark:text-rose-400"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Create New Goal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Pin a New Goal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Goal Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Master System Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description / Plan</label>
                <textarea
                  placeholder="What is your plan to achieve this goal?"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Sticky Note Color</label>
                <div className="flex items-center gap-3">
                  {STICKY_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.bg)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${c.bg.split(' ')[0]} ${
                        selectedColor === c.bg ? 'scale-125 border-amber-500' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-md shadow-emerald-600/20"
              >
                Pin Goal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Goal Log & Progress Tracker */}
      {activeGoal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">Goal Details</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">{activeGoal.title}</h3>
                {activeGoal.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeGoal.description}</p>
                )}
              </div>
              <button onClick={() => setActiveGoal(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addProgressLog} className="flex gap-2">
              <input
                type="text"
                placeholder="Log what you did today for this goal..."
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-600/20"
              >
                <Send className="w-3.5 h-3.5" /> Log
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Work History Log</h4>
              {logLoading ? (
                <div className="py-8 text-center text-slate-500 text-xs">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No work logged yet. Record your action steps above!
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl space-y-1">
                    <p className="text-xs text-slate-800 dark:text-slate-200">{log.action_note}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}