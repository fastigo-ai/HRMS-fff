import React from 'react';
import { useNavigate } from 'react-router-dom';
import PMDashboard from '../../../pages/Manager/Dashboard';
import { useAuthStore } from '../../../store/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setCurrentTab } = useAuthStore();

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    const subpath = tabId.substring(3); // strip 'pm-'
    navigate(`/manager/${subpath}`);
  };

  return (
    <PMDashboard 
      setCurrentTab={handleTabChange}
    />
  );
}
