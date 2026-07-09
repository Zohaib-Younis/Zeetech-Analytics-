import {
  LayoutDashboard,
  Upload,
  Table,
  BarChart4,
  MapPin,
  FileText,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  LayoutGrid
} from 'lucide-react';

export default function Sidebar({
  currentSection,
  setCurrentSection,
  isCollapsed,
  setIsCollapsed,
  hasData
}) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, requiresData: true },
    { id: 'upload', name: 'Upload File', icon: Upload, requiresData: false },
    { id: 'datagrid', name: 'Data Grid', icon: Table, requiresData: true },
    { id: 'charts', name: 'Visual Charts', icon: BarChart4, requiresData: true, badge: 'Studio' },
    { id: 'locations', name: 'Top Locations', icon: MapPin, requiresData: true },
    { id: 'pivot', name: 'Pivot Table', icon: LayoutGrid, requiresData: true, badge: 'New' },
    { id: 'export', name: 'Export Center', icon: Download, requiresData: true },
    { id: 'settings', name: 'Settings', icon: Settings, requiresData: false }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {!isCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-card-bg border-r border-border-main flex flex-col transition-all duration-300 
          ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20 w-64' : 'translate-x-0 w-64'}
        `}
      >
      {/* Brand logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border-main">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <span className="font-display font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent truncate">
              HawkEye Intelligence
            </span>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-purple-500/10 text-text-muted hover:text-purple-600 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const disabled = item.requiresData && !hasData;
          const active = currentSection === item.id;

          return (
            <button
              key={item.id}
              disabled={disabled}
              onClick={() => setCurrentSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                  ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-l-4 border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                  : disabled
                    ? 'opacity-40 cursor-not-allowed text-text-muted'
                    : 'text-text-muted hover:bg-purple-500/5 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${active ? 'text-purple-500' : ''}`} />

              {!isCollapsed && (
                <span className="text-sm truncate">{item.name}</span>
              )}

              {/* Badge */}
              {!isCollapsed && item.badge && (
                <span className="ml-auto text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on Collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-text-main text-white dark:bg-border-main dark:text-text-main text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-md">
                  {item.name} {disabled && '(Requires File)'}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Account Info */}
      <div className="p-4 border-t border-border-main flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
          AM
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-text-main truncate">Adeel Mumtaz</h4>
            <p className="text-[10px] text-text-muted truncate">Analyst Account</p>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
