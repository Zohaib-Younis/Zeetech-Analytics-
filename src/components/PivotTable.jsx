import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  LayoutGrid,
  Rows3,
  Columns3,
  Hash,
  Filter,
  Download,
  FileSpreadsheet,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Plus,
  Info,
  RefreshCw,
  GripVertical,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const AGG_FUNCTIONS = ['Sum', 'Count', 'Average', 'Min', 'Max'];

const ZONE_META = {
  rows:    { label: 'Rows',    icon: Rows3,    color: 'purple', hint: 'Fields that define row groups' },
  columns: { label: 'Columns', icon: Columns3,  color: 'indigo', hint: 'Fields that define column groups' },
  values:  { label: 'Values',  icon: Hash,      color: 'emerald', hint: 'Numeric fields to aggregate' },
  filters: { label: 'Filters', icon: Filter,    color: 'amber',  hint: 'Fields used to filter data' },
};

const COLOR_MAP = {
  purple:  { chip: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', zone: 'border-purple-500/30 bg-purple-500/[0.03]', dot: 'bg-purple-500' },
  indigo:  { chip: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',  zone: 'border-indigo-500/30 bg-indigo-500/[0.03]',  dot: 'bg-indigo-500' },
  emerald: { chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', zone: 'border-emerald-500/30 bg-emerald-500/[0.03]', dot: 'bg-emerald-500' },
  amber:   { chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',     zone: 'border-amber-500/30 bg-amber-500/[0.03]',     dot: 'bg-amber-500' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation engine
// ─────────────────────────────────────────────────────────────────────────────
function aggregate(values, fn) {
  const nums = values
    .map(v => {
      if (typeof v === 'number') return v;
      const n = parseFloat(String(v).replace(/[,$%]/g, ''));
      return isNaN(n) ? null : n;
    })
    .filter(v => v !== null);

  if (fn === 'Count') return values.length;
  if (nums.length === 0) return '';
  switch (fn) {
    case 'Sum':     return nums.reduce((a, b) => a + b, 0);
    case 'Average': return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'Min':     return Math.min(...nums);
    case 'Max':     return Math.max(...nums);
    default:        return nums.reduce((a, b) => a + b, 0);
  }
}

function fmt(val, fn) {
  if (val === '' || val === null || val === undefined) return '—';
  if (fn === 'Count') return Number(val).toLocaleString();
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n % 1 === 0
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Pivot computation
// ─────────────────────────────────────────────────────────────────────────────
function computePivot(rows, rowFields, colFields, valueFields, filterState) {
  // 1. Apply filters
  let data = rows;
  Object.entries(filterState).forEach(([field, allowed]) => {
    if (allowed.size > 0) {
      data = data.filter(r => allowed.has(String(r[field] ?? '')));
    }
  });

  // 2. Unique row/col keys
  const rowKey   = r => rowFields.map(f => String(r[f] ?? '')).join(' ‣ ');
  const colKey   = r => colFields.map(f => String(r[f] ?? '')).join(' ‣ ');
  const rowLabel = r => rowKey(r);
  const colLabel = r => colKey(r);

  const rowKeys = [...new Set(data.map(rowLabel))].sort();
  const colKeys = colFields.length ? [...new Set(data.map(colLabel))].sort() : ['(All)'];

  // 3. Build lookup: rowKey -> colKey -> field -> [values]
  const lookup = {};
  data.forEach(r => {
    const rk = rowLabel(r);
    const ck = colFields.length ? colLabel(r) : '(All)';
    if (!lookup[rk])       lookup[rk]       = {};
    if (!lookup[rk][ck])   lookup[rk][ck]   = {};
    valueFields.forEach(({ field }) => {
      if (!lookup[rk][ck][field]) lookup[rk][ck][field] = [];
      lookup[rk][ck][field].push(r[field]);
    });
  });

  return { rowKeys, colKeys, lookup };
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag-and-drop helpers
// ─────────────────────────────────────────────────────────────────────────────
function useDndField() {
  const dragging = useRef(null); // { field, fromZone }
  const onDragStart = (field, fromZone) => {
    dragging.current = { field, fromZone };
  };
  const onDrop = (toZone, dropCb) => (e) => {
    e.preventDefault();
    if (dragging.current) {
      dropCb(dragging.current.field, dragging.current.fromZone, toZone);
      dragging.current = null;
    }
  };
  const onDragOver = (e) => { e.preventDefault(); };
  return { onDragStart, onDrop, onDragOver };
}

// ─────────────────────────────────────────────────────────────────────────────
// FieldChip — draggable tag inside a zone
// ─────────────────────────────────────────────────────────────────────────────
function FieldChip({ field, zone, color, onRemove, onDragStart, agg, onAggChange }) {
  const cls = COLOR_MAP[color]?.chip ?? COLOR_MAP.purple.chip;
  return (
    <div
      draggable
      onDragStart={() => onDragStart(field, zone)}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold cursor-grab active:cursor-grabbing transition-all hover:shadow-sm ${cls}`}
    >
      <GripVertical className="w-3 h-3 opacity-50" />
      <span className="max-w-[90px] truncate" title={field}>{field}</span>

      {/* Aggregation selector for value fields */}
      {zone === 'values' && onAggChange && (
        <select
          value={agg}
          onChange={e => { e.stopPropagation(); onAggChange(field, e.target.value); }}
          onClick={e => e.stopPropagation()}
          className="bg-transparent border-none text-[10px] font-bold cursor-pointer focus:ring-0 focus:outline-none -mr-1 max-w-[56px]"
        >
          {AGG_FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      )}

      <button
        onClick={e => { e.stopPropagation(); onRemove(field, zone); }}
        className="ml-0.5 hover:opacity-100 opacity-50 transition-opacity"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DropZone — accepts dragged fields
// ─────────────────────────────────────────────────────────────────────────────
function DropZone({ zoneId, fields, valueAggs, onRemove, onDragStart, onDrop, onDragOver, onAggChange, handleDrop }) {
  const { label, icon: Icon, color, hint } = ZONE_META[zoneId];
  const cls = COLOR_MAP[color];
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={e => { onDragOver(e); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => {
        setIsDragOver(false);
        onDrop(zoneId, handleDrop)(e);
      }}
      className={`rounded-xl border-2 border-dashed p-3 transition-all duration-200 min-h-[80px] ${
        isDragOver ? `${cls.zone} border-opacity-70` : 'border-border-main hover:border-opacity-50'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-2 h-2 rounded-full ${cls.dot}`} />
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        <span className="ml-auto text-[9px] text-text-muted italic hidden sm:block">{hint}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {fields.length === 0 && (
          <span className="text-[10px] text-text-muted italic self-center">Drop a field here…</span>
        )}
        {fields.map(f => (
          <FieldChip
            key={f}
            field={f}
            zone={zoneId}
            color={color}
            onRemove={onRemove}
            onDragStart={onDragStart}
            agg={valueAggs?.[f] ?? 'Sum'}
            onAggChange={zoneId === 'values' ? onAggChange : undefined}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pivot Table Grid
// ─────────────────────────────────────────────────────────────────────────────
function PivotGrid({ rowKeys, colKeys, lookup, valueFields, sortState, onSort }) {
  if (rowKeys.length === 0 || valueFields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500">
          <LayoutGrid className="w-7 h-7" />
        </div>
        <div>
          <p className="font-bold text-text-main text-sm">Add fields to build your pivot table</p>
          <p className="text-xs text-text-muted mt-1">Drag fields from "Available Fields" into the Rows and Values zones.</p>
        </div>
      </div>
    );
  }

  // Build sortable row list
  const sorted = useMemo(() => {
    if (!sortState.col || sortState.col === '__row__') {
      const rows = [...rowKeys];
      return sortState.dir === 'asc' ? rows.sort() : sortState.dir === 'desc' ? rows.sort().reverse() : rows;
    }
    // Sort by a specific value column
    const [colKey, vfIdx] = sortState.col.split('::');
    const vf = valueFields[parseInt(vfIdx, 10)];
    if (!vf) return rowKeys;
    return [...rowKeys].sort((a, b) => {
      const va = aggregate(lookup[a]?.[colKey]?.[vf.field] ?? [], vf.agg);
      const vb = aggregate(lookup[b]?.[colKey]?.[vf.field] ?? [], vf.agg);
      const na = typeof va === 'number' ? va : parseFloat(va) || 0;
      const nb = typeof vb === 'number' ? vb : parseFloat(vb) || 0;
      return sortState.dir === 'asc' ? na - nb : nb - na;
    });
  }, [rowKeys, sortState, lookup, valueFields, colKeys]);

  const SortIcon = ({ colId }) => {
    if (sortState.col !== colId) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortState.dir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-purple-500" />
      : <ChevronDown className="w-3 h-3 text-purple-500" />;
  };

  const handleSort = (colId) => {
    onSort(prev => {
      if (prev.col !== colId) return { col: colId, dir: 'asc' };
      if (prev.dir === 'asc')  return { col: colId, dir: 'desc' };
      return { col: null, dir: null };
    });
  };

  // Column headers: for each colKey, show one header per valueField
  const headerCells = colKeys.flatMap((ck, ci) =>
    valueFields.map((vf, vi) => ({
      key: `${ck}::${vi}`,
      colKey: ck,
      label: valueFields.length > 1 ? `${ck} · ${vf.agg}(${vf.field})` : `${ck}`,
      sortId: `${ck}::${vi}`,
    }))
  );

  return (
    <div className="overflow-auto max-h-[520px] rounded-xl border border-border-main">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10">
          {/* If we have column fields, show a spanning header row */}
          {colKeys.length > 1 || colKeys[0] !== '(All)' ? (
            <tr className="bg-indigo-500/[0.06] border-b border-border-main">
              <th className="py-2.5 px-3 text-left font-bold text-text-muted border-r border-border-main whitespace-nowrap">Row Labels</th>
              {colKeys.map(ck => (
                <th
                  key={ck}
                  colSpan={valueFields.length}
                  className="py-2.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400 border-r border-border-main whitespace-nowrap"
                >
                  {ck}
                </th>
              ))}
            </tr>
          ) : null}
          {/* Value headers row */}
          <tr className="bg-purple-500/[0.05] border-b border-border-main">
            <th
              className="py-2.5 px-3 text-left font-bold text-text-muted border-r border-border-main whitespace-nowrap cursor-pointer select-none hover:bg-purple-500/5"
              onClick={() => handleSort('__row__')}
            >
              <span className="flex items-center gap-1">
                Row <SortIcon colId="__row__" />
              </span>
            </th>
            {headerCells.map(({ key, label, sortId }) => (
              <th
                key={key}
                className="py-2.5 px-3 text-right font-bold text-text-main whitespace-nowrap cursor-pointer select-none hover:bg-purple-500/5 border-r border-border-main"
                onClick={() => handleSort(sortId)}
              >
                <span className="flex items-center justify-end gap-1">
                  <span className="truncate max-w-[140px]" title={label}>{label}</span>
                  <SortIcon colId={sortId} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-main">
          {sorted.map((rk, ri) => (
            <tr key={rk} className={`transition-colors ${ri % 2 === 0 ? '' : 'bg-purple-500/[0.01]'} hover:bg-purple-500/[0.03]`}>
              <td className="py-2 px-3 font-semibold text-text-main border-r border-border-main whitespace-nowrap max-w-[200px]">
                <span title={rk} className="truncate block max-w-[180px]">{rk || '(blank)'}</span>
              </td>
              {headerCells.map(({ key, colKey, sortId }, hi) => {
                const vf  = valueFields[hi % valueFields.length];
                const vals = lookup[rk]?.[colKey]?.[vf.field] ?? [];
                const v   = aggregate(vals, vf.agg);
                return (
                  <td key={key} className="py-2 px-3 text-right font-mono text-text-main border-r border-border-main">
                    {fmt(v, vf.agg)}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Grand Total row */}
          <tr className="border-t-2 border-border-main bg-purple-500/[0.04] font-bold">
            <td className="py-2.5 px-3 text-text-main border-r border-border-main text-xs">Grand Total</td>
            {headerCells.map(({ key, colKey }, hi) => {
              const vf = valueFields[hi % valueFields.length];
              const allVals = sorted.flatMap(rk => lookup[rk]?.[colKey]?.[vf.field] ?? []);
              const v = aggregate(allVals, vf.agg);
              return (
                <td key={key} className="py-2.5 px-3 text-right font-mono text-purple-600 dark:text-purple-400 border-r border-border-main">
                  {fmt(v, vf.agg)}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Panel
// ─────────────────────────────────────────────────────────────────────────────
function FilterPanel({ filterFields, rows, filterState, onFilterChange }) {
  if (filterFields.length === 0) return null;

  return (
    <div className="glass-card rounded-xl p-4 border border-border-main space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-amber-500" />
        <h5 className="text-xs font-bold text-text-main">Active Filters</h5>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filterFields.map(field => {
          const uniqueVals = [...new Set(rows.map(r => String(r[field] ?? '')))].sort();
          const allowed = filterState[field] ?? new Set();
          const allSelected = allowed.size === 0;

          return (
            <div key={field} className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase block">{field}</label>
              <div className="border border-border-main rounded-lg p-2 max-h-[130px] overflow-y-auto space-y-1 bg-card-bg/40">
                {/* (All) option */}
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-amber-500/5 px-1 py-0.5 rounded">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => onFilterChange(field, new Set())}
                    className="rounded text-amber-500 focus:ring-amber-500/20 w-3 h-3"
                  />
                  <span className="font-semibold text-text-main">(All)</span>
                </label>
                {uniqueVals.map(v => (
                  <label key={v} className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-amber-500/5 px-1 py-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={allSelected || allowed.has(v)}
                      onChange={e => {
                        const next = new Set(allSelected ? uniqueVals : allowed);
                        if (e.target.checked) next.add(v);
                        else next.delete(v);
                        // If all are selected, reset to empty (= all)
                        if (next.size === uniqueVals.length) onFilterChange(field, new Set());
                        else onFilterChange(field, next);
                      }}
                      className="rounded text-amber-500 focus:ring-amber-500/20 w-3 h-3"
                    />
                    <span className="text-text-main truncate max-w-[120px]" title={v}>{v || '(blank)'}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main PivotTable Component
// ─────────────────────────────────────────────────────────────────────────────
export default function PivotTable({ data }) {
  const { headers, rows, columnTypes } = data;

  // Field zones
  const [zones, setZones] = useState({ rows: [], columns: [], values: [], filters: [] });
  const [valueAggs, setValueAggs]   = useState({}); // field -> agg function
  const [filterState, setFilterState] = useState({}); // field -> Set of allowed values
  const [sortState, setSortState]   = useState({ col: null, dir: null });

  // Track all placed fields
  const placedFields = useMemo(() =>
    new Set([...zones.rows, ...zones.columns, ...zones.values, ...zones.filters]),
    [zones]
  );

  const availableFields = useMemo(() =>
    headers.filter(h => !placedFields.has(h)),
    [headers, placedFields]
  );

  // DnD helpers
  const { onDragStart, onDrop, onDragOver } = useDndField();

  const handleDrop = useCallback((field, fromZone, toZone) => {
    if (fromZone === toZone) return;
    setZones(prev => {
      const next = { ...prev };
      // Remove from source
      if (fromZone !== 'available') {
        next[fromZone] = next[fromZone].filter(f => f !== field);
      }
      // Add to target
      if (toZone !== 'available') {
        if (!next[toZone].includes(field)) {
          next[toZone] = [...next[toZone], field];
        }
      }
      return next;
    });
    // Default agg for values
    if (toZone === 'values') {
      setValueAggs(prev => ({ ...prev, [field]: prev[field] ?? 'Sum' }));
    }
    // Reset filter when removed
    if (fromZone === 'filters') {
      setFilterState(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  }, []);

  const handleRemove = useCallback((field, zone) => {
    setZones(prev => ({ ...prev, [zone]: prev[zone].filter(f => f !== field) }));
    if (zone === 'filters') {
      setFilterState(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  }, []);

  const handleAddField = useCallback((field) => {
    // Smart add: numbers go to values, others to rows
    const type = columnTypes[field];
    const zone = type === 'number' ? 'values' : 'rows';
    setZones(prev => ({ ...prev, [zone]: [...prev[zone], field] }));
    if (zone === 'values') {
      setValueAggs(prev => ({ ...prev, [field]: prev[field] ?? 'Sum' }));
    }
  }, [columnTypes]);

  const handleAggChange = useCallback((field, agg) => {
    setValueAggs(prev => ({ ...prev, [field]: agg }));
  }, []);

  const handleFilterChange = useCallback((field, allowed) => {
    setFilterState(prev => ({ ...prev, [field]: allowed }));
  }, []);

  const handleReset = () => {
    setZones({ rows: [], columns: [], values: [], filters: [] });
    setValueAggs({});
    setFilterState({});
    setSortState({ col: null, dir: null });
  };

  // Build value fields array with agg
  const valueFields = useMemo(() =>
    zones.values.map(f => ({ field: f, agg: valueAggs[f] ?? 'Sum' })),
    [zones.values, valueAggs]
  );

  // Compute pivot
  const { rowKeys, colKeys, lookup } = useMemo(() =>
    computePivot(rows, zones.rows, zones.columns, valueFields, filterState),
    [rows, zones.rows, zones.columns, valueFields, filterState]
  );



  // Export pivot results
  const exportPivot = useCallback((format) => {
    if (rowKeys.length === 0 || valueFields.length === 0) {
      alert('Nothing to export. Please add row and value fields first.');
      return;
    }

    // Build flat rows for export
    const headerRow = ['Row Label', ...colKeys.flatMap(ck =>
      valueFields.map(vf => valueFields.length > 1 ? `${ck} | ${vf.agg}(${vf.field})` : ck)
    )];

    const dataRows = rowKeys.map(rk => {
      const row = { 'Row Label': rk };
      colKeys.forEach(ck => {
        valueFields.forEach((vf, vi) => {
          const key = valueFields.length > 1 ? `${ck} | ${vf.agg}(${vf.field})` : ck;
          const v   = aggregate(lookup[rk]?.[ck]?.[vf.field] ?? [], vf.agg);
          row[key] = v === '' ? '' : Number(fmt(v, vf.agg).replace(/,/g, '')) || v;
        });
      });
      return row;
    });

    // Grand total row
    const totalRow = { 'Row Label': 'Grand Total' };
    colKeys.forEach(ck => {
      valueFields.forEach((vf) => {
        const key = valueFields.length > 1 ? `${ck} | ${vf.agg}(${vf.field})` : ck;
        const all = rowKeys.flatMap(rk => lookup[rk]?.[ck]?.[vf.field] ?? []);
        const v   = aggregate(all, vf.agg);
        totalRow[key] = v === '' ? '' : v;
      });
    });
    dataRows.push(totalRow);

    try {
      const ws = XLSX.utils.json_to_sheet(dataRows, { header: headerRow });
      if (format === 'xlsx') {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pivot Table');
        XLSX.writeFile(wb, `pivot_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        const csv  = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `pivot_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.style.visibility = 'hidden';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  }, [rowKeys, colKeys, lookup, valueFields]);

  const hasResult = rowKeys.length > 0 && valueFields.length > 0;

  return (
    <div className="space-y-6">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <LayoutGrid className="w-5 h-5" />
            </span>
            Pivot Table
          </h2>
          <p className="text-xs text-text-muted mt-1.5 ml-11">
            Drag &amp; drop fields into zones to build an interactive pivot table. Supports Sum, Count, Average, Min &amp; Max aggregations.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main border border-border-main hover:border-purple-500/30 px-3 py-1.5 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          {hasResult && (
            <>
              <button
                onClick={() => exportPivot('csv')}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/5 px-3 py-1.5 rounded-xl transition-all"
              >
                <Layers className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => exportPivot('xlsx')}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-xl transition-all shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main layout: left config + right grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">

        {/* ── Left: Field Configuration Panel ── */}
        <div className="space-y-4">

          {/* Available Fields */}
          <div className="glass-card rounded-2xl p-4 border border-border-main space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-bold text-text-main">Available Fields</h4>
              </div>
              <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">{availableFields.length}</span>
            </div>

            <div
              onDragOver={onDragOver}
              onDrop={e => { e.preventDefault(); /* drop back to available = remove */ }}
              className="flex flex-wrap gap-1.5 min-h-[48px] border border-dashed border-border-main rounded-xl p-2"
            >
              {availableFields.length === 0 && (
                <span className="text-[10px] text-text-muted italic self-center">All fields are placed in zones.</span>
              )}
              {availableFields.map(f => {
                const type  = columnTypes[f] || 'text';
                const emoji = type === 'number' ? '🔢' : type === 'date' ? '📅' : type === 'location' ? '📍' : type === 'category' ? '🏷️' : '📝';
                return (
                  <div
                    key={f}
                    draggable
                    onDragStart={() => onDragStart(f, 'available')}
                    onClick={() => handleAddField(f)}
                    title={`${f} (${type}) — click or drag to add`}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border-main text-[11px] font-medium text-text-main cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all select-none"
                  >
                    <GripVertical className="w-2.5 h-2.5 opacity-40" />
                    <span className="text-[9px]">{emoji}</span>
                    <span className="max-w-[90px] truncate">{f}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-text-muted flex items-center gap-1">
              <Info className="w-3 h-3" /> Click a field to add it, or drag it into a zone below.
            </p>
          </div>

          {/* Drop Zones */}
          {(['rows', 'columns', 'values', 'filters']).map(zoneId => (
            <div
              key={zoneId}
              onDragOver={onDragOver}
            >
              <DropZone
                zoneId={zoneId}
                fields={zones[zoneId]}
                valueAggs={valueAggs}
                onRemove={handleRemove}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onAggChange={handleAggChange}
                handleDrop={handleDrop}
              />
            </div>
          ))}
        </div>

        {/* ── Right: Pivot Grid + Filters ── */}
        <div className="space-y-4">

          {/* Filter panel */}
          <FilterPanel
            filterFields={zones.filters}
            rows={rows}
            filterState={filterState}
            onFilterChange={handleFilterChange}
          />

          {/* Status bar */}
          {hasResult && (
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted px-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <strong className="text-text-main">{rowKeys.length.toLocaleString()}</strong> rows
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <strong className="text-text-main">{colKeys.length.toLocaleString()}</strong> columns
              </span>
              {Object.values(filterState).some(s => s.size > 0) && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <Filter className="w-3 h-3" /> Filters active
                </span>
              )}
              {sortState.col && (
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                  {sortState.dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Sorted
                </span>
              )}
            </div>
          )}

          {/* Empty state when no rows/cols configuration yet */}
          {!hasResult && (zones.rows.length === 0 || zones.values.length === 0) && (
            <div className="glass-card rounded-2xl border border-border-main p-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
                    <LayoutGrid className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-dashboard-bg flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">!</span>
                  </div>
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="font-bold text-text-main">Configure your pivot table</p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Add at least one <strong className="text-purple-500">Row</strong> field and one <strong className="text-emerald-500">Value</strong> field using the panel on the left.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-[11px]">
                  {[
                    { zone: 'rows', label: 'Rows', color: 'text-purple-500', added: zones.rows.length > 0 },
                    { zone: 'values', label: 'Values', color: 'text-emerald-500', added: zones.values.length > 0 },
                    { zone: 'columns', label: 'Columns', color: 'text-indigo-500', added: zones.columns.length > 0, optional: true },
                    { zone: 'filters', label: 'Filters', color: 'text-amber-500', added: zones.filters.length > 0, optional: true },
                  ].map(({ zone, label, color, added, optional }) => (
                    <span key={zone} className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${added ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'border-border-main text-text-muted'}`}>
                      {added ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                      <span className={added ? '' : color}>{label}{optional ? ' (opt.)' : ''}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pivot Grid */}
          <div className="glass-card rounded-2xl border border-border-main overflow-hidden">
            {hasResult && (
              <div className="flex items-center justify-between p-4 border-b border-border-main">
                <h4 className="text-sm font-bold text-text-main flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-purple-500" />
                  Pivot Results
                </h4>
                <span className="text-[10px] text-text-muted">Click column headers to sort</span>
              </div>
            )}
            <div className={hasResult ? 'p-4' : ''}>
              <PivotGrid
                rowKeys={rowKeys}
                colKeys={colKeys}
                lookup={lookup}
                valueFields={valueFields}
                sortState={sortState}
                onSort={setSortState}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
