import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLogOut, FiUser, FiStar } from 'react-icons/fi';
import api from '../config/api';

const Greeting = () => {
  const [username, setUsername] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGreeting = async () => {
      const token = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');

      if (!token) {
        navigate('/login');
        return;
      }

      // Use stored username immediately for better UX
      if (storedUsername) {
        setUsername(storedUsername);
      }

      try {
        const response = await api.get('/greeting');
        setUsername(response.data.username);
        setQuotes(response.data.quotes || []);
      } catch (error) {
        console.error('Error fetching greeting data:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          navigate('/login');
        } else {
          // If greeting endpoint fails, still show username from localStorage
          if (storedUsername) {
            setUsername(storedUsername);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGreeting();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-4xl">
        {/* Main Greeting Card */}
        <motion.div
          className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-700/50 backdrop-blur-xl"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* User Avatar & Welcome */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <FiUser className="text-4xl sm:text-5xl text-white" />
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Welcome back,
              </span>
              <br />
              <span className="text-white">{username || 'User'}!</span>
            </motion.h2>

            <p className="text-slate-400 text-sm sm:text-base">
              Ready to dive into your analytics dashboard
            </p>
          </div>

          {/* Motivational Quotes Section */}
          {quotes && quotes.length > 0 && (
            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <FiStar className="text-yellow-400 text-xl" />
                <h3 className="text-lg font-semibold text-slate-300">
                  Daily Insights
                </h3>
                <FiStar className="text-yellow-400 text-xl" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {quotes.map((quote, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 sm:p-6 hover:border-cyan-500/30 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.15 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-cyan-400 text-2xl flex-shrink-0">"</div>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic flex-1">
                        {quote}
                      </p>
                      <div className="text-cyan-400 text-2xl flex-shrink-0 self-end">"</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dashboard Button */}
            <motion.button
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
            >
              <div className="relative flex items-center justify-center space-x-2">
                <span className="text-base sm:text-lg">Go to Dashboard</span>
                <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              className="group bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-semibold py-4 px-6 rounded-xl border border-slate-600 hover:border-red-500/50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
            >
              <div className="flex items-center justify-center space-x-2">
                <FiLogOut className="text-xl" />
                <span className="text-base sm:text-lg">Logout</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          className="text-center text-slate-500 text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Powered by FINVIX AI Analytics Platform
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Greeting;
