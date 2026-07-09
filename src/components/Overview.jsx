import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Columns, 
  HelpCircle, 
  Activity, 
  Lightbulb, 
  MapPin, 
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { generateAiInsights } from '../utils/analyzer';

export default function Overview({ 
  data, 
  setCurrentSection, 
  selectedColumns, 
  toggleColumnSelection 
}) {
  const { fileName, fileSize, headers, rows, columnTypes, stats } = data;
  const { summary, columnStats } = stats;

  const insights = generateAiInsights(headers, rows, columnTypes, stats);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const getQualityColor = (score) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-pink-500 bg-pink-500/10 border-pink-500/20';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* File Info Top Bar */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Active Dataset
          </span>
          <h2 className="text-xl font-bold text-text-main mt-2">{fileName}</h2>
          <p className="text-xs text-text-muted mt-0.5">File size: {fileSize} | Analyzed on user device</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentSection('upload')}
            className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white px-4 py-2.5 rounded-xl transition-all font-medium border border-purple-500/20"
          >
            Upload New File
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Records */}
        <motion.div variants={cardVariants} className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted">Total Records</span>
            <h3 className="text-3xl font-extrabold text-text-main">{summary.totalRecords.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> 100% Parsed
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <Database className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Columns */}
        <motion.div variants={cardVariants} className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted">Total Columns</span>
            <h3 className="text-3xl font-extrabold text-text-main">{summary.totalColumns}</h3>
            <span className="text-[10px] text-purple-500 font-medium cursor-pointer hover:underline" onClick={() => setCurrentSection('analytics')}>
              Manage schemas
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            <Columns className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Missing Values */}
        <motion.div variants={cardVariants} className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted">Missing Fields</span>
            <h3 className="text-3xl font-extrabold text-text-main">{summary.totalMissingCount.toLocaleString()}</h3>
            <span className="text-[10px] text-text-muted font-light">
              {summary.missingPct.toFixed(1)}% of all cells
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500">
            <HelpCircle className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Data Quality Score */}
        <motion.div variants={cardVariants} className="glass-card rounded-2xl p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted">Data Quality Score</span>
            <h3 className="text-3xl font-extrabold text-text-main">{summary.dataQualityScore.toFixed(1)}%</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-block ${getQualityColor(summary.dataQualityScore)}`}>
              {summary.dataQualityScore >= 90 ? 'Excellent' : summary.dataQualityScore >= 70 ? 'Optimal' : 'Needs attention'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <Activity className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column Configuration Selector */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <div>
              <h4 className="font-bold text-text-main">Column Fields Schema</h4>
              <p className="text-xs text-text-muted">Select or deselect columns to optimize graphs and analysis tables.</p>
            </div>
            <span className="text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
              {Object.keys(selectedColumns).filter(k => selectedColumns[k]).length} of {headers.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2">
            {headers.map(header => {
              const type = columnTypes[header];
              const stat = columnStats[header];
              const isSelected = selectedColumns[header];
              
              return (
                <div 
                  key={header}
                  onClick={() => toggleColumnSelection(header)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-purple-500/30 bg-purple-500/[0.03] hover:bg-purple-500/[0.06]' 
                      : 'border-border-main hover:border-purple-500/25 bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => {}} // Controlled in wrapper div onClick
                      className="rounded border-border-main text-purple-600 focus:ring-purple-500/30 w-4 h-4 cursor-pointer"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-text-main truncate max-w-[150px]">{header}</p>
                      <span className="text-[10px] text-text-muted capitalize">
                        {type === 'location' ? '📍 Location' : type}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-text-muted font-light">
                    <p>{stat.uniqueCount} Uniques</p>
                    <p>{stat.missingPct > 0 ? `${stat.missingPct.toFixed(0)}% missing` : '100% complete'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI smart Insights Feed */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border-main pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500 animate-bounce" />
              <h4 className="font-bold text-text-main">AI Smart Insights</h4>
            </div>
            <span className="text-[10px] text-text-muted flex items-center gap-1 font-light">
              <Clock className="w-3.5 h-3.5" /> Auto-Updated
            </span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border-main bg-dashboard-bg/50 flex gap-3 text-left">
                <div className="shrink-0 mt-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    insight.type === 'success' ? 'bg-emerald-500' :
                    insight.type === 'warning' ? 'bg-pink-500' : 'bg-purple-500'
                  }`} />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-text-main">{insight.title}</h5>
                  <p className="text-[11px] text-text-muted leading-relaxed font-light">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
