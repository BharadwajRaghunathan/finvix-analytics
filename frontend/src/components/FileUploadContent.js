import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import ReportButton from './ReportButton';

const FileUploadContent = () => {
  const [fileUploadResults, setFileUploadResults] = useState(null);
  const [modelType, setModelType] = useState('both');

  const handleFileUploadResults = (results, modelType) => {
    const normalizedResults = Array.isArray(results) ? results : [results];
    setFileUploadResults(normalizedResults);
    setModelType(modelType);
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
      {fileUploadResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Results Display */}
          <ResultsDisplay results={fileUploadResults} modelType={modelType} />

          {/* Report Action Buttons */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">Export Options</h3>
              <p className="text-slate-400 text-sm">
                Download your predictions as PDF reports or CSV files
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
              />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FileUploadContent;
