import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiX, FiFile } from 'react-icons/fi';

const FileUpload = ({ onUpload }) => {
  const [modelType, setModelType] = useState('both');
  const [file, setFile] = useState(null);
  const [fileFormat, setFileFormat] = useState('csv');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    document.querySelector('input[type="file"]').value = null;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_type', modelType);
    formData.append('file_format', fileFormat);

    try {
      const res = await axios.post('http://localhost:5000/upload_predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      let results = res.data.results || (res.data.status === 'success' ? [res.data] : res.data);
      if (!Array.isArray(results)) {
        results = [results];
      }
      onUpload(results, modelType, fileFormat);
      toast.success('File uploaded and predictions generated successfully!');
    } catch (err) {
      console.error('File upload error:', err.response?.data || err);
      const errorMessage = err.response?.data?.error || 'Unknown error';
      toast.error(`Failed to upload file: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setFile(null);
      document.querySelector('input[type="file"]').value = null;
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          Upload Your Data
        </h3>
        <p className="text-slate-400 text-sm">
          Upload CSV or Excel files for batch predictions
        </p>
      </div>

      {/* Form Grid - Responsive 2 columns on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* File Format Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">File Format</label>
          <select
            value={fileFormat}
            onChange={(e) => setFileFormat(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 cursor-pointer hover:bg-slate-700"
          >
            <option value="csv">CSV (.csv)</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
        </div>

        {/* Model Type Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Prediction Type</label>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 cursor-pointer hover:bg-slate-700"
          >
            <option value="roi">ROI Only</option>
            <option value="conversions">Conversions Only</option>
            <option value="both">Both Metrics</option>
          </select>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">Select File</label>
        <div className="relative">
          {/* Hidden File Input */}
          <input
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />

          {/* Custom File Upload Button */}
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full bg-slate-700/30 border-2 border-dashed border-slate-600 rounded-xl px-6 py-8 cursor-pointer hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group"
          >
            {!file ? (
              <div className="text-center">
                <FiUploadCloud className="mx-auto text-5xl text-slate-400 group-hover:text-cyan-400 transition-colors duration-300 mb-3" />
                <p className="text-slate-300 font-medium mb-1">Click to upload file</p>
                <p className="text-slate-500 text-sm">CSV or Excel files only</p>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-500/20 p-3 rounded-lg">
                    <FiFile className="text-2xl text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {file.name}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFile();
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors duration-300"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300">Uploading...</span>
            <span className="text-sm font-medium text-cyan-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <motion.button
        onClick={handleUpload}
        disabled={isUploading || !file}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
          isUploading || !file
            ? 'bg-slate-700 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/50'
        }`}
        whileHover={!isUploading && file ? { scale: 1.02 } : {}}
        whileTap={!isUploading && file ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {isUploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading... {uploadProgress}%</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <FiUploadCloud className="text-xl" />
            <span>Predict Now</span>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

export default FileUpload;
