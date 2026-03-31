import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserApp from './UserApp';
import ProtectedApp from './ProtectedApp';
import ProtectedRegisterPage from './ProtectedRegisterPage';
import './index.css';

export default function App() {
  return (
    <Routes>
      {/* Landing page - default route */}
      <Route path="/" element={<HomePage />} />
      
      {/* User portal - for students only */}
      <Route path="/student" element={<UserApp />} />
      
      {/* Protected portal - for tutors and admins */}
      <Route path="/protected" element={<ProtectedApp />} />
      
      {/* Protected registration - for tutors and admins to register */}
      <Route path="/register/protected" element={<ProtectedRegisterPage />} />
      
      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
