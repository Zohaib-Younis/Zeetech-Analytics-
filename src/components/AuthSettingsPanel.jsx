import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Mail, Lock, UserPlus, Check, Loader2,
  Eye, EyeOff, AlertCircle, Users, KeyRound, Pencil, Trash2
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

function SectionCard({ icon: Icon, title, color = 'purple', children }) {
  const colors = {
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    emerald:'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  };
  return (
    <div className="glass-card rounded-2xl border border-border-main overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-main">
        <span className={`p-2 rounded-xl border ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </span>
        <h4 className="font-bold text-sm text-text-main">{title}</h4>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, disabled, showToggle, show, onToggle }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full text-sm px-3 py-2.5 border border-border-main rounded-xl bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none text-text-main transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-9"
        />
        {showToggle && (
          <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-purple-500 transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Change Email ─────────────────────────────────────────────────────────────
function ChangeEmailSection({ onLogout }) {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading]  = useState(false);
  const [msg, setMsg]          = useState({ type: '', text: '' });
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) setCurrentEmail(data.user.email);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!newEmail.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) {
        setMsg({ type: 'error', text: error.message });
      } else {
        setMsg({ type: 'success', text: 'Confirmation email sent! You will now be logged out. Please confirm the new email to log back in.' });
        setNewEmail('');
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 3000);
      }
    } catch {
      setMsg({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard icon={Mail} title="Change Email Address" color="indigo">
      {currentEmail && (
        <p className="text-xs text-text-muted">
          Current email: <span className="text-text-main font-semibold">{currentEmail}</span>
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <InputField
          label="New Email Address"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="newemail@example.com"
          disabled={loading}
        />
        <Alert type={msg.type} msg={msg.text} />
        <button type="submit" disabled={loading || !newEmail.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Mail className="w-4 h-4" /> Update Email</>}
        </button>
      </form>
    </SectionCard>
  );
}

// ── Change Password ───────────────────────────────────────────────────────────
function ChangePasswordSection({ onLogout }) {
  const [newPass, setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });

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
        setTimeout(() => {
          if (onLogout) onLogout();
        }, 2000);
      }
    } catch {
      setMsg({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard icon={Lock} title="Change Password" color="purple">
      <form onSubmit={handleSubmit} className="space-y-3">
        <InputField label="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
          placeholder="Min. 6 characters" disabled={loading}
          showToggle show={showNew} onToggle={() => setShowNew(p => !p)} />
        <InputField label="Confirm New Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
          placeholder="Repeat new password" disabled={loading}
          showToggle show={showConf} onToggle={() => setShowConf(p => !p)} />
        <Alert type={msg.type} msg={msg.text} />
        <button type="submit" disabled={loading || !newPass || !confirmPass}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><KeyRound className="w-4 h-4" /> Update Password</>}
        </button>
      </form>
    </SectionCard>
  );
}

// ── Create New User ──────────────────────────────────────────────────────────
function CreateUserSection() {
  const [newEmail, setNewEmail]   = useState('');
  const [newPass, setNewPass]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (newPass.length < 6) { setMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
    setLoading(true);
    try {
      // Use admin API via Supabase Edge Functions / or signUp with auto-confirm
      const { data, error } = await supabase.auth.signUp({
        email: newEmail.trim(),
        password: newPass,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setMsg({ type: 'error', text: error.message });
      } else if (data?.user) {
        setMsg({
          type: 'success',
          text: `User "${newEmail}" created! If email confirmation is required, they'll receive a confirmation email. Otherwise they can log in immediately.`,
        });
        setNewEmail(''); setNewPass('');
      }
    } catch {
      setMsg({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard icon={UserPlus} title="Create New User" color="emerald">
      <p className="text-xs text-text-muted leading-relaxed">
        Create additional accounts that can log into HawkEye. Each user will have their own Supabase Auth credentials.
      </p>
      <form onSubmit={handleCreate} className="space-y-3">
        <InputField label="New User Email" type="email" value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)} placeholder="newuser@example.com" disabled={loading} />
        <InputField label="Initial Password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
          placeholder="Min. 6 characters" disabled={loading}
          showToggle show={showPass} onToggle={() => setShowPass(p => !p)} />
        <Alert type={msg.type} msg={msg.text} />
        <button type="submit" disabled={loading || !newEmail.trim() || !newPass}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><UserPlus className="w-4 h-4" /> Create User</>}
        </button>
      </form>
    </SectionCard>
  );
}

// ── Main Auth Settings Panel ─────────────────────────────────────────────────
export default function AuthSettingsPanel({ onLogout }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
          <ShieldCheck className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-text-main">Auth Settings</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage login credentials and user accounts via Supabase</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChangeEmailSection onLogout={onLogout} />
        <ChangePasswordSection onLogout={onLogout} />
      </div>

      <CreateUserSection />

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-indigo-500">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold mb-0.5">Managing users via Supabase Dashboard</p>
          <p className="text-indigo-400 leading-relaxed">
            For bulk user management, visit{' '}
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="underline hover:text-indigo-300 transition-colors">
              supabase.com/dashboard
            </a>{' '}
            → Authentication → Users. You can delete, ban, or reset any user from there.
          </p>
        </div>
      </div>
    </div>
  );
}
