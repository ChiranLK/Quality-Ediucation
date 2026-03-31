import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedRegister from './components/ProtectedRegister';

export default function ProtectedRegisterPage() {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate('/protected');
  };

  return (
    <ProtectedRegister onSwitchToLogin={handleSwitchToLogin} />
  );
}
