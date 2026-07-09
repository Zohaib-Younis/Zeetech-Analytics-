import React, { useState } from 'react';
import { 
  Palette, 
  Trash2, 
  User, 
  ShieldAlert, 
  Bell, 
  ChevronRight,
  Info,
  Check
} from 'lucide-react';

export default function SettingsPanel({ 
  theme, 
  setTheme, 
  onResetData, 
  data 
}) {
  const [profileName, setProfileName] = useState('Adeel Mumtaz');
  const [profileEmail, setProfileEmail] = useState('adeel@gmail.com');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [updateSaved, setUpdateSaved] = useState(false);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUpdateSaved(true);
    setTimeout(() => setUpdateSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Sidebar profile configuration */}
      <div className="glass-card rounded-2xl p-6 border border-border-main space-y-6 lg:col-span-1 h-fit">
        <div className="flex items-center gap-2 border-b border-border-main pb-3">
          <User className="w-4 h-4 text-purple-500" />
          <h4 className="font-bold text-sm text-text-main">Analyst Credentials</h4>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">Full Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-border-main rounded-xl bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-text-main"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase">Email Address</label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-border-main rounded-xl bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-text-main"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="flex items-center gap-2 text-xs text-text-main cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500/20"
              />
              <span className="flex items-center gap-1"><Bell className="w-3.5 h-3.5" /> Email report logs</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            {updateSaved ? <Check className="w-4 h-4" /> : 'Save Updates'}
          </button>
        </form>

        {updateSaved && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3.5 rounded-xl text-xs font-semibold text-center">
            Credentials saved locally.
          </div>
        )}
      </div>

      {/* Theme and Danger Zones */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Visual styles customizers */}
        <div className="glass-card rounded-2xl p-6 border border-border-main space-y-4">
          <div className="flex items-center gap-2 border-b border-border-main pb-3 mb-2">
            <Palette className="w-4 h-4 text-purple-500" />
            <h4 className="font-bold text-sm text-text-main">Appearance Themes</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Light Mode */}
            <div 
              onClick={() => toggleTheme('light')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left h-24 ${
                theme === 'light' 
                  ? 'border-purple-500 bg-purple-500/[0.02] ring-2 ring-purple-500/20' 
                  : 'border-border-main hover:border-purple-500/30'
              }`}
            >
              <div>
                <h5 className="font-bold text-xs text-text-main">Daylight Theme</h5>
                <p className="text-[10px] text-text-muted mt-0.5">High contrast and slate colors.</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-200 border border-border-main flex items-center justify-center">
                {theme === 'light' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
              </div>
            </div>

            {/* Dark Mode */}
            <div 
              onClick={() => toggleTheme('dark')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left h-24 ${
                theme === 'dark' 
                  ? 'border-purple-500 bg-purple-500/[0.02] ring-2 ring-purple-500/20' 
                  : 'border-border-main hover:border-purple-500/30'
              }`}
            >
              <div>
                <h5 className="font-bold text-xs text-text-main">Midnight Mode</h5>
                <p className="text-[10px] text-text-muted mt-0.5">Vibrant glowing purple details.</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-800 border border-border-main flex items-center justify-center">
                {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
              </div>
            </div>

          </div>
        </div>

        {/* Danger Reset Zone */}
        <div className="glass-card rounded-2xl p-6 border border-pink-500/10 bg-pink-500/[0.01] space-y-4">
          <div className="flex items-center gap-2 border-b border-pink-500/10 pb-3">
            <ShieldAlert className="w-4 h-4 text-pink-500" />
            <h4 className="font-bold text-sm text-pink-500">System Operations Zone</h4>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h5 className="font-bold text-xs text-text-main">Reset current workspace</h5>
              <p className="text-[10px] text-text-muted mt-0.5">This will clear the current sheet database, cache, and redirect you to the uploader page.</p>
            </div>

            <button
              onClick={onResetData}
              className="bg-pink-500/10 border border-pink-500/20 text-pink-500 hover:bg-pink-500 hover:text-white transition-all font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-4 h-4" /> Reset Workspace
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
