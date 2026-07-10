import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Lock, Loader2,
  Eye, EyeOff, AlertCircle, KeyRound,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── small helper ────────────────────────────────────────────────────────────
function Alert({ type = 'error', msg }) {
  if (!msg) return null;
  const styles = {
    error:   'bg-red-500/10 border-red-500/20 text-red-500',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    info:    'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
  };
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${styles[type]}`}>
      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{msg}</span>
    </motion.div>
  );
}

function InputField({ label, value, onChange, placeholder, disabled, show, onToggle }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full text-sm px-3 py-2.5 border border-border-main rounded-xl bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none text-text-main transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-9"
        />
        <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-purple-500 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Auth Settings Panel ─────────────────────────────────────────────────
export default function AuthSettingsPanel({ onLogout }) {
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [msg, setMsg]                 = useState({ type: '', text: '' });

  const isCodeAuth = localStorage.getItem('codeAuth') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (newPass.length < 6) { setMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
    if (newPass !== confirmPass) { setMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) {
        setMsg({ type: 'error', text: error.message });
      } else {
        setMsg({ type: 'success', text: 'Password updated successfully! Logging you out...' });
        setNewPass(''); setConfirmPass('');
        setTimeout(() => { if (onLogout) onLogout(); }, 2000);
      }
    } catch {
      setMsg({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
          <ShieldCheck className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-text-main">Auth Settings</h2>
          <p className="text-xs text-text-muted mt-0.5">Change your account password</p>
        </div>
      </div>

      {/* Password Card */}
      <div className="glass-card rounded-2xl border border-border-main overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-main">
          <span className="p-2 rounded-xl border text-purple-500 bg-purple-500/10 border-purple-500/20">
            <Lock className="w-4 h-4" />
          </span>
          <h4 className="font-bold text-sm text-text-main">Change Password</h4>
        </div>
        <div className="p-5 space-y-4">
          {isCodeAuth ? (
            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-500 p-4 rounded-xl text-xs leading-relaxed">
              <strong>Restricted Action:</strong> You are logged in using a temporary recovery code. To change your password, you must use the Supabase dashboard directly, or log in with your current password first.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <InputField
                label="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min. 6 characters"
                disabled={loading}
                show={showNew}
                onToggle={() => setShowNew(p => !p)}
              />
              <InputField
                label="Confirm New Password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repeat new password"
                disabled={loading}
                show={showConf}
                onToggle={() => setShowConf(p => !p)}
              />
              <Alert type={msg.type} msg={msg.text} />
              <button type="submit" disabled={loading || !newPass || !confirmPass}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><KeyRound className="w-4 h-4" /> Update Password</>}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-indigo-500">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold mb-0.5">Managing users via Supabase Dashboard</p>
          <p className="text-indigo-400 leading-relaxed">
            For user management, visit{' '}
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="underline hover:text-indigo-300 transition-colors">
              supabase.com/dashboard
            </a>{' '}
            → Authentication → Users. You can add, delete, ban, or reset any user from there.
          </p>
        </div>
      </div>
    </div>
  );
}
