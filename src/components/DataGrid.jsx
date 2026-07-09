import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Search, 
  Download, 
  Filter, 
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export default function DataGrid({ data, selectedColumns, searchValue }) {
  const { headers, rows, columnTypes } = data;

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' }); // 'asc' | 'desc' | 'none'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  
  // Column filters state (header -> filterValue)
  const [columnFilters, setColumnFilters] = useState({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Active columns (only headers that are selected)
  const activeHeaders = useMemo(() => {
    return headers.filter(h => selectedColumns[h]);
  }, [headers, selectedColumns]);

  // Handle Sort Change
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = 'none';
    }
    setSortConfig({ key, direction });
  };

  // Filter column input handler
  const handleFilterChange = (header, val) => {
    setColumnFilters(prev => ({
      ...prev,
      [header]: val
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setColumnFilters({});
    setCurrentPage(1);
  };

  // Filtered and Sorted Rows computation
  const filteredSortedRows = useMemo(() => {
    let result = [...rows];

    // 1. Apply global search
    if (searchValue && searchValue.trim() !== '') {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(row => {
        return activeHeaders.some(header => {
          const val = row[header];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(searchLower);
        });
      });
    }

    // 2. Apply column-specific filters
    Object.entries(columnFilters).forEach(([header, filterVal]) => {
      if (!filterVal || filterVal.trim() === '') return;
      const filterLower = filterVal.toLowerCase();
      
      result = result.filter(row => {
        const val = row[header];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(filterLower);
      });
    });

    // 3. Apply sorting
    if (sortConfig.key && sortConfig.direction !== 'none') {
      const { key, direction } = sortConfig;
      const type = columnTypes[key];

      result.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (valA === null || valA === undefined) return direction === 'asc' ? 1 : -1;
        if (valB === null || valB === undefined) return direction === 'asc' ? -1 : 1;

        if (type === 'number') {
          // Clean strings for numeric conversion if formatted
          const numA = typeof valA === 'number' ? valA : Number(String(valA).replace(/[\$,%]/g, ''));
          const numB = typeof valB === 'number' ? valB : Number(String(valB).replace(/[\$,%]/g, ''));
          return direction === 'asc' ? numA - numB : numB - numA;
        }

        if (type === 'date') {
          const dateA = valA instanceof Date ? valA.getTime() : new Date(valA).getTime();
          const dateB = valB instanceof Date ? valB.getTime() : new Date(valB).getTime();
          return direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Default to text sorting
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return direction === 'asc' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [rows, activeHeaders, searchValue, columnFilters, sortConfig, columnTypes]);

  // Paginated Rows
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredSortedRows.slice(startIdx, startIdx + pageSize);
  }, [filteredSortedRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSortedRows.length / pageSize) || 1;

  // Format Helper
  const formatCellValue = (val, type) => {
    if (val === null || val === undefined) return <span className="text-text-muted/40 italic">null</span>;
    
    if (type === 'date') {
      if (val instanceof Date) return val.toLocaleDateString();
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? String(val) : parsed.toLocaleDateString();
    }

    if (type === 'number') {
      // Check if it should represent dollar values based on standard header indicators
      return typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(val);
    }

    // Check if the value contains the latitude/longitude pipe-separated format (e.g., 31.4479|74.3546)
    if (typeof val === 'string') {
      const match = val.match(/(-?\d+(?:\.\d+)?)\|(-?\d+(?:\.\d+)?)/);
      if (match) {
        const [fullMatch, lat, lng] = match;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        const idx = val.indexOf(fullMatch);
        const prefix = val.substring(0, idx);
        const suffix = val.substring(idx + fullMatch.length);

        return (
          <span>
            {prefix}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400 hover:underline font-bold bg-purple-500/10 px-1.5 py-0.5 rounded ml-1"
              title={`View coordinates (${lat}, ${lng}) on Google Maps`}
            >
              📍 {fullMatch}
            </a>
            {suffix}
          </span>
        );
      }
    }

    return String(val);
  };

  const getSortIcon = (header) => {
    if (sortConfig.key !== header) return <ChevronsUpDown className="w-3.5 h-3.5 text-text-muted/60" />;
    if (sortConfig.direction === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-purple-500 font-bold" />;
    if (sortConfig.direction === 'desc') return <ChevronDown className="w-3.5 h-3.5 text-purple-500 font-bold" />;
    return <ChevronsUpDown className="w-3.5 h-3.5 text-text-muted/60" />;
  };

  return (
    <div className="space-y-4">
      
      {/* Table Action Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              showFiltersPanel || Object.keys(columnFilters).some(k => columnFilters[k])
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                : 'bg-card-bg border-border-main text-text-muted hover:text-purple-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {Object.keys(columnFilters).some(k => columnFilters[k]) ? 'Filters Active' : 'Filter Columns'}
          </button>

          {Object.keys(columnFilters).some(k => columnFilters[k]) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl border border-pink-500/20 bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Record info summary */}
        <span className="text-xs text-text-muted font-light shrink-0">
          Showing {Math.min(filteredSortedRows.length, (currentPage - 1) * pageSize + 1)} to{' '}
          {Math.min(filteredSortedRows.length, currentPage * pageSize)} of{' '}
          <strong className="text-text-main font-semibold">{filteredSortedRows.length.toLocaleString()}</strong> rows
        </span>
      </div>

      {/* Dynamic Column Filters Panel */}
      {showFiltersPanel && (
        <div className="glass-card rounded-2xl p-5 border border-border-main grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {activeHeaders.map(header => (
            <div key={header} className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-text-muted tracking-wider uppercase">{header}</label>
              <input
                type="text"
                placeholder={`Filter ${header}...`}
                value={columnFilters[header] || ''}
                onChange={(e) => handleFilterChange(header, e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-border-main rounded-lg bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-text-main"
              />
            </div>
          ))}
        </div>
      )}

      {/* Excel Table Data Wrapper */}
      <div className="glass-card rounded-2xl border border-border-main overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-purple-500/[0.02] border-b border-border-main sticky top-0 z-10 backdrop-blur-md">
                {activeHeaders.map(header => {
                  const type = columnTypes[header];
                  return (
                    <th 
                      key={header} 
                      onClick={() => requestSort(header)}
                      className={`px-5 py-4 font-bold text-text-main cursor-pointer select-none transition-colors hover:bg-purple-500/5 ${
                        type === 'number' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 ${type === 'number' ? 'justify-end' : 'justify-start'}`}>
                        <span>{header}</span>
                        {getSortIcon(header)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-transparent">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-500/[0.01] transition-colors">
                    {activeHeaders.map(header => {
                      const type = columnTypes[header];
                      return (
                        <td 
                          key={header} 
                          className={`px-5 py-3.5 text-text-main font-medium ${
                            type === 'number' ? 'text-right font-mono' : 'text-left'
                          }`}
                        >
                          {formatCellValue(row[header], type)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeHeaders.length} className="px-6 py-12 text-center text-text-muted italic">
                    No records match search parameters or active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Page size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Display:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs border border-border-main rounded-lg bg-card-bg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-text-main"
          >
            {[10, 15, 25, 50, 100].map(sz => (
              <option key={sz} value={sz}>{sz} Rows</option>
            ))}
          </select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-border-main bg-card-bg text-text-muted disabled:opacity-40 hover:text-purple-600 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-text-main font-medium px-4">
            Page <strong className="font-semibold text-purple-600 dark:text-purple-400">{currentPage}</strong> of{' '}
            <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-border-main bg-card-bg text-text-muted disabled:opacity-40 hover:text-purple-600 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
