import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        className="text-center max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* 404 Illustration */}
        <motion.div
          className="mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full border-4 border-cyan-500/30 mb-6">
            <FiAlertTriangle className="text-6xl text-cyan-400" />
          </div>
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            404
          </h1>
        </motion.div>

        {/* Error Message */}
        <motion.div
          className="mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-slate-500">
            Error Code: 404 | Requested URL not found
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link
            to="/"
            className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <FiHome className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Home</span>
          </Link>

          <Link
            to="/dashboard"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
          >
            Go to Dashboard
          </Link>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          className="mt-12 pt-8 border-t border-slate-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-slate-500 text-sm mb-4">
            You might be interested in:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/manualinputs"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300"
            >
              Manual Predictions
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              to="/fileupload"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300"
            >
              File Uploads
            </Link>
            <span className="text-slate-700">•</span>
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300"
            >
              Login
            </Link>
          </div>
        </motion.div>

        {/* Support Message */}
        <motion.p
          className="mt-8 text-slate-600 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Need help? Contact our support team or check the documentation
        </motion.p>
      </motion.div>
    </div>
  );
}

export default NotFound;
