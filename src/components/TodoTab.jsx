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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <CheckSquare className="w-7 h-7 text-indigo-500" />
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tasks & To-Dos</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your daily checklist with due dates</p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm shadow-inner transition-colors"
        />
        
        {/* Date Input */}
        <div className="relative flex items-center">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="pl-9 pr-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 text-sm shadow-inner transition-colors"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Task List */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-500" />
          <span>Loading tasks...</span>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <p className="text-sm text-slate-500 dark:text-slate-400">No tasks yet. Create one above!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              <div
                onClick={() => toggleComplete(todo.id, todo.is_completed)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                {todo.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      todo.is_completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {todo.title}
                  </span>
                  {todo.due_date && (
                    <span className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Due: {todo.due_date}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}