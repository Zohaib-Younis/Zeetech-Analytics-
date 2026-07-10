import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Lock, Mail, ArrowRight, Loader2, KeyRound, ArrowLeft, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Web3Forms API Endpoint
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const ADMIN_EMAIL = 'mr.zohaibyounis@gmail.com';

export default function Login({ onLogin }) {
  const [view, setView]           = useState('login'); // 'login' | 'forgot' | 'verify'
  
  // Login State
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password / Custom Flow State
  const [forgotEmail, setForgotEmail] = useState('');
  const [inputCode, setInputCode]     = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  // UI State
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);

  // Rate Limiting
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  useEffect(() => {
    // Load attempts from local storage on mount
    const saved = localStorage.getItem('passwordResetAttempts');
    if (saved !== null) {
      setAttemptsRemaining(parseInt(saved, 10));
    }
  }, []);

  const updateAttempts = (newCount) => {
    setAttemptsRemaining(newCount);
    localStorage.setItem('passwordResetAttempts', newCount.toString());
  };

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

  // ── Custom Forgot Password (Web3Forms) ──────────────────────────────────
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (attemptsRemaining <= 0) {
      setError('You have exceeded the maximum number of password reset requests (5).');
      return;
    }

    // You MUST provide a Web3Forms Access key via Vite env vars, or hardcode it here if absolutely needed.
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setError('System Error: Web3Forms Access Key is missing. Check your .env file or Vercel configuration.');
      return;
    }

    setLoading(true);
    
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: 'Security Alert: Password Reset Code Request',
          from_name: 'HawkEye Intelligence',
          // Send TO the admin email
          email: ADMIN_EMAIL, 
          message: `User ${forgotEmail.trim()} requested a password reset.\n\nTheir secure login code is: ${code}\n\nProvide this code to the user securely.`,
        })
      });

      const json = await response.json();

      if (response.ok && json.success) {
        updateAttempts(attemptsRemaining - 1);
        setSuccessMsg(`Code sent! You have ${attemptsRemaining - 1} requests remaining.`);
        setTimeout(() => {
          setView('verify');
          setSuccessMsg('');
        }, 1500);
      } else {
        setError(json.message || 'Failed to send code via Web3Forms.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify Code ──────────────────────────────────────────────────────────
  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError('');
    
    if (inputCode.trim() === generatedCode) {
      // Bypass Supabase Auth completely
      localStorage.setItem('codeAuth', 'true');
      onLogin(true);
    } else {
      setError('Invalid code. Please check the code and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
            {view === 'forgot' ? <ShieldAlert className="w-8 h-8" /> : view === 'verify' ? <KeyRound className="w-8 h-8" /> : <BrainCircuit className="w-8 h-8" />}
          </div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-center text-3xl font-display font-extrabold text-text-main">
          {view === 'forgot' ? 'Request Code' : view === 'verify' ? 'Enter Code' : 'HawkEye Intelligence'}
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-2 text-center text-sm text-text-muted">
          {view === 'forgot'
            ? `Admin will receive your code (Attempts left: ${attemptsRemaining})`
            : view === 'verify'
            ? `Enter the 6-digit code provided by admin`
            : 'Sign in to access your analytics dashboard'}
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-card py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-border-main overflow-hidden">

          <AnimatePresence mode="wait">

            {/* ── LOGIN FORM ── */}
            {view === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} className="space-y-6" onSubmit={handleSubmit}>
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

            {/* ── FORGOT PASSWORD (REQUEST CODE) FORM ── */}
            {view === 'forgot' && (
              <motion.form key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} className="space-y-6" onSubmit={handleRequestCode}>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">Your Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-muted" />
                    </div>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} disabled={loading || attemptsRemaining <= 0}
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

                <button type="submit" disabled={loading || attemptsRemaining <= 0}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><ShieldAlert className="w-4 h-4" /> Request Code</>}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-purple-500 font-semibold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Sign In
                  </button>
                  {generatedCode && (
                    <button type="button" onClick={() => { setView('verify'); setError(''); setSuccessMsg(''); }}
                      className="text-sm text-purple-500 hover:text-purple-400 font-semibold transition-colors">
                      Enter Code →
                    </button>
                  )}
                </div>
              </motion.form>
            )}

            {/* ── VERIFY CODE FORM ── */}
            {view === 'verify' && (
              <motion.form key="verify" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} className="space-y-6" onSubmit={handleVerifyCode}>
                
                <div className="text-center mb-6">
                  <p className="text-sm text-text-muted">
                    We sent a 6-digit code to the admin.
                    <br />Please enter it below to login.
                  </p>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-text-muted" />
                    </div>
                    <input type="text" value={inputCode} onChange={(e) => setInputCode(e.target.value)} disabled={loading}
                      className="appearance-none block w-full pl-10 pr-3 py-3 text-center tracking-[0.5em] font-mono text-xl border border-border-main rounded-xl shadow-sm placeholder-text-muted/50 bg-dashboard-bg/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-text-main transition-colors"
                      placeholder="------" maxLength={6} required />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                    {error}
                  </motion.p>
                )}

                <button type="submit" disabled={inputCode.length !== 6}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                  Verify & Login <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button type="button" onClick={() => { setView('forgot'); setError(''); }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-purple-500 font-semibold transition-colors mt-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Request
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
