import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiBarChart2, FiTable } from 'react-icons/fi';

const ResultsDisplay = ({ results, modelType }) => {
  if (!results || (Array.isArray(results) && results.length === 0)) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700/50 text-center">
        <div className="text-slate-400 text-lg">No results available</div>
      </div>
    );
  }

  const normalizedResults = Array.isArray(results) ? results : [results];
  const headers = normalizedResults.length > 0 ? Object.keys(normalizedResults[0]) : [];

  const roiChartData = normalizedResults.map((row, index) => ({
    name: `Row ${index + 1}`,
    actual_roi: row.actual_roi || 0,
    predicted_roi: row.roi || 0,
  }));

  const convChartData = normalizedResults.map((row, index) => ({
    name: `Row ${index + 1}`,
    actual_conversions: row.actual_conversions || 0,
    predicted_conversions: row.conversions || 0,
  }));

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg">
        <div className="flex items-center space-x-3 mb-2">
          <FiBarChart2 className="text-2xl text-cyan-400" />
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Prediction Results
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Visualizations and detailed data from your predictions
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {modelType === 'roi' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">ROI Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiChartData}>
                <XAxis dataKey="name" stroke="#E0E1DD" />
                <YAxis stroke="#E0E1DD" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1e293b', 
                    border: '1px solid #00D4FF',
                    borderRadius: '8px',
                    color: '#E0E1DD'
                  }} 
                />
                <Legend wrapperStyle={{ color: '#E0E1DD' }} />
                <Bar dataKey="actual_roi" fill="#00D4FF" name="Actual ROI" radius={[8, 8, 0, 0]} />
                <Bar dataKey="predicted_roi" fill="#FF6F61" name="Predicted ROI" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {modelType === 'conversions' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700/50">
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Conversions Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={convChartData}>
                <XAxis dataKey="name" stroke="#E0E1DD" />
                <YAxis stroke="#E0E1DD" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1e293b', 
                    border: '1px solid #00D4FF',
                    borderRadius: '8px',
                    color: '#E0E1DD'
                  }} 
                />
                <Legend wrapperStyle={{ color: '#E0E1DD' }} />
                <Bar dataKey="actual_conversions" fill="#00D4FF" name="Actual Conversions" radius={[8, 8, 0, 0]} />
                <Bar dataKey="predicted_conversions" fill="#FF6F61" name="Predicted Conversions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {modelType === 'both' && (
          <>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700/50">
              <h4 className="text-lg font-semibold text-cyan-400 mb-4">ROI Comparison</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiChartData}>
                  <XAxis dataKey="name" stroke="#E0E1DD" />
                  <YAxis stroke="#E0E1DD" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: '1px solid #00D4FF',
                      borderRadius: '8px',
                      color: '#E0E1DD'
                    }} 
                  />
                  <Legend wrapperStyle={{ color: '#E0E1DD' }} />
                  <Bar dataKey="actual_roi" fill="#00D4FF" name="Actual ROI" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="predicted_roi" fill="#FF6F61" name="Predicted ROI" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-2xl border border-slate-700/50">
              <h4 className="text-lg font-semibold text-cyan-400 mb-4">Conversions Comparison</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={convChartData}>
                  <XAxis dataKey="name" stroke="#E0E1DD" />
                  <YAxis stroke="#E0E1DD" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1e293b', 
                      border: '1px solid #00D4FF',
                      borderRadius: '8px',
                      color: '#E0E1DD'
                    }} 
                  />
                  <Legend wrapperStyle={{ color: '#E0E1DD' }} />
                  <Bar dataKey="actual_conversions" fill="#00D4FF" name="Actual Conversions" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="predicted_conversions" fill="#FF6F61" name="Predicted Conversions" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/50 backdrop-blur-lg">
        <div className="flex items-center space-x-3 mb-6">
          <FiTable className="text-2xl text-cyan-400" />
          <h3 className="text-xl font-bold text-cyan-400">Detailed Results</h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-700/50">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index}
                    className="px-4 py-3 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-700/50"
                  >
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {normalizedResults.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="hover:bg-slate-800/30 transition-colors duration-200"
                >
                  {headers.map((header, colIndex) => (
                    <td 
                      key={colIndex}
                      className="px-4 py-3 text-slate-300 whitespace-nowrap"
                    >
                      {row[header] !== undefined && row[header] !== null
                        ? typeof row[header] === 'number'
                          ? row[header].toFixed(2)
                          : row[header]
                        : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Total Results: <span className="text-cyan-400 font-semibold">{normalizedResults.length}</span></span>
          <span>Columns: <span className="text-cyan-400 font-semibold">{headers.length}</span></span>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;
