import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import DashboardContent from './components/DashboardContent';
import ManualInputsContent from './components/ManualInputsContent';
import FileUploadContent from './components/FileUploadContent';
import Greeting from './components/Greeting'; // Import the new component
import NotFound from './pages/NotFound';
import './App.css';

// Axios interceptor to add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="greeting" element={<ProtectedRoute><Greeting /></ProtectedRoute>} /> {/* New route */}
          <Route path="dashboard" element={<ProtectedRoute><DashboardContent /></ProtectedRoute>} />
          <Route path="manualinputs" element={<ProtectedRoute><ManualInputsContent /></ProtectedRoute>} />
          <Route path="fileupload" element={<ProtectedRoute><FileUploadContent /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;