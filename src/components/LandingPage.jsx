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
  ShieldCheck,
  Mail,
  Phone,
  Github
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

        {/* User Profile Info */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center gap-4 mb-8"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <img 
                src="/zohaib.jpeg" 
                alt="Zohaib Younis"
                className="w-full h-full object-cover rounded-full border-4 border-dashboard-bg"
              />
            </div>
            <div className="absolute bottom-1 right-2 w-6 h-6 bg-emerald-500 border-[3px] border-dashboard-bg rounded-full"></div>
          </div>

          {/* Name & Title */}
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-text-main">
              Zohaib Younis
            </h2>
            <p className="text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mt-0.5">
              Fullstack Developer
            </p>
            <p className="text-sm text-text-muted mt-1.5 flex items-center justify-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> SPManchester Pvt Ltd
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/zohaib.mayo_/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-pink-500/25 bg-pink-500/5 hover:bg-pink-500/15 hover:border-pink-500/50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-pink-500/10"
              title="Instagram"
            >
              <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-xs font-semibold text-pink-500 hidden sm:block">Instagram</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/zohaib-younis/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/15 hover:border-blue-500/50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/10"
              title="LinkedIn"
            >
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-xs font-semibold text-blue-500 hidden sm:block">LinkedIn</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Zohaib-Younis"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-text-muted/25 bg-text-muted/5 hover:bg-purple-500/10 hover:border-purple-500/40 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-purple-500/10"
              title="GitHub"
            >
              <Github className="w-4 h-4 text-text-main" />
              <span className="text-xs font-semibold text-text-main hidden sm:block">GitHub</span>
            </a>

            {/* Email */}
            <a
              href="mailto:mr.zohaibyounus@gmail.com"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500/50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-emerald-500/10"
              title="Email"
            >
              <Mail className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-500 hidden sm:block">mr.zohaibyounus@gmail.com</span>
            </a>

            {/* Phone */}
            <a
              href="tel:+923245454800"
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-amber-500/10"
              title="Call"
            >
              <Phone className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500 hidden sm:block">+92324-5454800</span>
            </a>
          </div>
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
