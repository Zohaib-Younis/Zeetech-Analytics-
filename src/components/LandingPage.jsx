import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  BarChart3, 
  MapPin, 
  BrainCircuit, 
  Download, 
  Database,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function LandingPage({ onDataLoaded }) {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-height-screen bg-dashboard-bg overflow-hidden flex flex-col items-center justify-center p-6 md:p-12">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl w-full z-10 flex flex-col items-center"
      >
        {/* Header Logo */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-3 px-4 py-1.5 rounded-full glass border border-purple-500/20 mb-8"
        >
          <BrainCircuit className="w-5 h-5 text-purple-500 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Next-Gen Business Intelligence
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          variants={itemVariants}
          className="text-center font-display text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-text-main leading-[1.1] mb-6"
        >
          AI-Powered Analytics for{' '}
          <span className="bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 bg-clip-text text-transparent">
            Your Spreadsheets
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-center text-lg md:text-xl text-text-muted max-w-2xl font-light mb-12"
        >
          Upload any Excel or CSV file. Instantly auto-detect columns, extract geo-locations, generate advanced metrics, compile smart summaries, and export customizable reports.
        </motion.p>

        {/* Actions */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mb-16 z-20"
        >
          <button
            onClick={() => onDataLoaded('upload_view')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-8 py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Upload Spreadsheet
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6"
        >
          <div className="glass-card p-8 rounded-2xl flex flex-col items-start hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 mb-6">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-text-main mb-2">Automated Column Detection</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Intelligently parses headers and values, identifying numbers, strings, dates, location lists, and categorizing dimensions dynamically.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col items-start hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-text-main mb-2">Smart Location Analytics</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Finds geographic headers (City, Address, Country). Instantly calculates market shares, distributions, and aggregates top 10 maps.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col items-start hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-500 mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-text-main mb-2">Custom Visual Studio</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Select variables dynamically, design Bar, Line, Pie, and Area plots, and format visual color themes suitable for client reviews.
            </p>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap gap-8 justify-center text-xs text-text-muted mt-16 pt-8 border-t border-border-main w-full"
        >
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Local parsing (your data never leaves your device)</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Descriptive Statistics & Value Outliers</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Excel, CSV, PDF & Image Exports</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
