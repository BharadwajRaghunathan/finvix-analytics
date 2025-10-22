import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import api from '../config/api';

import PredictionForm from './PredictionForm';
import ReportButton from './ReportButton';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnimatedNumber = ({ value, isPercentage = false, status }) => {
  const motionValue = useRef(0);
  const [displayValue, setDisplayValue] = useState(
    `${motionValue.current.toFixed(2)}${isPercentage ? '%' : ''}`
  );

  useEffect(() => {
    let start = 0;
    const end = value || 0;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / (end || 1)));
    const timer = setInterval(() => {
      start += 1;
      motionValue.current = start;
      setDisplayValue(
        `${motionValue.current.toFixed(2)}${isPercentage ? '%' : ''}`
      );
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, isPercentage]);

  const color =
    status === 'positive' ? '#10B981' : status === 'negative' ? '#EF4444' : '#F59E0B';

  return (
    <span style={{ color, transition: 'color 0.3s ease' }}>{displayValue}</span>
  );
};

const PredictionCharts = ({ predictions, chartRefs, modelType }) => {
  useEffect(() => {
    return () => {
      Object.values(chartRefs).forEach((ref) => {
        if (ref.current) {
          ref.current.destroy();
          ref.current = null;
        }
      });
    };
  }, [chartRefs]);

  if (!predictions) return <div className="text-slate-400 text-center py-8">No prediction data available</div>;

  const actualConversions = predictions.actual_conversions || 0;
  const predictedConversions = predictions.conversions || 0;
  const actualRoi = predictions.actual_roi || 0;
  const predictedRoi = predictions.roi || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
      {(modelType === 'roi' || modelType === 'both') && (
        <>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Actual vs Predicted ROI</h3>
            <Bar
              ref={chartRefs.barROI}
              data={{
                labels: ['ROI'],
                datasets: [
                  { label: 'Actual ROI', data: [actualRoi], backgroundColor: '#FF6F61' },
                  { label: 'Predicted ROI', data: [predictedRoi], backgroundColor: '#00D4FF' },
                ],
              }}
              options={{
                responsive: true,
                animation: { duration: 2000, easing: 'easeOutBounce' },
                scales: {
                  y: { beginAtZero: true, ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                  x: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                },
                plugins: {
                  legend: { position: 'top', labels: { color: '#E0E1DD' } },
                  title: { display: false },
                },
              }}
            />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">ROI Trend Over Time</h3>
            <Line
              ref={chartRefs.lineROI}
              data={{
                labels: ['Past', 'Present', 'Predicted'],
                datasets: [
                  {
                    label: 'ROI',
                    data: [actualRoi * 0.9, actualRoi, predictedRoi],
                    borderColor: '#00D4FF',
                    fill: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                animation: { duration: 2000, easing: 'easeOutQuad' },
                scales: {
                  y: { beginAtZero: true, ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                  x: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                },
                plugins: {
                  legend: { position: 'top', labels: { color: '#E0E1DD' } },
                  title: { display: false },
                },
              }}
            />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">ROI Breakdown</h3>
            <Pie
              ref={chartRefs.pieROI}
              data={{
                labels: ['Actual ROI', 'Predicted ROI'],
                datasets: [
                  { data: [actualRoi, predictedRoi], backgroundColor: ['#FF6F61', '#00D4FF'] },
                ],
              }}
              options={{
                responsive: true,
                animation: { duration: 2000, easing: 'easeOutElastic' },
                plugins: {
                  legend: { position: 'top', labels: { color: '#E0E1DD' } },
                  title: { display: false },
                },
              }}
            />
          </div>
        </>
      )}
      {(modelType === 'conversions' || modelType === 'both') && (
        <>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Actual vs Predicted Conversions</h3>
            <Bar
              ref={chartRefs.barConversions}
              data={{
                labels: ['Conversions'],
                datasets: [
                  { label: 'Actual Conversions', data: [actualConversions], backgroundColor: '#FF6F61' },
                  { label: 'Predicted Conversions', data: [predictedConversions], backgroundColor: '#00D4FF' },
                ],
              }}
              options={{
                responsive: true,
                animation: { duration: 2000, easing: 'easeOutBounce' },
                scales: {
                  y: { beginAtZero: true, ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                  x: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                },
                plugins: {
                  legend: { position: 'top', labels: { color: '#E0E1DD' } },
                  title: { display: false },
                },
              }}
            />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Conversions Trend Over Time</h3>
            <Line
              ref={chartRefs.lineConversions}
              data={{
                labels: ['Past', 'Present', 'Predicted'],
                datasets: [
                  {
                    label: 'Conversions',
                    data: [actualConversions * 0.8, actualConversions, predictedConversions],
                    borderColor: '#FF6F61',
                    fill: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                animation: { duration: 2000, easing: 'easeOutQuad' },
                scales: {
                  y: { beginAtZero: true, ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                  x: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                },
                plugins: {
                  legend: { position: 'top', labels: { color: '#E0E1DD' } },
                  title: { display: false },
                },
              }}
            />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Conversions Breakdown</h3>
            <Pie
              ref={chartRefs.pieConversions}
              data={{
                labels: ['Actual Conversions', 'Predicted Conversions'],
                datasets: [
                  { data: [actualConversions, predictedConversions], backgroundColor: ['#FF6F61', '#00D4FF'] },
                ],
              }}
              options={{
                responsive: true,
                animation: { duration: 2000, easing: 'easeOutElastic' },
                plugins: {
                  legend: { position: 'top', labels: { color: '#E0E1DD' } },
                  title: { display: false },
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

const ManualInputsContent = () => {
  const [predictions, setPredictions] = useState(null);
  const [modelType, setModelType] = useState('both');
  const [predictionLoading, setPredictionLoading] = useState(false);

  const barROIRef = useRef(null);
  const lineROIRef = useRef(null);
  const pieROIRef = useRef(null);
  const barConversionsRef = useRef(null);
  const lineConversionsRef = useRef(null);
  const pieConversionsRef = useRef(null);

  const chartRefs = useMemo(
    () => ({
      barROI: barROIRef,
      lineROI: lineROIRef,
      pieROI: pieROIRef,
      barConversions: barConversionsRef,
      lineConversions: lineConversionsRef,
      pieConversions: pieConversionsRef,
    }),
    []
  );

  const handlePredict = async (input, modelType) => {
    setPredictionLoading(true);
    try {
      const res = await api.post('/predict', {
        input,
        model_type: modelType,
      });
      setPredictions(res.data);
      setModelType(modelType);
      toast.success('Prediction completed successfully!');
    } catch (err) {
      console.error('Prediction error:', err.response?.data || err.message);
      
      if (err.response?.status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        const errorMessage = err.response?.data?.error || 'Prediction failed. Please try again.';
        toast.error(`Prediction failed: ${errorMessage}`);
      }
    } finally {
      setPredictionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'positive') return <FiTrendingUp className="text-green-500" />;
    if (status === 'negative') return <FiTrendingDown className="text-red-500" />;
    return <FiMinus className="text-yellow-500" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      positive: 'bg-green-500/20 text-green-400 border-green-500/50',
      negative: 'bg-red-500/20 text-red-400 border-red-500/50',
      moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    };
    return statusConfig[status] || statusConfig.moderate;
  };

  return (
    <div className="space-y-8">
      {/* Prediction Form Section */}
      <motion.div
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="border-b border-slate-700/50 pb-6 mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Forecasting Input
          </h2>
          <p className="text-slate-400 text-sm">
            Enter your campaign metrics to get AI-powered predictions
          </p>
        </div>
        <PredictionForm onPredict={handlePredict} />
      </motion.div>

      <AnimatePresence mode="wait">
        {predictionLoading ? (
          <motion.div
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-16 shadow-2xl border border-slate-700/50 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-300 text-xl font-medium mb-2">Generating Predictions...</p>
              <p className="text-slate-500 text-sm">Analyzing your data with AI models</p>
            </div>
          </motion.div>
        ) : (
          predictions && (
            <motion.div
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="border-b border-slate-700/50 pb-6 mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                  Prediction Insights
                </h2>
                <p className="text-slate-400 text-sm">
                  AI-powered forecast based on your input data
                </p>
              </div>

              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {(modelType === 'conversions' || modelType === 'both') &&
                  predictions.conversions !== undefined && (
                    <motion.div
                      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-wide">Conversions</span>
                        {getStatusIcon(predictions.conversions_status || 'moderate')}
                      </div>
                      <div className="text-4xl sm:text-5xl font-bold mb-4">
                        <AnimatedNumber
                          value={predictions.conversions}
                          status={predictions.conversions_status || 'moderate'}
                        />
                      </div>
                      <div className="text-slate-400 text-sm mb-4">
                        Actual: <span className="text-slate-300 font-medium">{predictions.actual_conversions?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(predictions.conversions_status || 'moderate')}`}>
                        {predictions.conversions_status || 'moderate'}
                      </span>
                    </motion.div>
                  )}
                {(modelType === 'roi' || modelType === 'both') && predictions.roi !== undefined && (
                  <motion.div
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-400 text-sm font-medium uppercase tracking-wide">ROI</span>
                      {getStatusIcon(predictions.roi_status || 'moderate')}
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold mb-4">
                      <AnimatedNumber
                        value={predictions.roi}
                        isPercentage={true}
                        status={predictions.roi_status || 'moderate'}
                      />
                    </div>
                    <div className="text-slate-400 text-sm mb-4">
                      Actual: <span className="text-slate-300 font-medium">{predictions.actual_roi?.toFixed(2)}%</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(predictions.roi_status || 'moderate')}`}>
                      {predictions.roi_status || 'moderate'}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Charts */}
              <PredictionCharts
                predictions={predictions}
                chartRefs={chartRefs}
                modelType={modelType}
              />

              {/* AI Suggestions */}
              <div className="mt-8 space-y-6">
                {(modelType === 'conversions' || modelType === 'both') &&
                  predictions.conversions_suggestions && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500/30">
                      <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                        <span className="mr-2">💡</span> Conversion Report
                      </h3>
                      <motion.p
                        className="text-slate-300 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {predictions.conversions_suggestions}
                      </motion.p>
                    </div>
                  )}
                {(modelType === 'roi' || modelType === 'both') &&
                  predictions.roi_suggestions && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-cyan-500/30">
                      <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                        <span className="mr-2">📊</span> ROI Report
                      </h3>
                      <motion.p
                        className="text-slate-300 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {predictions.roi_suggestions}
                      </motion.p>
                    </div>
                  )}
              </div>

              {/* Report Button */}
              <div className="mt-8">
                <ReportButton type="backend" results={predictions} modelType={modelType} />
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManualInputsContent;
