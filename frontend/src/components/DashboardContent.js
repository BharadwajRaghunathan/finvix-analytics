import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You need to log in to access the dashboard');
        navigate('/login');
        return;
      }

      // Include token in Authorization header
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/dashboard', { headers });
      setDashboardData(res.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (err.response && err.response.status === 401) {
        // Handle invalid or expired token
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        // Handle other errors (e.g., network issues, server errors)
        toast.error('Failed to load dashboard data');
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="mb-8 border-b border-slate-700/50 pb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          24-Hour Performance Trends
        </h2>
        <p className="text-slate-400 text-sm">
          Real-time analytics updated every 5 seconds
        </p>
      </div>

      {/* Dashboard Content */}
      {dashboardData ? (
        <Dashboard data={dashboardData} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          {/* Loading Spinner */}
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          
          {/* Loading Text */}
          <p className="text-slate-300 text-lg font-medium mb-2">
            Loading dashboard data...
          </p>
          <p className="text-slate-500 text-sm">
            Fetching real-time analytics
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardContent;
