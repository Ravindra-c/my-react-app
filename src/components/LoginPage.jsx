import React, { useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Sign in using Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setLoading(false);
      onLogin(data.user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
      {/* Dynamic 3D ambient blur background blobs */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-indigo-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-amber-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>

      {/* 3D Card Container */}
      <div className="relative w-full max-w-md p-8 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_15px_rgba(99,102,241,0.2)] transition-transform hover:scale-[1.01] duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400 mt-2">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravindra@gmail.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 transition-colors shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium rounded-xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_25px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}