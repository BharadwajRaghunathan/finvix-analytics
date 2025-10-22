import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HashLink } from 'react-router-hash-link';
import { Link, useNavigate } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import axios from 'axios';
import { toast } from 'react-toastify';
import finvixLogo from '../assets/finvix_logo.jpg';
import { FiMenu, FiX } from 'react-icons/fi';

const Home = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const navLinks = useMemo(() => [
    { name: 'Home', path: '#home', id: 'home' },
    { name: 'About', path: '#about', id: 'about' },
    { name: 'Why Finvix?', path: '#why-finvix', id: 'why-finvix' },
    { name: 'Features', path: '#features', id: 'features' },
  ], []);

  // Unused function - can be removed
  const onPredict = async (inputArray, modelType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to make predictions');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/predict',
        { inputArray, modelType },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Prediction successful!');
      console.log('Prediction result:', response.data);
    } catch (error) {
      console.error('Prediction error:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Unauthorized. Please log in again.');
        navigate('/login');
      } else {
        toast.error('Prediction failed. Please try again.');
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setActiveSection(sectionId);
            window.history.replaceState(null, null, `#${sectionId}`);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.5 }
    );

    navLinks.forEach((link) => {
      const section = document.getElementById(link.id);
      if (section) observer.observe(section);
    });

    return () => {
      navLinks.forEach((link) => {
        const section = document.getElementById(link.id);
        if (section) observer.unobserve(section);
      });
    };
  }, [navLinks]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1.5 }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={finvixLogo} alt="Finvix Logo" className="h-10 w-10 rounded-lg shadow-lg" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Finvix
              </span>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <HashLink
                    to={link.path}
                    smooth
                    className={`text-sm font-medium transition-colors duration-300 hover:text-cyan-400 ${
                      activeSection === link.id ? 'text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    {link.name}
                  </HashLink>
                </li>
              ))}
              <li>
                <Link 
                  to="/login" 
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                >
                  Login / Signup
                </Link>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-all duration-300"
            >
              {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-slate-800/95 backdrop-blur-lg border-t border-slate-700/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="px-4 py-4 space-y-3">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <HashLink
                    to={link.path}
                    smooth
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      activeSection === link.id 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-cyan-400'
                    }`}
                  >
                    {link.name}
                  </HashLink>
                </li>
              ))}
              <li>
                <Link 
                  to="/login" 
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg"
                >
                  Login / Signup
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" id="home">
        <Particles
          className="absolute inset-0"
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              number: { value: 100, density: { enable: true, value_area: 800 } },
              color: { value: ['#00DDEB', '#4C78A8'] },
              shape: { type: 'circle' },
              opacity: { value: 0.5, random: true },
              size: { value: 3, random: true },
              move: {
                enable: true,
                speed: 2,
                direction: 'bottom',
                random: true,
                out_mode: 'out',
                attract: { enable: true, rotateX: 600, rotateY: 1200 },
              },
            },
            interactivity: {
              events: { onhover: { enable: true, mode: 'repulse' } },
              modes: { repulse: { distance: 100, duration: 0.4 } },
            },
            retina_detect: true,
          }}
        />
        
        <motion.div
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.img
            src={finvixLogo}
            alt="Finvix Logo"
            className="h-24 w-24 sm:h-32 sm:w-32 mx-auto mb-8 rounded-2xl shadow-2xl"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Transform Your Marketing with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              AI-Powered Precision
            </span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            Finvix delivers cutting-edge analytics and real-time insights to optimize your ad spend and boost ROI effortlessly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Link 
              to="/login"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Start Now
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/50" id="about">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            About Finvix
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-slate-300 leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <strong className="text-cyan-400">Finvix empowers businesses with AI-driven marketing solutions.</strong> We simplify data into actionable strategies for growth.
          </motion.p>
        </div>
      </section>

      {/* Why Finvix Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8" id="why-finvix">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Why Choose Finvix?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { title: 'Instant Insights', desc: 'Real-time data analysis for immediate decision-making.' },
              { title: 'Predictive Modeling', desc: 'Boost ROI with AI-powered campaign predictions.' },
              { title: 'Tailored Recommendations', desc: 'Smart suggestions aligned with your business goals.' },
              { title: 'Enterprise-Grade Security', desc: 'Scalable solutions with top-tier data protection.' },
              { title: 'Seamless Integration', desc: 'Effortlessly integrates with your existing tools.' },
              { title: '24/7 Support', desc: 'Round-the-clock assistance for uninterrupted operations.' },
            ].map((item, index) => (
              <Tilt key={index} tiltMaxAngleX={15} tiltMaxAngleY={15} glareEnable={true} glareMaxOpacity={0.3}>
                <motion.div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 h-full shadow-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-bold text-cyan-400 mb-3">{item.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{item.desc}</p>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/50" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Key Features of Finvix
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: '📊', title: 'Predictive Analytics', desc: 'Leverage AI to predict campaign outcomes, optimize budgets, and maximize conversions with unparalleled accuracy.' },
              { icon: '👁️', title: 'Dynamic Visualizations', desc: 'Explore your data through interactive dashboards that make performance tracking intuitive and actionable.' },
              { icon: '📄', title: 'Automated Reports', desc: 'Get comprehensive reports with insights and suggestions, ready to share with your team in seconds.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 text-center shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-6xl mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4">{item.title}</h3>
                <p className="text-slate-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Marketing?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/login"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Explore Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">© 2025 Finvix. All rights reserved.</p>
            <ul className="flex space-x-8">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default Home;
