import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import ReportButton from './ReportButton';

const FileUploadContent = () => {
  const [fileUploadResults, setFileUploadResults] = useState(null);
  const [modelType, setModelType] = useState('both');
  const [fileFormat, setFileFormat] = useState('csv');

  const handleFileUploadResults = (results, modelType, format = 'csv') => {
    const normalizedResults = Array.isArray(results) ? results : [results];
    setFileUploadResults(normalizedResults);
    setModelType(modelType);
    setFileFormat(format);
  };

  const handleClearResults = () => {
    setFileUploadResults(null);
    setModelType('both');
    setFileFormat('csv');
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg">
        <div className="border-b border-slate-700/50 pb-6 mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            File Uploads & Predictions
          </h2>
          <p className="text-slate-400 text-sm">
            Upload your data files and get AI-powered predictions instantly
          </p>
        </div>

        {/* File Upload Component */}
        <FileUpload onUpload={handleFileUploadResults} />
      </div>

      {/* Results Section - Only shown after upload */}
      {fileUploadResults && fileUploadResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Results Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-2">
                  Prediction Results
                </h3>
                <p className="text-slate-400 text-sm">
                  {fileUploadResults.length} prediction{fileUploadResults.length > 1 ? 's' : ''} generated successfully
                </p>
              </div>
              <button
                onClick={handleClearResults}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Results Display */}
          <ResultsDisplay results={fileUploadResults} modelType={modelType} />

          {/* Report Action Buttons */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">Export Options</h3>
              <p className="text-slate-400 text-sm">
                Download your predictions as PDF reports or {fileFormat.toUpperCase()} files
              </p>
            </div>

            {/* Responsive Button Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReportButton
                type="upload-report"
                results={fileUploadResults}
                modelType={modelType}
              />
              <ReportButton
                type="download-results"
                results={fileUploadResults}
                modelType={modelType}
                fileFormat={fileFormat}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State - When no results */}
      {!fileUploadResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-12 shadow-2xl border border-slate-700/50 backdrop-blur-lg text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No predictions yet
            </h3>
            <p className="text-slate-500 text-sm">
              Upload a CSV or Excel file above to generate predictions
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FileUploadContent;
