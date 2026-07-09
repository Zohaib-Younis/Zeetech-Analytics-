import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle,
  Clock,
  Layers,
  Settings,
  Search,
  Grid,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

const PREVIEW_PAGE_SIZE = 50;

const getColumnTypeIndicator = (type) => {
  switch (type) {
    case 'number':   return '🔢 Number';
    case 'date':     return '📅 Date';
    case 'location': return '📍 Location';
    case 'category': return '🏷️ Category';
    default:         return '📝 Text';
  }
};

// ─── Data Preview Component ────────────────────────────────────────────────
function DataPreview({ columns, rows, columnTypes }) {
  const [page, setPage] = useState(0);

  // Reset to page 0 whenever columns or rows change
  useEffect(() => { setPage(0); }, [columns.join(','), rows.length]);

  const totalPages = Math.ceil(Math.min(rows.length, 100) / PREVIEW_PAGE_SIZE);
  const pageRows   = rows.slice(0, 100).slice(page * PREVIEW_PAGE_SIZE, (page + 1) * PREVIEW_PAGE_SIZE);

  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-xs text-text-muted">No columns selected. Select at least one column to preview data.</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-xs text-text-muted">No rows match the current filters.</p>
      </div>
    );
  }

  const formatCell = (val, header) => {
    if (val === null || val === undefined || val === '') return <span className="text-text-muted italic text-[10px]">—</span>;
    if (val instanceof Date) return val.toLocaleDateString();
    const str = String(val);
    if (str.length > 40) return <span title={str}>{str.substring(0, 38)}…</span>;
    return str;
  };

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Meta bar */}
      <div className="flex items-center justify-between text-[10px] text-text-muted px-1">
        <span>
          Showing <strong className="text-text-main">{pageRows.length}</strong> of{' '}
          <strong className="text-text-main">{Math.min(rows.length, 100).toLocaleString()}</strong>{' '}
          preview rows{rows.length > 100 ? ` (capped at 100 of ${rows.length.toLocaleString()} total)` : ''}{' '}
          · <strong className="text-text-main">{columns.length}</strong> column{columns.length !== 1 ? 's' : ''}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-0.5 rounded hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-0.5 rounded hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[380px] rounded-xl border border-border-main">
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-purple-500/[0.06] border-b border-border-main">
              <th className="py-2 px-3 text-left font-bold text-text-muted w-10 whitespace-nowrap">#</th>
              {columns.map(col => (
                <th
                  key={col}
                  className="py-2 px-3 text-left font-bold text-text-main whitespace-nowrap max-w-[180px]"
                  title={col}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate max-w-[160px]">{col}</span>
                    <span className="text-[9px] font-normal text-text-muted">{getColumnTypeIndicator(columnTypes?.[col])}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            {pageRows.map((row, ri) => (
              <tr key={ri} className={`transition-colors ${ri % 2 === 0 ? 'bg-transparent' : 'bg-purple-500/[0.01]'} hover:bg-purple-500/[0.03]`}>
                <td className="py-1.5 px-3 font-mono text-text-muted text-[10px]">{page * PREVIEW_PAGE_SIZE + ri + 1}</td>
                {columns.map(col => (
                  <td key={col} className="py-1.5 px-3 text-text-main max-w-[200px]">
                    {formatCell(row[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main ExportPanel ──────────────────────────────────────────────────────
export default function ExportPanel({ 
  data, 
  selectedColumns, 
  searchValue, 
  toggleColumnSelection, 
  setSelectedColumns 
}) {
  const { fileName, headers, rows, columnTypes, stats } = data;
  const columnStats = stats?.columnStats || {};

  const [exportOption, setExportOption]       = useState('selected');
  const [rowOption, setRowOption]             = useState('all');
  const [filenameSuffix, setFilenameSuffix]   = useState(true);
  const [exportSuccess, setExportSuccess]     = useState(null);
  const [showPreview, setShowPreview]         = useState(false);

  // Advanced filters state
  const [removeDuplicates, setRemoveDuplicates]       = useState(false);
  const [deduplicateScope, setDeduplicateScope]       = useState('all');
  const [removeNullOrZero, setRemoveNullOrZero]       = useState(false);
  const [nullZeroScope, setNullZeroScope]             = useState('all');
  const [nullZeroSpecificCols, setNullZeroSpecificCols] = useState({});
  const [top10LocationsOnly, setTop10LocationsOnly]   = useState(false);
  const [selectedLocCol, setSelectedLocCol]           = useState('');

  // Column Schema search state
  const [schemaSearch, setSchemaSearch] = useState('');

  // Identify location columns
  const locationColumns = useMemo(() => headers.filter(h => columnTypes[h] === 'location'), [headers, columnTypes]);

  useEffect(() => {
    if (locationColumns.length > 0 && !selectedLocCol) setSelectedLocCol(locationColumns[0]);
  }, [locationColumns, selectedLocCol]);

  useEffect(() => {
    const initial = {};
    headers.forEach(h => { initial[h] = true; });
    setNullZeroSpecificCols(initial);
  }, [headers]);

  // Global search filtered rows
  const filteredRows = useMemo(() => {
    if (!searchValue || searchValue.trim() === '') return rows;
    const searchLower = searchValue.toLowerCase();
    return rows.filter(row =>
      headers.some(header => {
        const val = row[header];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(searchLower);
      })
    );
  }, [rows, headers, searchValue]);

  // Advanced filter pipeline for export
  const processedRowsForExport = useMemo(() => {
    let currentRows = rowOption === 'filtered' ? filteredRows : rows;

    if (removeNullOrZero) {
      const colsToVerify = nullZeroScope === 'all'
        ? headers
        : nullZeroScope === 'selected'
          ? headers.filter(h => selectedColumns[h])
          : headers.filter(h => nullZeroSpecificCols[h]);
      currentRows = currentRows.filter(row =>
        !colsToVerify.some(col => {
          const val = row[col];
          return val === null || val === undefined || String(val).trim() === '' || String(val).trim() === '0' || val === 0;
        })
      );
    }

    if (removeDuplicates) {
      const seen = new Set();
      const colsToDeduplicate = deduplicateScope === 'selected'
        ? headers.filter(h => selectedColumns[h])
        : headers;
      currentRows = currentRows.filter(row => {
        const signature = colsToDeduplicate.map(h => String(row[h] ?? '')).join('|||');
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });
    }

    if (top10LocationsOnly && selectedLocCol) {
      const counts = {};
      rows.forEach(r => {
        const val = String(r[selectedLocCol] ?? '').trim();
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      const top10Keys = Object.entries(counts)
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
      currentRows = currentRows.filter(row => {
        const val = String(row[selectedLocCol] ?? '').trim();
        return top10Keys.includes(val);
      });
    }

    return currentRows;
  }, [rows, filteredRows, rowOption, removeNullOrZero, nullZeroScope, nullZeroSpecificCols, removeDuplicates, deduplicateScope, top10LocationsOnly, selectedLocCol, headers, selectedColumns]);

  // Columns for export / preview
  const exportColumns = useMemo(() =>
    exportOption === 'selected'
      ? headers.filter(h => selectedColumns[h])
      : headers,
    [exportOption, headers, selectedColumns]
  );

  // Column schema search
  const filteredHeaders = useMemo(() => {
    if (!schemaSearch || schemaSearch.trim() === '') return headers;
    const lower = schemaSearch.toLowerCase();
    return headers.filter(h => h.toLowerCase().includes(lower));
  }, [headers, schemaSearch]);

  const getExportFilename = (ext) => {
    const rawName = fileName.replace(/\.[^/.]+$/, '');
    const suffix = filenameSuffix ? `_export_${new Date().toISOString().split('T')[0]}` : '';
    return `${rawName}${suffix}.${ext}`;
  };

  const triggerExport = useCallback((format) => {
    setExportSuccess(null);

    if (exportColumns.length === 0) {
      alert('No columns selected for export. Please select at least one column in the Column Fields Schema.');
      return;
    }
    if (processedRowsForExport.length === 0) {
      alert(
        '⚠️ No rows remain after applying your filters.\n\n' +
        'The current Advanced Modifiers have filtered out all records.\n\n' +
        'Try relaxing the filters or switching the column scope before exporting.'
      );
      return;
    }

    const exportDataset = processedRowsForExport.map(row => {
      const obj = {};
      exportColumns.forEach(col => {
        let val = row[col];
        if (val instanceof Date) val = val.toLocaleDateString();
        obj[col] = val ?? '';
      });
      return obj;
    });

    try {
      if (format === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(exportDataset, { header: exportColumns });
        const workbook  = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Export');
        XLSX.writeFile(workbook, getExportFilename('xlsx'));
      } else if (format === 'csv') {
        const worksheet  = XLSX.utils.json_to_sheet(exportDataset, { header: exportColumns });
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', getExportFilename('csv'));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'json') {
        const jsonString = JSON.stringify(exportDataset, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', getExportFilename('json'));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setExportSuccess(`Successfully exported dataset to ${format.toUpperCase()} format.`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Export failure:', error);
      alert('Failed to export: ' + error.message);
    }
  }, [exportColumns, processedRowsForExport, filenameSuffix, fileName]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* ── Left: Configuration Controls ── */}
      <div className="glass-card rounded-2xl p-6 border border-border-main space-y-6 lg:col-span-1 h-fit">
        <div className="flex items-center gap-2 border-b border-border-main pb-3">
          <Settings className="w-4 h-4 text-purple-500" />
          <h4 className="font-bold text-sm text-text-main">Export Parameters</h4>
        </div>

        {/* 1. Columns configuration */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Columns Dimension</label>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 text-text-main cursor-pointer">
              <input type="radio" name="exportOption" checked={exportOption === 'selected'} onChange={() => setExportOption('selected')} className="text-purple-600 focus:ring-purple-500/20" />
              <span>Only selected columns ({headers.filter(h => selectedColumns[h]).length})</span>
            </label>
            <label className="flex items-center gap-2 text-text-main cursor-pointer">
              <input type="radio" name="exportOption" checked={exportOption === 'all'} onChange={() => setExportOption('all')} className="text-purple-600 focus:ring-purple-500/20" />
              <span>All sheet columns ({headers.length})</span>
            </label>
          </div>
        </div>

        {/* 2. Rows configuration */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Records Scope</label>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 text-text-main cursor-pointer">
              <input type="radio" name="rowOption" checked={rowOption === 'all'} onChange={() => setRowOption('all')} className="text-purple-600 focus:ring-purple-500/20" />
              <span>Full dataset original records ({rows.length})</span>
            </label>
            <label className="flex items-center gap-2 text-text-main cursor-pointer">
              <input type="radio" name="rowOption" checked={rowOption === 'filtered'} onChange={() => setRowOption('filtered')} className="text-purple-600 focus:ring-purple-500/20" />
              <span>Only filtered search records ({filteredRows.length})</span>
            </label>
          </div>
        </div>

        {/* 3. Advanced Cleaning & Location Filters */}
        <div className="space-y-4 pt-3 border-t border-border-main">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Advanced Modifiers</label>
          
          {/* Deduplication */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-text-main cursor-pointer select-none">
              <input type="checkbox" checked={removeDuplicates} onChange={e => setRemoveDuplicates(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500/20" />
              <span>Remove duplicate rows</span>
            </label>
            {removeDuplicates && (
              <div className="pl-6 space-y-1 mt-1">
                <label className="text-[9px] font-semibold text-text-muted uppercase block">Deduplicate Based On</label>
                <div className="space-y-1.5 text-[11px] text-text-main">
                  {[['all', 'All sheet columns'], ['selected', 'Selected export columns only']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="deduplicateScope" checked={deduplicateScope === val} onChange={() => setDeduplicateScope(val)} className="text-purple-600 focus:ring-purple-500/20 scale-90" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Remove Null or Zero */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-text-main cursor-pointer select-none">
              <input type="checkbox" checked={removeNullOrZero} onChange={e => setRemoveNullOrZero(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500/20" />
              <span>Remove rows with null or 0 values</span>
            </label>
            {removeNullOrZero && (
              <div className="pl-6 space-y-2 mt-1">
                <label className="text-[9px] font-semibold text-text-muted uppercase block">Check Column Scope</label>
                <div className="space-y-1.5 text-[11px] text-text-main">
                  {[['all', 'Check all columns'], ['selected', 'Check selected columns only'], ['specific', 'Check specific columns...']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="nullZeroScope" checked={nullZeroScope === val} onChange={() => setNullZeroScope(val)} className="text-purple-600 focus:ring-purple-500/20 scale-90" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {nullZeroScope === 'specific' && (
                  <div className="border border-border-main rounded-xl p-2 max-h-[140px] overflow-y-auto bg-card-bg/40 space-y-1">
                    {headers.map(col => (
                      <label key={col} className="flex items-center gap-1.5 text-[10px] text-text-main cursor-pointer hover:bg-purple-500/5 px-1 py-0.5 rounded">
                        <input
                          type="checkbox"
                          checked={!!nullZeroSpecificCols[col]}
                          onChange={e => setNullZeroSpecificCols(prev => ({ ...prev, [col]: e.target.checked }))}
                          className="rounded text-purple-600 focus:ring-purple-500/20 scale-75"
                        />
                        <span className="truncate">{col}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top 10 Locations */}
          {locationColumns.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-text-main cursor-pointer select-none">
                <input type="checkbox" checked={top10LocationsOnly} onChange={e => setTop10LocationsOnly(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500/20" />
                <span>Top 10 Locations only</span>
              </label>
              {top10LocationsOnly && (
                <div className="pl-6 space-y-1">
                  <label className="text-[9px] font-semibold text-text-muted uppercase block">Location Field</label>
                  <select
                    value={selectedLocCol}
                    onChange={e => setSelectedLocCol(e.target.value)}
                    className="w-full text-[11px] border border-border-main rounded-lg bg-card-bg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/25 text-text-main"
                  >
                    {locationColumns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                  <p className="text-[9px] text-text-muted italic leading-snug">Only downloads rows from the top 10 locations.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Suffix configuration */}
        <div className="space-y-2 border-t border-border-main pt-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Filename Settings</label>
          <label className="flex items-center gap-2 text-xs text-text-main cursor-pointer">
            <input type="checkbox" checked={filenameSuffix} onChange={e => setFilenameSuffix(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500/20" />
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Append ISO timestamp</span>
          </label>
        </div>

        {/* 5. Export Summary */}
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 space-y-2.5 text-left">
          <h5 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Cleaned Export Summary</h5>
          <div className="space-y-1.5 text-[11px] text-text-muted">
            <div className="flex justify-between"><span>Original Rows:</span> <strong className="text-text-main font-semibold">{rows.length}</strong></div>
            <div className="flex justify-between"><span>Scope Selection:</span> <strong className="text-text-main font-semibold">{rowOption === 'filtered' ? filteredRows.length : rows.length}</strong></div>
            {removeDuplicates && (
              <div className="flex justify-between text-emerald-500 font-medium">
                <span>Deduplication Filter:</span>
                <span>Active ({deduplicateScope === 'selected' ? 'Selected columns' : 'All columns'})</span>
              </div>
            )}
            {removeNullOrZero && (
              <div className="flex justify-between text-rose-500 dark:text-rose-400 font-medium">
                <span>Null/0 Value Filter:</span>
                <span>Active ({nullZeroScope === 'all' ? 'All columns' : nullZeroScope === 'selected' ? 'Selected' : 'Specific'})</span>
              </div>
            )}
            {top10LocationsOnly && (
              <div className="flex justify-between text-indigo-500 font-medium">
                <span>Top 10 Locations Filter:</span><span>Active</span>
              </div>
            )}
            <div className="border-t border-border-main my-1" />
            <div className="flex justify-between text-text-main font-bold text-xs">
              <span>Final Export Rows:</span>
              <span className={`font-mono ${processedRowsForExport.length === 0 ? 'text-rose-500 dark:text-rose-400' : 'text-purple-600 dark:text-purple-400'}`}>
                {processedRowsForExport.length === 0 ? '⚠️ 0 — All filtered out' : processedRowsForExport.length.toLocaleString()}
              </span>
            </div>
            {processedRowsForExport.length === 0 && (
              <p className="text-[9px] text-rose-500 dark:text-rose-400 italic leading-snug pt-1">
                Your current filters removed all rows. Relax the Advanced Modifiers or change the column scope.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Format Cards + Preview + Schema ── */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Export Format Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Excel */}
          <div className="glass-card rounded-2xl p-5 border border-border-main hover:border-purple-500/30 transition-all flex flex-col justify-between items-start">
            <div className="space-y-2">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-500 w-fit">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-text-main mt-3">Excel Worksheet (.xlsx)</h4>
              <p className="text-[11px] text-text-muted font-light leading-relaxed">Save spreadsheet data preserving structure, headers, and grid arrays.</p>
            </div>
            <button onClick={() => triggerExport('xlsx')} className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
              <Download className="w-3.5 h-3.5" /> Download Excel
            </button>
          </div>

          {/* CSV */}
          <div className="glass-card rounded-2xl p-5 border border-border-main hover:border-indigo-500/30 transition-all flex flex-col justify-between items-start">
            <div className="space-y-2">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-500 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-text-main mt-3">Comma Separated (.csv)</h4>
              <p className="text-[11px] text-text-muted font-light leading-relaxed">Download database files as raw text strings. Universal format compatibility.</p>
            </div>
            <button onClick={() => triggerExport('csv')} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
          </div>

          {/* JSON */}
          <div className="glass-card rounded-2xl p-5 border border-border-main hover:border-violet-500/30 transition-all flex flex-col justify-between items-start">
            <div className="space-y-2">
              <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-500 w-fit">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-text-main mt-3">JSON Dataset (.json)</h4>
              <p className="text-[11px] text-text-muted font-light leading-relaxed">Export nested key-value objects arrays suitable for development structures.</p>
            </div>
            <button onClick={() => triggerExport('json')} className="w-full mt-4 bg-violet-600 hover:bg-violet-500 text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all">
              <Download className="w-3.5 h-3.5" /> Download JSON
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {exportSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* ── Data Preview Section ── */}
        <div className="glass-card rounded-2xl border border-border-main overflow-hidden">
          {/* Toggle Header */}
          <button
            onClick={() => setShowPreview(p => !p)}
            className="w-full flex items-center justify-between p-5 border-b border-border-main hover:bg-purple-500/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border transition-colors ${showPreview ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' : 'bg-transparent border-border-main text-text-muted'}`}>
                <TableIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-text-main flex items-center gap-2">
                  Preview Data
                  <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                    {exportColumns.length} col{exportColumns.length !== 1 ? 's' : ''} · {processedRowsForExport.length.toLocaleString()} rows
                  </span>
                </h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Inspect the exact data that will be exported. Updates in real-time with your column &amp; filter selections.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-xs text-text-muted">{showPreview ? 'Hide' : 'Show'}</span>
              {showPreview
                ? <EyeOff className="w-4 h-4 text-text-muted" />
                : <Eye    className="w-4 h-4 text-text-muted" />
              }
            </div>
          </button>

          {/* Preview body */}
          {showPreview && (
            <div className="p-5">
              <DataPreview
                columns={exportColumns}
                rows={processedRowsForExport}
                columnTypes={columnTypes}
              />
            </div>
          )}
        </div>

        {/* Column Fields Schema */}
        <div className="glass-card rounded-2xl p-6 border border-border-main space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main pb-4">
            <div>
              <h4 className="font-bold text-sm text-text-main flex items-center gap-2">
                <Grid className="w-4 h-4 text-purple-500" />
                Column Fields Schema
              </h4>
              <p className="text-xs text-text-muted mt-0.5">Select and structure the columns you want to include in the exported data.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search columns..."
                  value={schemaSearch}
                  onChange={e => setSchemaSearch(e.target.value)}
                  className="text-xs pl-8 pr-8 py-1.5 w-44 rounded-xl border border-border-main bg-card-bg/60 text-text-main focus:outline-none focus:ring-2 focus:ring-purple-500/25"
                />
                {schemaSearch && (
                  <button onClick={() => setSchemaSearch('')} className="absolute right-2.5 top-1.5 text-text-muted hover:text-text-main cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => { const u = {}; headers.forEach(h => { u[h] = true; }); setSelectedColumns(u); }}
                className="text-[10px] font-bold text-purple-600 hover:text-purple-500 dark:text-purple-400 border border-purple-500/20 hover:border-purple-500/40 px-2 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >Select All</button>
              <button
                onClick={() => { const u = {}; headers.forEach(h => { u[h] = false; }); setSelectedColumns(u); }}
                className="text-[10px] font-bold text-text-muted hover:text-text-main border border-border-main px-2 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >Clear All</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {filteredHeaders.map(header => {
              const type       = columnTypes[header] || 'text';
              const stat       = columnStats[header] || { uniqueCount: 0, missingPct: 0 };
              const isSelected = selectedColumns[header];
              return (
                <div
                  key={header}
                  onClick={() => toggleColumnSelection(header)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500/30 bg-purple-500/[0.02] hover:bg-purple-500/[0.04]'
                      : 'border-border-main hover:border-purple-500/25 bg-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => {}}
                      className="rounded border-border-main text-purple-600 focus:ring-purple-500/30 w-4 h-4 cursor-pointer shrink-0"
                    />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-text-main truncate pr-2">{header}</p>
                      <span className="text-[9px] text-text-muted capitalize flex items-center gap-1 font-medium mt-0.5">
                        {getColumnTypeIndicator(type)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[9px] text-text-muted font-light shrink-0">
                    <p>{stat.uniqueCount} Uniques</p>
                    <p>{stat.missingPct > 0 ? `${stat.missingPct.toFixed(0)}% missing` : '100% complete'}</p>
                  </div>
                </div>
              );
            })}
            {filteredHeaders.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-text-muted font-light">
                No columns match your search filter.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
