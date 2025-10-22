import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaEraser } from 'react-icons/fa';

const PredictionForm = ({ onPredict, clearForm }) => {
  const [input, setInput] = useState({
    'Ad Spend': '', 'Clicks': '', 'Impressions': '', 'Conversion Rate': '',
    'Click-Through Rate (CTR)': '', 'Cost Per Click (CPC)': '', 'Cost Per Conversion': '',
    'Customer Acquisition Cost (CAC)': '', 'Campaign Type': 'Search Ads',
    'Region': 'North America', 'Industry': 'Retail', 'Company Size': 'Small',
    'Seasonality Factor': '',
  });
  const [modelType, setModelType] = useState('both');

  const handleChange = (e) => setInput({ ...input, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputArray = [
      parseFloat(input['Ad Spend']) || 0,
      parseFloat(input['Clicks']) || 0,
      parseFloat(input['Impressions']) || 0,
      parseFloat(input['Conversion Rate']) || 0,
      parseFloat(input['Click-Through Rate (CTR)']) || 0,
      parseFloat(input['Cost Per Click (CPC)']) || 0,
      parseFloat(input['Cost Per Conversion']) || 0,
      parseFloat(input['Customer Acquisition Cost (CAC)']) || 0,
      input['Campaign Type'],
      input['Region'],
      input['Industry'],
      input['Company Size'],
      parseFloat(input['Seasonality Factor']) || 1.0,
    ];
    onPredict(inputArray, modelType);
  };

  const handleClear = () => {
    setInput({
      'Ad Spend': '', 'Clicks': '', 'Impressions': '', 'Conversion Rate': '',
      'Click-Through Rate (CTR)': '', 'Cost Per Click (CPC)': '', 'Cost Per Conversion': '',
      'Customer Acquisition Cost (CAC)': '', 'Campaign Type': 'Search Ads',
      'Region': 'North America', 'Industry': 'Retail', 'Company Size': 'Small',
      'Seasonality Factor': '',
    });
    setModelType('both');
    if (clearForm) clearForm();
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Campaign Metrics Section */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">📊</span> Campaign Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Ad Spend ($)</label>
              <input
                type="number"
                name="Ad Spend"
                placeholder="5000"
                onChange={handleChange}
                required
                value={input['Ad Spend']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Clicks</label>
              <input
                type="number"
                name="Clicks"
                placeholder="1000"
                onChange={handleChange}
                required
                value={input['Clicks']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Impressions</label>
              <input
                type="number"
                name="Impressions"
                placeholder="50000"
                onChange={handleChange}
                required
                value={input['Impressions']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Performance Rates Section */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">📈</span> Performance Rates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Conversion Rate (%)</label>
              <input
                type="number"
                step="0.01"
                name="Conversion Rate"
                placeholder="2.5"
                onChange={handleChange}
                required
                value={input['Conversion Rate']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">CTR (%)</label>
              <input
                type="number"
                step="0.01"
                name="Click-Through Rate (CTR)"
                placeholder="3.2"
                onChange={handleChange}
                required
                value={input['Click-Through Rate (CTR)']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">CPC ($)</label>
              <input
                type="number"
                name="Cost Per Click (CPC)"
                placeholder="5.0"
                onChange={handleChange}
                required
                value={input['Cost Per Click (CPC)']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Cost Per Conversion ($)</label>
              <input
                type="number"
                name="Cost Per Conversion"
                placeholder="200"
                onChange={handleChange}
                required
                value={input['Cost Per Conversion']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">CAC ($)</label>
              <input
                type="number"
                name="Customer Acquisition Cost (CAC)"
                placeholder="250"
                onChange={handleChange}
                required
                value={input['Customer Acquisition Cost (CAC)']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Campaign Details Section */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">🎯</span> Campaign Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Campaign Type</label>
              <select
                name="Campaign Type"
                onChange={handleChange}
                value={input['Campaign Type']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 cursor-pointer"
              >
                <option value="Search Ads">Search Ads</option>
                <option value="Display Ads">Display Ads</option>
                <option value="Social Media Ads">Social Media Ads</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Region</label>
              <select
                name="Region"
                onChange={handleChange}
                value={input['Region']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 cursor-pointer"
              >
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Industry</label>
              <select
                name="Industry"
                onChange={handleChange}
                value={input['Industry']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 cursor-pointer"
              >
                <option value="Retail">Retail</option>
                <option value="Tech">Tech</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Company Size</label>
              <select
                name="Company Size"
                onChange={handleChange}
                value={input['Company Size']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 cursor-pointer"
              >
                <option value="Small">Small</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Seasonality Factor</label>
              <input
                type="number"
                step="0.1"
                name="Seasonality Factor"
                placeholder="1.0"
                onChange={handleChange}
                required
                value={input['Seasonality Factor']}
                autoComplete="off"
                className="w-full bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Prediction Type Section */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">🔮</span> Prediction Type
          </h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="modelType"
                value="conversions"
                checked={modelType === 'conversions'}
                onChange={(e) => setModelType(e.target.value)}
                className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-slate-300 group-hover:text-cyan-400 transition-colors duration-300 font-medium">
                Conversions Only
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="modelType"
                value="roi"
                checked={modelType === 'roi'}
                onChange={(e) => setModelType(e.target.value)}
                className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-slate-300 group-hover:text-cyan-400 transition-colors duration-300 font-medium">
                ROI Only
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="modelType"
                value="both"
                checked={modelType === 'both'}
                onChange={(e) => setModelType(e.target.value)}
                className="w-5 h-5 text-cyan-500 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-slate-300 group-hover:text-cyan-400 transition-colors duration-300 font-medium">
                Both Metrics
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            type="submit"
            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FaChartLine className="text-xl" />
            <span>Generate Prediction</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={handleClear}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-4 px-6 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FaEraser className="text-xl" />
            <span>Clear Form</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default PredictionForm;
