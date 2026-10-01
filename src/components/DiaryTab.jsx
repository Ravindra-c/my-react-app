import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Calendar, Trash2, Loader2, Smile, Frown, Meh, Sun, Sparkles, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const MOODS = [
  { name: 'Happy', icon: Smile, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' },
  { name: 'Neutral', icon: Meh, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' },
  { name: 'Sad', icon: Frown, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30' },
  { name: 'Productive', icon: Sun, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30' },
  { name: 'Inspired', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30' },
];

export default function DiaryTab() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Happy');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [activeEntry, setActiveEntry] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (!error) setEntries(data || []);
    setLoading(false);
  }

  async function saveEntry(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const { data, error } = await supabase
      .from('diary_entries')
      .insert([{ title: title.trim(), content: content.trim(), mood, entry_date: entryDate }])
      .select();

    if (!error && data) {
      setEntries([data[0], ...entries]);
      setTitle('');
      setContent('');
      setShowEditor(false);
    }
  }

  async function deleteEntry(id, e) {
    e.stopPropagation();
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    if (!error) {
      setEntries(entries.filter((entry) => entry.id !== id));
      if (activeEntry?.id === id) setActiveEntry(null);
    }
  }

  const filteredEntries = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Personal Diary & Reflections</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Capture your daily thoughts, ideas, and memories</p>
          </div>
        </div>

        <button
          onClick={() => setShowEditor(!showEditor)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          {showEditor ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {/* Editor Modal / Form */}
      {showEditor && (
        <form onSubmit={saveEntry} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Write Today's Thought</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Entry Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">How are you feeling?</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setMood(m.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      mood === m.name ? m.color : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            placeholder="Dear Diary, today I..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />

          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-emerald-600/20"
          >
            Save Entry
          </button>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search diary entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-sm"
        />
      </div>

      {/* Entries List Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500 mr-2" />
          <span>Loading diary entries...</span>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No diary entries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => {
            const moodConfig = MOODS.find((m) => m.name === entry.mood) || MOODS[0];
            const MoodIcon = moodConfig.icon;

            return (
              <div
                key={entry.id}
                onClick={() => setActiveEntry(entry)}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 dark:hover:border-amber-500/30 rounded-2xl cursor-pointer transition-all space-y-3 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {entry.entry_date}
                    </span>

                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${moodConfig.color}`}>
                      <MoodIcon className="w-3 h-3" />
                      {entry.mood}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{entry.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {entry.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
                  <button
                    onClick={(e) => deleteEntry(entry.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Entry Reader Modal */}
      {activeEntry && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {activeEntry.entry_date}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeEntry.title}</h3>
              </div>
              <button 
                onClick={() => setActiveEntry(null)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{activeEntry.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}