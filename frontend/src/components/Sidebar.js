import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiUploadCloud, FiX } from 'react-icons/fi';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiHome className="text-xl" /> },
    { label: 'Prediction', path: '/manualinputs', icon: <FiTrendingUp className="text-xl" /> },
    { label: 'File Uploads', path: '/fileupload', icon: <FiUploadCloud className="text-xl" /> },
  ];

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 lg:justify-center">
          <div className="flex items-center space-x-3 lg:space-x-0">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg lg:hidden">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 lg:hidden">
              Finvix
            </h3>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all duration-300"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={index}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-400'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors duration-300`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-slate-400 text-xs mb-2">Current Version</p>
            <p className="text-slate-200 text-sm font-semibold">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
