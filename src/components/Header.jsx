import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  User,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Header({ 
  currentSection, 
  theme, 
  setTheme, 
  onSearchChange,
  searchValue,
  sidebarCollapsed,
  setSidebarCollapsed,
  fileName
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Dynamic Page Titles
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'dashboard': return 'Dashboard Overview';
      case 'upload': return 'Excel & CSV Uploader';
      case 'datagrid': return 'Dataset Explorer';
      case 'analytics': return 'Descriptive Statistics';
      case 'charts': return 'Interactive Charts Studio';
      case 'locations': return 'Top Locations Hub';
      case 'reports': return 'Printable Report Builder';
      case 'export': return 'Export Center';
      case 'settings': return 'App Customization';
      default: return 'Data Analytics';
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const mockNotifications = [
    { id: 1, type: 'success', text: 'Spreadsheet parsed successfully.', time: 'Just now' },
    { id: 2, type: 'info', text: 'Detected 2 location-based columns.', time: '2 mins ago' },
    { id: 3, type: 'alert', text: 'Column "Sales" contains 0 outliers.', time: '10 mins ago' },
  ];

  return (
    <header className="h-16 border-b border-border-main bg-card-bg/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      
      {/* Mobile / Toggle sidebar button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="md:hidden p-1.5 rounded-lg hover:bg-purple-500/10 text-text-muted hover:text-purple-600 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col">
          <h1 className="font-display font-semibold text-lg text-text-main leading-tight">
            {getSectionTitle()}
          </h1>
          {fileName && (
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium truncate max-w-[200px]">
              Active: {fileName}
            </span>
          )}
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center relative max-w-md w-full mx-8">
        <Search className="w-4 h-4 text-text-muted absolute left-3" />
        <input
          type="search"
          placeholder={currentSection === 'datagrid' ? "Search inside sheet rows..." : "Search commands or dashboards..."}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border-main bg-dashboard-bg/50 focus:bg-dashboard-bg text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-text-main"
        />
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center gap-2">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-muted hover:text-purple-600 hover:bg-purple-500/10 transition-all"
          title="Toggle Theme Mode"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-2 rounded-xl text-text-muted hover:text-purple-600 hover:bg-purple-500/10 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 border border-card-bg" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-card shadow-xl p-4 border border-border-main z-50">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-main">
                <span className="text-xs font-semibold text-text-main">Recent Notifications</span>
                <span className="text-[10px] text-purple-500 hover:underline cursor-pointer">Mark read</span>
              </div>
              <div className="space-y-3">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="flex gap-3 text-xs">
                    {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {n.type === 'info' && <Info className="w-4 h-4 text-purple-500 shrink-0" />}
                    {n.type === 'alert' && <AlertCircle className="w-4 h-4 text-pink-500 shrink-0" />}
                    
                    <div className="flex-1">
                      <p className="text-text-main leading-relaxed font-light">{n.text}</p>
                      <span className="text-[9px] text-text-muted">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-purple-500/10 transition-all border border-transparent hover:border-border-main"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              JD
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-card shadow-xl border border-border-main overflow-hidden z-50">
              <div className="p-4 bg-purple-500/5 border-b border-border-main">
                <p className="text-xs font-semibold text-text-main">John Doe</p>
                <p className="text-[10px] text-text-muted truncate">john.doe@hawkeye.ai</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-purple-600 hover:bg-purple-500/10 transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-purple-600 hover:bg-purple-500/10 transition-colors">
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
                <div className="border-t border-border-main my-1" />
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-pink-500 hover:bg-pink-500/10 transition-colors text-left">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
