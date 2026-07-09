import React, { useState, useMemo, useCallback } from 'react';
import { 
  MapPin, 
  Table, 
  BarChart4, 
  PieChart as PieIcon, 
  Globe,
  Copy,
  Check
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie } from 'recharts';
import { aggregateLocationStats } from '../utils/analyzer';

const COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#4f46e5', '#6366f1', '#818cf8', '#0d9488', '#0f766e', '#ec4899', '#f43f5e'];

// Copy-to-clipboard button with inline "Copied!" toast
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy: ${text}`}
      className={`ml-1.5 p-1 rounded-md transition-all duration-200 shrink-0 group/copy ${
        copied
          ? 'bg-emerald-500/15 text-emerald-500'
          : 'bg-transparent text-text-muted hover:bg-purple-500/10 hover:text-purple-500'
      }`}
    >
      {copied
        ? <Check className="w-3 h-3" />
        : <Copy className="w-3 h-3" />
      }
    </button>
  );
}

// Custom bar chart tooltip to show full location name
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, percentage } = payload[0].payload;
    return (
      <div className="glass-card border border-border-main rounded-xl px-3 py-2 text-xs shadow-lg max-w-[220px]">
        <p className="font-semibold text-text-main break-words leading-snug mb-1">{name}</p>
        <p className="text-text-muted">Records: <span className="font-mono text-purple-500">{value?.toLocaleString()}</span></p>
        {percentage !== undefined && (
          <p className="text-text-muted">Share: <span className="font-mono text-indigo-500">{percentage}%</span></p>
        )}
      </div>
    );
  }
  return null;
};

export default function TopLocations({ data }) {
  const { headers, rows, columnTypes } = data;

  const [activeLocCol, setActiveLocCol] = useState('');

  // Auto-detect location columns
  const locationColumns = useMemo(() => {
    return headers.filter(h => columnTypes[h] === 'location');
  }, [headers, columnTypes]);

  // Set default active location column
  React.useEffect(() => {
    if (locationColumns.length > 0 && !activeLocCol) {
      setActiveLocCol(locationColumns[0]);
    }
  }, [locationColumns, activeLocCol]);

  // Compute aggregation
  const locStats = useMemo(() => {
    if (locationColumns.length === 0 || !activeLocCol) return null;
    return aggregateLocationStats(headers, rows, columnTypes, activeLocCol);
  }, [headers, rows, columnTypes, activeLocCol, locationColumns]);

  if (locationColumns.length === 0 || !locStats) {
    return (
      <div className="glass-card rounded-2xl p-12 border border-border-main text-center space-y-4 max-w-xl mx-auto mt-12">
        <div className="p-4 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-500 w-fit mx-auto">
          <Globe className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-text-main">No Location Fields Identified</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            The analyzer search pattern (matching headers like City, Country, Address, Zip) did not identify geographic dimensions in this worksheet.
          </p>
        </div>
        <p className="text-xs bg-purple-500/5 text-purple-600 dark:text-purple-400 p-3 rounded-lg border border-purple-500/10">
          Tip: Try loading the **Corporate Sales &amp; Profit Analysis** sample dataset from the landing page or upload view to inspect location aggregation widgets.
        </p>
      </div>
    );
  }

  const { top10, uniqueCount, totalCount } = locStats;
  const displayRows = top10;

  return (
    <div className="space-y-6">
      
      {/* Selector and KPI cards */}
      <div className="glass-card rounded-2xl p-6 border border-border-main flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left space-y-1">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Active Location Dimension</label>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500 shrink-0" />
            <select
              value={activeLocCol}
              onChange={(e) => setActiveLocCol(e.target.value)}
              className="text-sm font-bold bg-transparent text-text-main border-none focus:ring-0 focus:outline-none cursor-pointer"
            >
              {locationColumns.map(col => (
                <option key={col} value={col} className="bg-card-bg text-text-main font-semibold">{col}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl px-5 py-2.5 text-left min-w-[120px]">
            <span className="text-[10px] text-text-muted font-light">Unique Nodes</span>
            <h5 className="text-lg font-bold text-text-main font-mono">{uniqueCount}</h5>
          </div>
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl px-5 py-2.5 text-left min-w-[120px]">
            <span className="text-[10px] text-text-muted font-light">Total Data Points</span>
            <h5 className="text-lg font-bold text-text-main font-mono">{totalCount}</h5>
          </div>
        </div>
      </div>

      {/* Ranks Table and distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 10 Table — full names, copy support */}
        <div className="glass-card rounded-2xl p-6 border border-border-main flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border-main pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-purple-500" />
              <h4 className="font-bold text-sm text-text-main">Top 10 Locations Ranking</h4>
            </div>
            <span className="text-[10px] text-text-muted font-light">Ordered by count</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-text-muted border-b border-border-main">
                  <th className="py-2.5 font-bold w-8">#</th>
                  <th className="py-2.5 font-bold">Location</th>
                  <th className="py-2.5 font-bold text-right whitespace-nowrap">Records</th>
                  <th className="py-2.5 font-bold text-right whitespace-nowrap">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main font-medium">
                {displayRows.map((item, idx) => (
                  <tr key={idx} className="hover:bg-purple-500/[0.02] transition-colors group">
                    <td className="py-3 font-semibold text-text-muted font-mono text-center">
                      {idx + 1 <= 9 ? (
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-500/15 text-amber-600' :
                          idx === 1 ? 'bg-slate-400/15 text-slate-500' :
                          idx === 2 ? 'bg-orange-500/15 text-orange-600' :
                          'bg-transparent text-text-muted'
                        }`}>
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-text-muted">{idx + 1}</span>
                      )}
                    </td>
                    {/* ✅ Full name — wraps, has tooltip, has copy button */}
                    <td className="py-3 text-text-main">
                      <div className="flex items-start gap-1 min-w-0">
                        {(() => {
                          const match = item.name.match(/(-?\d+(?:\.\d+)?)\|(-?\d+(?:\.\d+)?)/);
                          if (match) {
                            const [fullMatch, lat, lng] = match;
                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                            
                            // Split the string by the coordinates to style it nicely, highlighting the coordinate link
                            const idx = item.name.indexOf(fullMatch);
                            const prefix = item.name.substring(0, idx);
                            const suffix = item.name.substring(idx + fullMatch.length);

                            return (
                              <span
                                className="break-words whitespace-normal leading-snug"
                                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                              >
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
                          return (
                            <span
                              title={item.name}
                              className="break-words whitespace-normal leading-snug"
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
                              {item.name}
                            </span>
                          );
                        })()}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={item.name} />
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-text-main whitespace-nowrap">
                      {item.value.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono whitespace-nowrap">
                      <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-[10px]">
                        {item.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Copy-all tip */}
          <p className="text-[10px] text-text-muted mt-3 flex items-center gap-1 opacity-60">
            <Copy className="w-3 h-3" /> Hover any row to copy the full location name.
          </p>
        </div>

        {/* Charts block */}
        <div className="space-y-6">
          
          {/* Distribution chart */}
          <div className="glass-card rounded-2xl p-6 border border-border-main h-[240px] flex flex-col">
            <div className="flex items-center gap-2 border-b border-border-main pb-3 mb-4">
              <BarChart4 className="w-4 h-4 text-purple-500" />
              <h4 className="font-bold text-sm text-text-main">Top Locations Frequency</h4>
            </div>
            
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayRows.slice(0, 7)} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" opacity={0.3} />
                  {/* Tick labels abbreviated; full name shown in custom tooltip */}
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => v.length > 10 ? v.substring(0, 9) + '…' : v}
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {displayRows.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass-card rounded-2xl p-6 border border-border-main h-[240px] flex flex-col">
            <div className="flex items-center gap-2 border-b border-border-main pb-3 mb-4">
              <PieIcon className="w-4 h-4 text-purple-500" />
              <h4 className="font-bold text-sm text-text-main">Market Share Distribution</h4>
            </div>
            
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayRows.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={40}
                    dataKey="value"
                    label={({ name, percentage }) => `${name.substring(0,8)}… (${percentage}%)`}
                  >
                    {displayRows.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomBarTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
