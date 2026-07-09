import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [sheetData, setSheetData] = useState(null);
  const [currentSection, setCurrentSection] = useState('landing'); // 'landing' | 'upload_view' | dashboard sections...
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [searchValue, setSearchValue] = useState('');
  const [selectedColumns, setSelectedColumns] = useState({});

  // Detect and set initial dark/light class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
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
        />

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          {renderMainSection()}
        </main>
      </div>

    </div>
  );
}
