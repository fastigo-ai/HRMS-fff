import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from '../../../pages/employees/Dashboard';
import { useAuthStore } from '../../../store/authStore';
import { useManagerStore } from '../../../store/managerStore';

export default function PMSalesCRM() {
  const navigate = useNavigate();
  const { setCurrentTab } = useAuthStore();
  const { tasks } = useManagerStore();

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    navigate(`/manager/${tabId.replace('pm-', '')}`);
  };

  return (
    <EmployeeDashboard 
      setCurrentTab={handleTabChange}
      leaveBalances={[]}
      tasks={tasks}
      initialPortal="sales"
      isReadOnly={true}
    />
  );
}
