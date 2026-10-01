import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, CheckCircle2, Circle, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function TodoTab() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: false });

    if (!error) setTodos(data || []);
    setLoading(false);
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: newTodo.trim(), due_date: dueDate || null }])
      .select();

    if (!error && data) {
      setTodos([data[0], ...todos]);
      setNewTodo('');
      setDueDate('');
    }
  }

  async function toggleComplete(id, currentStatus) {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (!error) {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_completed: !currentStatus } : todo
        )
      );
    }
  }

  async function deleteTodo(id) {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (!error) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  }

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat p-6 sm:p-10 -m-6 sm:-m-10"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1920&q=80')`,
      }}
    >
      {/* Full-Screen Dark Overlay for High Contrast */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs pointer-events-none" />

      {/* Main Content Container Centered On Fullscreen Background */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Tasks & To-Dos</h2>
            <p className="text-xs text-slate-300">Manage your daily checklist with due dates</p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 focus:outline-none focus:border-amber-400 text-white placeholder-slate-400 text-xs shadow-lg transition-all"
          />
          
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="pl-9 pr-3 py-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 focus:outline-none focus:border-amber-400 text-white text-xs shadow-lg transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {/* Task List */}
        {loading ? (
          <div className="flex justify-center items-center py-10 text-slate-300">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-amber-400" />
            <span>Loading tasks...</span>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/15 rounded-2xl bg-slate-900/40 backdrop-blur-md">
            <p className="text-sm text-slate-300">No tasks yet. Create one above!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg transition-all hover:border-amber-400/40"
              >
                <div
                  onClick={() => toggleComplete(todo.id, todo.is_completed)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  {todo.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-semibold ${
                        todo.is_completed
                          ? 'line-through text-slate-400'
                          : 'text-white'
                      }`}
                    >
                      {todo.title}
                    </span>
                    {todo.due_date && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Due: {todo.due_date}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}