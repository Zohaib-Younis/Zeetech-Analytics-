import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  Edit3,
  CheckCircle,
  Compass,
  ArrowRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportsPanel({ data, selectedColumns }) {
  const { fileName, headers, rows, columnTypes, stats } = data;
  const { summary, columnStats } = stats;

  const [reportTitle, setReportTitle] = useState('Executive Data Analytics Briefing');
  const [reportSubtitle, setReportSubtitle] = useState('Automated summary report & quality verification');
  const [analystNotes, setAnalystNotes] = useState(
    'Based on descriptive parsing, this sheet is verified complete with optimal structure. High density dimensions are identified and localized. Further insights show positive metrics margins.'
  );

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const reportRef = useRef(null);

  // Filter columns to report
  const activeHeaders = headers.filter(h => selectedColumns[h]);

  const numericColumns = activeHeaders.filter(h => columnTypes[h] === 'number');
  const catColumns = activeHeaders.filter(h => ['category', 'location', 'text'].includes(columnTypes[h]));

  // Download Report PDF via html2canvas & jsPDF
  const downloadReportPdf = async () => {
    if (!reportRef.current) return;
    setGeneratingPdf(true);
    setPdfError(null);

    try {
      const element = reportRef.current;

      // Temporarily make the report element visible at full size for capture
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');

      // A4 page: 210 x 297 mm
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate image height maintaining aspect ratio
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yOffset = 0;
      let remainingHeight = imgHeight;

      // First page
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
      remainingHeight -= pageHeight;

      // Add additional pages if content overflows
      while (remainingHeight > 0) {
        yOffset -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      const safeTitle = reportTitle.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      pdf.save(`${safeTitle || 'report'}_briefing.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setPdfError('PDF generation failed: ' + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">

      {/* Settings Column */}
      <div className="glass-card rounded-2xl p-6 border border-border-main space-y-5 h-fit lg:col-span-1">
        <div className="flex items-center gap-2 border-b border-border-main pb-3">
          <Edit3 className="w-4 h-4 text-purple-500" />
          <h4 className="font-bold text-sm text-text-main">Configure Report Brief</h4>
        </div>

        {/* Report Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-text-muted uppercase">Brief Title</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-border-main rounded-xl bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-text-main"
          />
        </div>

        {/* Report Subtitle */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-text-muted uppercase">Brief Subtitle</label>
          <input
            type="text"
            value={reportSubtitle}
            onChange={(e) => setReportSubtitle(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-border-main rounded-xl bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-text-main"
          />
        </div>

        {/* Summary Text Comments */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-text-muted uppercase">Analyst Commentary</label>
          <textarea
            rows={4}
            value={analystNotes}
            onChange={(e) => setAnalystNotes(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-border-main rounded-xl bg-dashboard-bg/50 focus:bg-dashboard-bg focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-text-main"
          />
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={downloadReportPdf}
            disabled={generatingPdf}
            className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 rounded-xl text-xs shadow-md transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            {generatingPdf ? 'Building PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center justify-center p-2 rounded-xl border border-border-main text-text-muted hover:text-purple-600 hover:bg-purple-500/10 transition-all"
            title="System Print Preview"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
        {pdfError && (
          <p className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mt-2">
            ⚠️ {pdfError}
          </p>
        )}
      </div>

      {/* Live A4 printable page container */}
      <div className="lg:col-span-2">

        {/* Printable Canvas Sheet */}
        <div
          ref={reportRef}
          className="bg-white text-slate-800 p-10 md:p-14 shadow-md rounded-2xl border border-slate-200 min-h-[842px] max-w-[595px] mx-auto flex flex-col justify-between font-sans leading-relaxed select-text"
        >

          {/* Executive Header */}
          <div className="space-y-3 border-b-2 border-slate-100 pb-6 text-left">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                Executive Briefing
              </span>
              <span className="text-[10px] text-slate-400 font-light">
                {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{reportTitle}</h1>
            <p className="text-xs text-slate-500 font-light">{reportSubtitle}</p>
          </div>

          {/* Dataset source card */}
          <div className="bg-slate-50 rounded-xl p-4 my-6 text-left space-y-2 border border-slate-100 text-xs">
            <h5 className="font-semibold text-slate-800">Source Document: {fileName}</h5>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-light">
              <p>Records: <strong className="text-slate-700 font-semibold">{summary.totalRecords.toLocaleString()}</strong></p>
              <p>Columns: <strong className="text-slate-700 font-semibold">{summary.totalColumns}</strong></p>
              <p>Completeness: <strong className="text-slate-700 font-semibold">{summary.dataQualityScore.toFixed(1)}%</strong></p>
            </div>
          </div>

          {/* Executive Commentary */}
          <div className="space-y-2 my-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Executive Summary Remarks</h4>
            <p className="text-xs text-slate-600 font-light leading-relaxed border-l-2 border-purple-500 pl-3">
              {analystNotes || 'No notes provided by analyst.'}
            </p>
          </div>

          {/* Variables breakdown analysis */}
          <div className="space-y-6 my-6 text-left flex-1">

            {/* Numeric Indicators */}
            {numericColumns.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Metric Calculations</h4>
                <div className="grid grid-cols-2 gap-3">
                  {numericColumns.slice(0, 4).map(col => {
                    const stat = columnStats[col];
                    return (
                      <div key={col} className="border border-slate-100 rounded-lg p-3 text-xs">
                        <p className="font-semibold text-slate-700 truncate">{col}</p>
                        <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 font-light mt-1">
                          <p>Avg: <span className="font-semibold text-slate-600 font-mono">{stat.avg?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || '0'}</span></p>
                          <p>Sum: <span className="font-semibold text-slate-600 font-mono">{stat.sum?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Indicators */}
            {catColumns.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorical Distributions</h4>
                <div className="space-y-2">
                  {catColumns.slice(0, 3).map(col => {
                    const stat = columnStats[col];
                    return (
                      <div key={col} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 truncate max-w-[150px]">{col}</span>
                        <span className="text-[10px] text-slate-500 font-light">
                          Top: <strong className="text-slate-700 font-semibold">{stat.topValue}</strong> ({stat.topValuePct.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Printable Footer */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-between text-[9px] text-slate-400 font-light mt-6">
            <span>HawkEye Intelligence Report Studio</span>
            <span>Page 1 of 1</span>
          </div>

        </div>

      </div>

    </div>
  );
}
