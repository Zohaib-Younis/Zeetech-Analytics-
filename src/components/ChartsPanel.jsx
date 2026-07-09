import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Sliders, 
  RotateCw,
  TrendingDown,
  LineChart as LineIcon
} from 'lucide-react';

const PALETTES = {
  sunset: ['#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'],
  oceanic: ['#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'],
  emerald: ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#a7f3d0', '#ccfbf1', '#f0fdf4'],
  midnight: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#f5f3ff', '#ede9fe'],
};

export default function ChartsPanel({ data, selectedColumns }) {
  const { headers, rows, columnTypes, stats } = data;

  const [chartType, setChartType] = useState('bar'); // 'bar' | 'line' | 'area' | 'pie' | 'doughnut'
  const [xAxisCol, setXAxisCol] = useState('');
  const [yAxisCol, setYAxisCol] = useState(''); // Column name or 'count'
  const [aggMethod, setAggMethod] = useState('sum'); // 'sum' | 'avg' | 'count'
  const [palette, setPalette] = useState('sunset');

  // Filter columns of interest
  const activeColumns = useMemo(() => {
    return headers.filter(h => selectedColumns[h]);
  }, [headers, selectedColumns]);

  const numericColumns = useMemo(() => {
    return activeColumns.filter(h => columnTypes[h] === 'number');
  }, [activeColumns, columnTypes]);

  // Set default axes if empty
  React.useEffect(() => {
    if (activeColumns.length > 0 && !xAxisCol) {
      // Prefer category, text, or location for X axis
      const preferredX = activeColumns.find(h => ['category', 'location', 'text'].includes(columnTypes[h])) || activeColumns[0];
      setXAxisCol(preferredX);
    }
    if (numericColumns.length > 0 && !yAxisCol) {
      setYAxisCol(numericColumns[0]);
    } else if (numericColumns.length === 0) {
      setYAxisCol('count');
      setAggMethod('count');
    }
  }, [activeColumns, numericColumns, xAxisCol, yAxisCol, columnTypes]);

  // Compute aggregated data for Recharts
  const chartData = useMemo(() => {
    if (!xAxisCol || !yAxisCol) return [];

    const groups = {};
    rows.forEach(row => {
      let xVal = row[xAxisCol];
      if (xVal instanceof Date) xVal = xVal.toLocaleDateString();
      if (xVal === null || xVal === undefined || xVal === '') xVal = '(blank)';
      xVal = String(xVal).trim();

      let yVal = 0;
      if (yAxisCol !== 'count') {
        const rawY = row[yAxisCol];
        if (rawY !== null && rawY !== undefined) {
          yVal = typeof rawY === 'number' ? rawY : Number(String(rawY).replace(/[\$,%]/g, ''));
          if (isNaN(yVal)) yVal = 0;
        }
      }

      if (!groups[xVal]) {
        groups[xVal] = { name: xVal, values: [], sum: 0, count: 0 };
      }

      groups[xVal].values.push(yVal);
      groups[xVal].sum += yVal;
      groups[xVal].count += 1;
    });

    const result = Object.values(groups).map(g => {
      let val = 0;
      if (aggMethod === 'sum') val = g.sum;
      else if (aggMethod === 'avg') val = g.count > 0 ? g.sum / g.count : 0;
      else if (aggMethod === 'count') val = g.count;

      return {
        name: g.name,
        value: Number(val.toFixed(2)),
        count: g.count
      };
    });

    // Sort by value descending, or limit to top 15 for charting cleanliness
    return result.sort((a, b) => b.value - a.value).slice(0, 15);
  }, [rows, xAxisCol, yAxisCol, aggMethod]);

  const activePaletteColors = PALETTES[palette];

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-text-muted italic text-xs">
          Select configuration options to render visual workspace.
        </div>
      );
    }

    const valueLabel = yAxisCol === 'count' 
      ? 'Record Count' 
      : `${yAxisCol} (${aggMethod.toUpperCase()})`;

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-main)', borderRadius: '12px' }}
                labelClassName="text-text-main font-bold text-xs"
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Line 
                name={valueLabel} 
                type="monotone" 
                dataKey="value" 
                stroke={activePaletteColors[0]} 
                strokeWidth={3}
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activePaletteColors[0]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={activePaletteColors[0]} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-main)', borderRadius: '12px' }}
                labelClassName="text-text-main font-bold text-xs"
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Area 
                name={valueLabel} 
                type="monotone" 
                dataKey="value" 
                stroke={activePaletteColors[0]} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
      case 'doughnut':
        const isDoughnut = chartType === 'doughnut';
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name.substring(0,10)} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={isDoughnut ? 80 : 90}
                innerRadius={isDoughnut ? 55 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={activePaletteColors[index % activePaletteColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-main)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-main)', borderRadius: '12px' }}
                labelClassName="text-text-main font-bold text-xs"
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Bar 
                name={valueLabel} 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={activePaletteColors[index % activePaletteColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Configuration Controls Sidebar */}
      <div className="glass-card rounded-2xl p-6 border border-border-main space-y-5 text-left lg:col-span-1 h-fit">
        <div className="flex items-center gap-2 border-b border-border-main pb-3 mb-1">
          <Sliders className="w-4 h-4 text-purple-500" />
          <h4 className="font-bold text-sm text-text-main">Chart Studio Config</h4>
        </div>

        {/* 1. Chart Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Plot Representation</label>
          <div className="grid grid-cols-5 gap-1 bg-dashboard-bg/50 p-1 rounded-lg">
            {[
              { id: 'bar', icon: BarChart3, label: 'Bar' },
              { id: 'line', icon: LineIcon, label: 'Line' },
              { id: 'area', icon: TrendingUp, label: 'Area' },
              { id: 'pie', icon: PieIcon, label: 'Pie' },
              { id: 'doughnut', icon: RotateCw, label: 'Donut' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setChartType(item.id)}
                title={item.label}
                className={`p-2 rounded-md hover:bg-purple-500/10 transition-colors flex items-center justify-center ${
                  chartType === item.id 
                    ? 'bg-purple-600 text-white shadow-sm hover:bg-purple-600' 
                    : 'text-text-muted hover:text-purple-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* 2. X-Axis Variable */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">X-Axis (Dimension)</label>
          <select
            value={xAxisCol}
            onChange={(e) => setXAxisCol(e.target.value)}
            className="w-full text-xs border border-border-main rounded-xl bg-card-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-text-main"
          >
            {activeColumns.map(col => (
              <option key={col} value={col}>{col} ({columnTypes[col]})</option>
            ))}
          </select>
        </div>

        {/* 3. Y-Axis Variable */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Y-Axis (Metrics)</label>
          <select
            value={yAxisCol}
            onChange={(e) => {
              setYAxisCol(e.target.value);
              if (e.target.value === 'count') {
                setAggMethod('count');
              } else if (aggMethod === 'count') {
                setAggMethod('sum');
              }
            }}
            className="w-full text-xs border border-border-main rounded-xl bg-card-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-text-main"
          >
            <option value="count">Record Count (Frequencies)</option>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col} (Value)</option>
            ))}
          </select>
        </div>

        {/* 4. Aggregation Method */}
        {yAxisCol !== 'count' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Aggregation Type</label>
            <select
              value={aggMethod}
              onChange={(e) => setAggMethod(e.target.value)}
              className="w-full text-xs border border-border-main rounded-xl bg-card-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-text-main"
            >
              <option value="sum">Sum of Values</option>
              <option value="avg">Average Value</option>
              <option value="count">Frequency Count</option>
            </select>
          </div>
        )}

        {/* 5. Theme Palette */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Color Themes</label>
          <select
            value={palette}
            onChange={(e) => setPalette(e.target.value)}
            className="w-full text-xs border border-border-main rounded-xl bg-card-bg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-text-main capitalize"
          >
            {Object.keys(PALETTES).map(key => (
              <option key={key} value={key}>{key} Glow</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Plot Area */}
      <div className="glass-card rounded-2xl p-6 border border-border-main lg:col-span-3 flex flex-col justify-between h-[450px]">
        <div className="flex justify-between items-center border-b border-border-main pb-3">
          <div className="text-left">
            <h4 className="font-bold text-sm text-text-main">
              {xAxisCol} vs. {yAxisCol === 'count' ? 'Records' : yAxisCol}
            </h4>
            <p className="text-[10px] text-text-muted font-light mt-0.5">Top 15 categories aggregated automatically.</p>
          </div>
          <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full uppercase font-semibold">
            {chartType} Chart View
          </span>
        </div>

        <div className="flex-1 w-full mt-4">
          {renderChart()}
        </div>
      </div>

    </div>
  );
}
