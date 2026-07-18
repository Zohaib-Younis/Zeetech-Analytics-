import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Lock, Mail, ArrowRight, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login({ onLogin }) {
  const [view, setView]           = useState('login'); // 'login' | 'forgot'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ── Login handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please confirm your email first, or ask admin to auto-confirm.');
        } else {
          setError(authError.message);
        }
        return;
      }
      if (data?.session) {
        if (rememberMe) localStorage.setItem('rememberedAuth', 'true');
        onLogin(data.session);
      }
    } catch {
      setError('Connection error. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password handler ───────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: window.location.origin }
      );
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccessMsg(`Password reset link sent to ${forgotEmail}. Check your inbox.`);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
            {view === 'forgot' ? <KeyRound className="w-8 h-8" /> : <BrainCircuit className="w-8 h-8" />}
          </div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-center text-3xl font-display font-extrabold text-text-main">
          {view === 'forgot' ? 'Reset Password' : 'HawkEye Intelligence'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-2 text-center text-sm text-text-muted">
          {view === 'forgot'
            ? 'Enter your email and we\'ll send a reset link'
            : 'Sign in to access your analytics dashboard'}
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-card py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-border-main">

          <AnimatePresence mode="wait">

            {/* ── LOGIN FORM ── */}
            {view === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-muted" />
                    </div>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                      className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-border-main rounded-xl shadow-sm placeholder-text-muted bg-dashboard-bg/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-text-main transition-colors"
                      placeholder="adeel@gmail.com" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-muted" />
                    </div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
                      className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-border-main rounded-xl shadow-sm placeholder-text-muted bg-dashboard-bg/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-text-main transition-colors"
                      placeholder="•••••••" required />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                    {error}
                  </motion.p>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loading}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-border-main rounded cursor-pointer" />
                    <span className="text-sm text-text-main">Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-sm text-purple-500 hover:text-purple-400 font-semibold transition-colors">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="ml-1 w-4 h-4" /></>}
                </button>
              </motion.form>
            )}

            {/* ── FORGOT PASSWORD FORM ── */}
            {view === 'forgot' && (
              <motion.form key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-muted" />
                    </div>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} disabled={loading}
                      className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-border-main rounded-xl shadow-sm placeholder-text-muted bg-dashboard-bg/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-text-main transition-colors"
                      placeholder="adeel@gmail.com" required />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                    {error}
                  </motion.p>
                )}
                {successMsg && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-emerald-500 text-center bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                    {successMsg}
                  </motion.p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><KeyRound className="w-4 h-4" /> Send Reset Link</>}
                </button>

                <button type="button" onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-purple-500 font-semibold transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-4 text-center text-[11px] text-text-muted">
          Authentication secured by{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
            className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
            Supabase
          </a>
        </p>
      </motion.div>
    </div>
  );
}
