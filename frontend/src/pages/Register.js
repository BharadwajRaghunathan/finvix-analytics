import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiUser, FiMail, FiLock, FiUserPlus, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/register', { username, email, password });
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username or email may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Register Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-700/50 backdrop-blur-xl">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <FiUserPlus className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
              Register for Finvix
            </h2>
            <p className="text-slate-400 text-sm">
              Create your account to access AI-powered analytics
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertCircle className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-slate-500 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-slate-500 text-lg" />
                </div>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-slate-500 text-lg" />
                </div>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Register Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 ${
                isLoading
                  ? 'bg-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/50'
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="text-xl" />
                  <span>Create Account</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-center text-slate-400 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start space-x-3">
            <FiCheckCircle className="text-cyan-400 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">
                Why create an account?
              </p>
              <ul className="text-slate-400 text-xs space-y-1">
                <li>• Access AI-powered marketing predictions</li>
                <li>• Real-time analytics dashboard</li>
                <li>• Export detailed reports</li>
                <li>• Secure data storage</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          className="text-center text-slate-500 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          By registering, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
