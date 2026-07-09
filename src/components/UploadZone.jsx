import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  Loader2, 
  CheckCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import { parseExcelFile, detectColumnTypes } from '../utils/excelParser';
import { calculateDatasetStats } from '../utils/analyzer';

export default function UploadZone({ onDataLoaded }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    setError(null);
    setLoading(true);

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError('Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      setLoading(false);
      return;
    }

    try {
      const parsedData = await parseExcelFile(file);
      const types = detectColumnTypes(parsedData.headers, parsedData.rows);
      const stats = calculateDatasetStats(parsedData.headers, parsedData.rows, types);

      onDataLoaded({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        headers: parsedData.headers,
        rows: parsedData.rows,
        columnTypes: types,
        stats: stats
      });
    } catch (err) {
      setError(err.message || 'An error occurred while parsing the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };


  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 py-8 px-4">
      
      {/* Upload Zone Card */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`glass-card rounded-2xl p-12 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all min-h-[350px] relative ${
          isDragActive 
            ? 'border-purple-500 bg-purple-500/5 scale-[1.01]' 
            : 'border-border-main hover:border-purple-500/50 hover:bg-purple-500/[0.01]'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
        />

        {loading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-text-main">Parsing Data Sheet...</h3>
              <p className="text-xs text-text-muted">Analyzing column schemas and extracting metrics locally.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
              <Upload className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-text-main">Drag and drop your spreadsheet here</h3>
              <p className="text-sm text-text-muted max-w-sm">
                Supports Excel (.xlsx, .xls) and standard Comma Separated Values (.csv) up to 25MB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onButtonClick}
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition-all text-sm"
              >
                Browse Files
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-pink-500/10 border border-pink-500/20 text-pink-500 p-3 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-left font-medium">{error}</span>
          </div>
        )}
      </div>

    </div>
  );
}
