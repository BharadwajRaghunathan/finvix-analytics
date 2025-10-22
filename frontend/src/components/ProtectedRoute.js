import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // If no token, redirect to login and replace history
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If token exists, render protected content
  return children;
};

export default ProtectedRoute;
