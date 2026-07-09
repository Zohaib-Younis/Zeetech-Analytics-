import React, { useState } from 'react';
import { 
  BarChart, 
  Hash, 
  HelpCircle, 
  CheckCircle2, 
  Info,
  Calendar,
  Layers,
  Percent
} from 'lucide-react';

export default function AnalyticsPanel({ data, selectedColumns }) {
  const { headers, columnTypes, stats } = data;
  const { columnStats } = stats;

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'number' | 'category' | 'date'

  // Filter columns based on selected columns & active type tab
  const displayedStats = Object.values(columnStats).filter(col => {
    // Only display selected columns
    if (!selectedColumns[col.header]) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'number') return col.type === 'number';
    if (activeTab === 'category') return col.type === 'category' || col.type === 'location' || col.type === 'text';
    if (activeTab === 'date') return col.type === 'date';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Category Tabs */}
      <div className="flex border-b border-border-main pb-px overflow-x-auto gap-2">
        {[
          { id: 'all', name: 'All Variables', count: Object.keys(selectedColumns).filter(k => selectedColumns[k]).length },
          { id: 'number', name: 'Numeric Stats', count: Object.keys(selectedColumns).filter(k => selectedColumns[k] && columnTypes[k] === 'number').length },
          { id: 'category', name: 'Categories & Text', count: Object.keys(selectedColumns).filter(k => selectedColumns[k] && ['category', 'location', 'text'].includes(columnTypes[k])).length },
          { id: 'date', name: 'Timelines (Dates)', count: Object.keys(selectedColumns).filter(k => selectedColumns[k] && columnTypes[k] === 'date').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-text-muted hover:text-purple-600'
            }`}
          >
            <span>{tab.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-purple-500/10 text-purple-500' : 'bg-dashboard-bg text-text-muted'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedStats.length > 0 ? (
          displayedStats.map((col) => {
            const isNumeric = col.type === 'number';
            const isDate = col.type === 'date';
            const isText = ['category', 'location', 'text'].includes(col.type);

            return (
              <div 
                key={col.header} 
                className="glass-card rounded-2xl p-6 border border-border-main hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
              >
                
                {/* Header Title & Type */}
                <div className="flex items-start justify-between border-b border-border-main pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-text-main truncate max-w-[220px]">{col.header}</h4>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded-full capitalize font-medium">
                      {col.type === 'location' ? '📍 Location' : col.type} Variable
                    </span>
                  </div>

                  <div className="text-right text-[10px] text-text-muted">
                    <p>Total Filled: <strong className="text-text-main font-semibold">{col.count.toLocaleString()}</strong></p>
                    <p>Missing: <strong className="text-text-main font-semibold">{col.missingCount} ({col.missingPct.toFixed(1)}%)</strong></p>
                  </div>
                </div>

                {/* Specific stats details depending on data type */}
                {isNumeric && (
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><Hash className="w-3.5 h-3.5 text-purple-500" /> Average (Mean)</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.avg?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><Hash className="w-3.5 h-3.5 text-purple-500" /> Median</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.median?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Minimum</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.min?.toLocaleString() || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><CheckCircle2 className="w-3.5 h-3.5 text-pink-500" /> Maximum</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.max?.toLocaleString() || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><Layers className="w-3.5 h-3.5 text-indigo-500" /> Sum Total</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.sum?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 'N/A'}</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><Percent className="w-3.5 h-3.5 text-purple-500" /> Unique Values</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.uniqueCount}</p>
                    </div>

                  </div>
                )}

                {isDate && (
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    
                    <div className="space-y-1 text-left col-span-2">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><Calendar className="w-3.5 h-3.5 text-purple-500" /> Timeline Interval</span>
                      <p className="text-xs font-semibold text-text-main">
                        {col.min ? col.min.toLocaleDateString() : 'N/A'} — {col.max ? col.max.toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><Info className="w-3.5 h-3.5 text-purple-500" /> Span (Days)</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.spanDays} Days</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-light"><Layers className="w-3.5 h-3.5 text-purple-500" /> Uniques</span>
                      <p className="text-base font-bold text-text-main font-mono">{col.uniqueCount}</p>
                    </div>

                  </div>
                )}

                {isText && (
                  <div className="space-y-4 flex-1">
                    
                    {/* Top value summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] text-text-muted font-light">Most Common Value</span>
                        <p className="text-xs font-bold text-text-main truncate max-w-[150px]" title={col.topValue}>
                          {col.topValue}
                        </p>
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] text-text-muted font-light">Dominance Ratio</span>
                        <p className="text-base font-bold text-text-main font-mono">{col.topValuePct.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Simple bar graph of top frequencies */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-left block">
                        Frequencies (Top 3 of {col.uniqueCount} Uniques)
                      </span>
                      <div className="space-y-1.5">
                        {col.frequencies?.slice(0, 3).map((freq) => (
                          <div key={freq.value} className="space-y-1">
                            <div className="flex justify-between text-[10px] text-text-main font-medium">
                              <span className="truncate max-w-[160px]" title={freq.value}>{freq.value || '(blank)'}</span>
                              <span>{freq.count} ({freq.pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-border-main rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                                style={{ width: `${freq.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="col-span-2 p-12 text-center text-text-muted italic border border-dashed border-border-main rounded-2xl">
            No columns match the selected filters or active schema controls.
          </div>
        )}
      </div>

    </div>
  );
}
