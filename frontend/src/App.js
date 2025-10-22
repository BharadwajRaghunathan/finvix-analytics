import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import DashboardContent from './components/DashboardContent';
import ManualInputsContent from './components/ManualInputsContent';
import FileUploadContent from './components/FileUploadContent';
import Greeting from './components/Greeting';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout */}
        <Route element={<Layout />}>
          <Route 
            path="/greeting" 
            element={
              <ProtectedRoute>
                <Greeting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardContent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manualinputs" 
            element={
              <ProtectedRoute>
                <ManualInputsContent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fileupload" 
            element={
              <ProtectedRoute>
                <FileUploadContent />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
