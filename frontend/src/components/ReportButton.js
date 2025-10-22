import React from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import { FiDownload, FiFileText, FiDatabase } from 'react-icons/fi';
import api from '../config/api';

const ReportButton = ({ sectionId, type, results, modelType, fileFormat = 'csv' }) => {
  const handleFrontendDownload = () => {
    const section = document.getElementById(sectionId);
    if (!section) {
      toast.error('Unable to generate report: Section not found');
      return;
    }

    const buttons = section.querySelector('.report-buttons');
    if (buttons) buttons.style.display = 'none';

    html2canvas(section).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('prediction-report.pdf');
      toast.success('Frontend report downloaded successfully!');
      if (buttons) buttons.style.display = 'flex';
    }).catch((err) => {
      console.error('Frontend report generation error:', err);
      toast.error('Failed to download frontend report');
      if (buttons) buttons.style.display = 'flex';
    });
  };

  const handleBackendDownload = async () => {
    if (!results || !modelType) {
      toast.error('No valid results or model type provided to generate report');
      return;
    }

    try {
      const res = await api.post('/report', 
        { results, model_type: modelType }, 
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
        }
      );

      const reportBlob = new Blob([res.data], { type: 'application/pdf' });
      
      if (reportBlob.size === 0) {
        throw new Error('Empty PDF received');
      }

      const reportUrl = window.URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `${modelType}_backend_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(reportUrl);
      
      toast.success('Backend report downloaded successfully!');
    } catch (err) {
      console.error('Backend report generation error:', err);
      
      if (err.response?.data) {
        try {
          const errorText = await err.response.data.text();
          let errorMessage = 'Unknown error';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText;
          }
          toast.error(`Failed to download backend report: ${errorMessage}`);
        } catch {
          toast.error('Failed to download backend report');
        }
      } else {
        toast.error(`Failed to download backend report: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleUploadReportDownload = async () => {
    console.log('Sending to /upload_report:', { results, model_type: modelType });
    
    if (!results || !Array.isArray(results) || results.length === 0 || !modelType) {
      toast.error('No valid results or model type provided to generate report');
      return;
    }

    try {
      const res = await api.post('/upload_report', 
        { results, model_type: modelType }, 
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
        }
      );

      const reportBlob = new Blob([res.data], { type: 'application/pdf' });
      
      if (reportBlob.size === 0) {
        throw new Error('Empty PDF received');
      }

      const reportUrl = window.URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `${modelType}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(reportUrl);
      
      toast.success('Upload report downloaded successfully!');
    } catch (err) {
      console.error('Upload report generation error:', err);
      
      if (err.response?.data) {
        try {
          const errorText = await err.response.data.text();
          let errorMessage = 'Unknown error';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText;
          }
          toast.error(`Failed to download upload report: ${errorMessage}`);
        } catch {
          toast.error('Failed to download upload report');
        }
      } else {
        toast.error(`Failed to download upload report: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleDownloadResults = async () => {
    if (!results || !modelType) {
      toast.error('No results or model type provided to download');
      return;
    }

    const fileType = fileFormat || 'csv';

    try {
      const res = await api.post('/download_results', 
        { results, model_type: modelType, file_type: fileType }, 
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
        }
      );

      const mimeType = fileType === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${modelType}_results.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Results downloaded successfully!');
    } catch (err) {
      console.error('Results download error:', err);
      toast.error('Failed to download results: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const handleDownload = () => {
    if (type === 'frontend') {
      handleFrontendDownload();
    } else if (type === 'backend') {
      handleBackendDownload();
    } else if (type === 'upload-report') {
      handleUploadReportDownload();
    } else if (type === 'download-results') {
      handleDownloadResults();
    }
  };

  // Button configuration based on type
  const getButtonConfig = () => {
    switch (type) {
      case 'frontend':
        return {
          text: 'Download Frontend Report',
          icon: <FiFileText className="text-lg" />,
          className: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
        };
      case 'backend':
        return {
          text: 'Download Report',
          icon: <FiFileText className="text-lg" />,
          className: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
        };
      case 'upload-report':
        return {
          text: 'Download Report (.pdf)',
          icon: <FiFileText className="text-lg" />,
          className: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
        };
      case 'download-results':
        return {
          text: `Download Results (.${fileFormat || 'csv'})`,
          icon: <FiDatabase className="text-lg" />,
          className: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
        };
      default:
        return {
          text: 'Download',
          icon: <FiDownload className="text-lg" />,
          className: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <motion.button
      onClick={handleDownload}
      className={`group relative overflow-hidden ${buttonConfig.className} text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 w-full`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative flex items-center justify-center space-x-2">
        {buttonConfig.icon}
        <span className="text-sm sm:text-base">{buttonConfig.text}</span>
      </div>
      
      {/* Animated shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    </motion.button>
  );
};

export default ReportButton;
