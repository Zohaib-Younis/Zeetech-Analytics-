import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import Overview from './components/Overview';
import DataGrid from './components/DataGrid';
import AnalyticsPanel from './components/AnalyticsPanel';
import ChartsPanel from './components/ChartsPanel';
import TopLocations from './components/TopLocations';
import PivotTable from './components/PivotTable';
import ReportsPanel from './components/ReportsPanel';
import ExportPanel from './components/ExportPanel';
import SettingsPanel from './components/SettingsPanel';
import AuthSettingsPanel from './components/AuthSettingsPanel';
import Login from './components/Login';

export default function App() {
  const [sheetData, setSheetData] = useState(null);
  const [currentSection, setCurrentSection] = useState('landing'); // 'landing' | 'upload_view' | dashboard sections...
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [searchValue, setSearchValue] = useState('');
  const [selectedColumns, setSelectedColumns] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading]         = useState(true);

  // Detect and set initial dark/light class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Supabase session management & Custom Code Auth
  useEffect(() => {
    // 1. Check custom code auth first
    if (localStorage.getItem('codeAuth') === 'true') {
      setIsAuthenticated(true);
      setAuthLoading(false);
      return;
    }

    // 2. Check Supabase config
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    // 3. Check for an existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    });

    // Listen for sign-in / sign-out events (only if not using custom code)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('codeAuth') !== 'true') {
        setIsAuthenticated(!!session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update selected columns schema map when data changes
  const handleDataLoaded = (data) => {
    if (data === 'upload_view') {
      setCurrentSection('upload_view');
      return;
    }

    setSheetData(data);
    
    // Initialize all columns as selected
    const initialColumns = {};
    data.headers.forEach(h => {
      initialColumns[h] = true;
    });
    setSelectedColumns(initialColumns);
    setSearchValue('');
    setCurrentSection('dashboard');
  };

  const toggleColumnSelection = (header) => {
    setSelectedColumns(prev => ({
      ...prev,
      [header]: !prev[header]
    }));
  };

  const handleResetData = () => {
    setSheetData(null);
    setSelectedColumns({});
    setSearchValue('');
    setCurrentSection('landing');
  };

  // Handle missing Vercel environment variables directly on screen
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-6">
        <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-red-500/20 space-y-4 text-center shadow-2xl shadow-red-500/10">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-2xl">!</div>
          <h1 className="text-2xl font-bold text-text-main">Missing Configuration</h1>
          <p className="text-sm text-text-muted">
            The application failed to load because the Supabase environment variables are missing.
          </p>
          <div className="bg-red-500/10 p-4 rounded-xl text-xs text-red-500 text-left space-y-2 border border-red-500/20">
            <p><strong>Fixing this in Vercel:</strong></p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Go to Vercel Dashboard → Project → Settings → Environment Variables</li>
              <li>Add <code>VITE_SUPABASE_URL</code></li>
              <li>Add <code>VITE_SUPABASE_ANON_KEY</code></li>
              <li><strong>Crucial:</strong> Go to Deployments and redeploy the project!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Show nothing while checking session (avoids login flash)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted">Checking session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Determine active view when NO file is uploaded
  if (!sheetData) {
    if (currentSection === 'upload_view') {
      return (
        <div className="min-h-screen bg-dashboard-bg flex flex-col justify-between">
          <header className="h-16 flex items-center justify-between px-8 border-b border-border-main bg-card-bg/60 backdrop-blur-md sticky top-0 z-20">
            <span className="font-display font-extrabold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              HawkEye Intelligence
            </span>
            <button
              onClick={() => setCurrentSection('landing')}
              className="text-xs text-text-muted hover:text-purple-600 font-semibold transition-colors"
            >
              Back to Home
            </button>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <UploadZone onDataLoaded={handleDataLoaded} />
          </div>
          <footer className="h-12 border-t border-border-main flex items-center justify-center text-[10px] text-text-muted">
            © {new Date().getFullYear()} HawkEye Data Platform. All rights reserved.
          </footer>
        </div>
      );
    }
    // Default Landing view
    return <LandingPage onDataLoaded={handleDataLoaded} />;
  }

  // Active section renderer (with sheetData present)
  const renderMainSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <Overview 
            data={sheetData} 
            setCurrentSection={setCurrentSection} 
            selectedColumns={selectedColumns}
            toggleColumnSelection={toggleColumnSelection}
          />
        );
      case 'upload':
        return <UploadZone onDataLoaded={handleDataLoaded} />;
      case 'datagrid':
        return (
          <DataGrid 
            data={sheetData} 
            selectedColumns={selectedColumns} 
            searchValue={searchValue} 
          />
        );
      case 'analytics':
        return (
          <AnalyticsPanel 
            data={sheetData} 
            selectedColumns={selectedColumns} 
          />
        );
      case 'charts':
        return (
          <ChartsPanel 
            data={sheetData} 
            selectedColumns={selectedColumns} 
          />
        );
      case 'locations':
        return <TopLocations data={sheetData} />;
      case 'pivot':
        return <PivotTable data={sheetData} />;
      case 'reports':
        return (
          <ReportsPanel 
            data={sheetData} 
            selectedColumns={selectedColumns} 
          />
        );
      case 'export':
        return (
          <ExportPanel 
            data={sheetData} 
            selectedColumns={selectedColumns} 
            searchValue={searchValue} 
            toggleColumnSelection={toggleColumnSelection}
            setSelectedColumns={setSelectedColumns}
          />
        );
      case 'auth':
        return <AuthSettingsPanel />;
      case 'settings':
        return (
          <SettingsPanel 
            theme={theme} 
            setTheme={setTheme} 
            onResetData={handleResetData}
            data={sheetData}
          />
        );
      default:
        return <Overview data={sheetData} setCurrentSection={setCurrentSection} selectedColumns={selectedColumns} toggleColumnSelection={toggleColumnSelection} />;
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentSection={currentSection === 'upload_view' ? 'upload' : currentSection} 
        setCurrentSection={setCurrentSection} 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
        hasData={!!sheetData} 
      />

      {/* Main Workspace Frame */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-20 pl-0' : 'md:pl-64 pl-0'
        }`}
      >
        {/* Dynamic Header */}
        <Header 
          currentSection={currentSection} 
          theme={theme} 
          setTheme={setTheme} 
          onSearchChange={setSearchValue}
          searchValue={searchValue}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          fileName={sheetData.fileName}
          onLogout={async () => {
            if (localStorage.getItem('codeAuth') === 'true') {
              localStorage.removeItem('codeAuth');
            } else if (isSupabaseConfigured && supabase) {
              await supabase.auth.signOut();
            }
            localStorage.removeItem('rememberedAuth');
            setIsAuthenticated(false);
          }}
        />

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {renderMainSection()}
        </main>
      </div>

    </div>
  );
}
