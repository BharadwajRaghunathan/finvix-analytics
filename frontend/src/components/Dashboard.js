import React from 'react';
import { Line, Scatter, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,  // ← ADDED: Import Filler plugin
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { FaChartLine, FaChartArea, FaBullseye, FaChartBar, FaPercentage, FaGlobeAmericas } from 'react-icons/fa';


// ← MODIFIED: Register Filler plugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Title, Tooltip, Legend);


const Dashboard = ({ data }) => {
  const labels = data.map(d => new Date(d.time).toLocaleTimeString());


  const calculateAverageConversions = (campaignType) => {
    const filteredData = data.filter(d => d.campaign_type === campaignType);
    const totalConversions = filteredData.reduce((sum, d) => sum + (d.conversions || 0), 0);
    return filteredData.length ? totalConversions / filteredData.length : 0;
  };


  const calculateConversionsByRegion = (region, campaignType) => {
    const filteredData = data.filter(d => d.region === region && d.campaign_type === campaignType);
    const totalConversions = filteredData.reduce((sum, d) => sum + (d.conversions || 0), 0);
    return filteredData.length ? totalConversions / filteredData.length : 0;
  };


  const conversionsROIData = {
    labels,
    datasets: [
      {
        label: 'Conversions',
        data: data.map(d => d.conversions || 0),
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.2)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'ROI (%)',
        data: data.map(d => d.roi || 0),
        borderColor: '#FF6F61',
        backgroundColor: 'rgba(255, 111, 97, 0.2)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };


  const impressionsClicksData = {
    labels,
    datasets: [
      {
        label: 'Impressions',
        data: data.map(d => d.impressions || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: '#4BC0C0',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Clicks',
        data: data.map(d => d.clicks || 0),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: '#9966FF',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };


  const engagementData = {
    datasets: [
      {
        label: 'Engagement',
        data: data.map(d => ({
          x: d.impressions || 0,
          y: d.clicks || 0,
          r: Math.min((d.conversions || 0) * 2, 25),
        })),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: '#36A2EB',
        borderWidth: 1,
      },
    ],
  };


  const campaignPerformanceData = {
    labels: ['Search Ads', 'Display Ads', 'Email', 'Social Media'],
    datasets: [
      {
        label: 'Conversions',
        data: [
          calculateAverageConversions('Search Ads'),
          calculateAverageConversions('Display Ads'),
          calculateAverageConversions('Email'),
          calculateAverageConversions('Social Media'),
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: '#FF6384',
        borderWidth: 1,
      },
    ],
  };


  const ctrTrendsData = {
    labels,
    datasets: [
      {
        label: 'Click-Through Rate (%)',
        data: data.map(d => (d.ctr || 0) * 100),
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: false,
      },
    ],
  };


  const conversionsByRegionData = {
    labels: ['South America', 'North America', 'Asia', 'Europe'],
    datasets: [
      {
        label: 'South America',
        data: [
          calculateConversionsByRegion('South America', 'Search Ads'),
          calculateConversionsByRegion('North America', 'Search Ads'),
          calculateConversionsByRegion('Asia', 'Search Ads'),
          calculateConversionsByRegion('Europe', 'Search Ads'),
        ],
        backgroundColor: '#FF6F61',
        borderColor: '#FF6F61',
        borderWidth: 1,
      },
      {
        label: 'North America',
        data: [
          calculateConversionsByRegion('South America', 'Display Ads'),
          calculateConversionsByRegion('North America', 'Display Ads'),
          calculateConversionsByRegion('Asia', 'Display Ads'),
          calculateConversionsByRegion('Europe', 'Display Ads'),
        ],
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1,
      },
      {
        label: 'Asia',
        data: [
          calculateConversionsByRegion('South America', 'Email'),
          calculateConversionsByRegion('North America', 'Email'),
          calculateConversionsByRegion('Asia', 'Email'),
          calculateConversionsByRegion('Europe', 'Email'),
        ],
        backgroundColor: '#FFD700',
        borderColor: '#FFD700',
        borderWidth: 1,
      },
      {
        label: 'Europe',
        data: [
          calculateConversionsByRegion('South America', 'Social Media'),
          calculateConversionsByRegion('North America', 'Social Media'),
          calculateConversionsByRegion('Asia', 'Social Media'),
          calculateConversionsByRegion('Europe', 'Social Media'),
        ],
        backgroundColor: '#2ECC71',
        borderColor: '#2ECC71',
        borderWidth: 1,
      },
    ],
  };


  const chartOptions = (titleText, type) => {
    const options = {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { color: '#E0E1DD', font: { size: 14 } } },
        tooltip: {
          backgroundColor: '#1B263B',
          titleColor: '#00D4FF',
          bodyColor: '#E0E1DD',
          borderColor: '#00D4FF',
          borderWidth: 1,
        },
        title: {
          display: true,
          text: titleText,
          color: '#00D4FF',
          font: { size: 18, weight: 'bold' },
          padding: { top: 10, bottom: 20 },
        },
      },
      animation: { duration: 2000, easing: 'easeInOutQuart' },
    };


    if (type === 'line' || type === 'area') {
      options.scales = {
        x: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, beginAtZero: true },
      };
    } else if (type === 'scatter') {
      options.scales = {
        x: { title: { display: true, text: 'Impressions', color: '#E0E1DD' }, ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { title: { display: true, text: 'Clicks', color: '#E0E1DD' }, ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, beginAtZero: true },
      };
    } else if (type === 'bar') {
      options.scales = {
        x: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, stacked: type === 'stackedBar' },
        y: { ticks: { color: '#E0E1DD' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, beginAtZero: true, stacked: type === 'stackedBar' },
      };
    }
    return options;
  };


  const chartDescriptions = [
    {
      title: 'Conversions and ROI Trends',
      description: 'Tracks conversions and ROI over 24 hours, revealing performance patterns.',
      icon: <FaChartLine />,
    },
    {
      title: 'Impressions and Clicks Trends',
      description: 'Compares impressions and clicks over time for engagement insights.',
      icon: <FaChartArea />,
    },
    {
      title: 'Engagement Over Time',
      description: 'Visualizes impressions vs. clicks, with bubble size showing conversions.',
      icon: <FaBullseye />,
    },
    {
      title: 'Campaign Performance Heatmap',
      description: 'Highlights average conversions across campaign types.',
      icon: <FaChartBar />,
    },
    {
      title: 'Click-Through Rate Trends',
      description: 'Monitors CTR over time to gauge ad effectiveness.',
      icon: <FaPercentage />,
    },
    {
      title: 'Conversions by Region',
      description: 'Breaks down conversions by region and campaign type.',
      icon: <FaGlobeAmericas />,
    },
  ];


  const renderChartWithDescription = (chartComponent, description, index) => {
    const isEven = index % 2 === 0;
    return (
      <motion.div
        key={index}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.2, duration: 0.6 }}
      >
        {isEven ? (
          <>
            {/* Chart Container */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
              {chartComponent}
            </div>
            
            {/* Description Card */}
            <motion.div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-cyan-500/30 backdrop-blur-sm flex flex-col justify-center hover:border-cyan-500/60 transition-all duration-300"
              whileHover={{ scale: 1.02 }} 
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
                <span className="text-3xl text-white">{description.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-cyan-400 mb-3 tracking-wide">{description.title}</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{description.description}</p>
            </motion.div>
          </>
        ) : (
          <>
            {/* Description Card (Left) */}
            <motion.div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-cyan-500/30 backdrop-blur-sm flex flex-col justify-center hover:border-cyan-500/60 transition-all duration-300"
              whileHover={{ scale: 1.02 }} 
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
                <span className="text-3xl text-white">{description.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-cyan-400 mb-3 tracking-wide">{description.title}</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{description.description}</p>
            </motion.div>


            {/* Chart Container (Right) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
              {chartComponent}
            </div>
          </>
        )}
      </motion.div>
    );
  };


  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-8">
      {renderChartWithDescription(
        <Line data={conversionsROIData} options={chartOptions('Conversions and ROI Trends', 'line')} />,
        chartDescriptions[0],
        0
      )}
      {renderChartWithDescription(
        <Line data={impressionsClicksData} options={chartOptions('Impressions and Clicks Trends', 'area')} />,
        chartDescriptions[1],
        1
      )}
      {renderChartWithDescription(
        <Scatter data={engagementData} options={chartOptions('Engagement Over Time', 'scatter')} />,
        chartDescriptions[2],
        2
      )}
      {renderChartWithDescription(
        <Bar data={campaignPerformanceData} options={chartOptions('Campaign Performance Heatmap', 'bar')} />,
        chartDescriptions[3],
        3
      )}
      {renderChartWithDescription(
        <Line data={ctrTrendsData} options={chartOptions('Click-Through Rate Trends', 'line')} />,
        chartDescriptions[4],
        4
      )}
      {renderChartWithDescription(
        <Bar data={conversionsByRegionData} options={chartOptions('Conversions by Region', 'stackedBar')} />,
        chartDescriptions[5],
        5
      )}
    </div>
  );
};


export default Dashboard;
