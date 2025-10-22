import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBars } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Mobile Menu Button - Fixed Position */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-800/90 hover:bg-slate-700 backdrop-blur-lg rounded-xl border border-slate-700/50 text-slate-300 hover:text-cyan-400 transition-all duration-300 shadow-lg"
        aria-label="Toggle sidebar"
      >
        <FaBars className="text-xl" />
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Area */}
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1920px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-slate-800 border border-slate-700"
      />
    </motion.div>
  );
};

export default DashboardPage;
