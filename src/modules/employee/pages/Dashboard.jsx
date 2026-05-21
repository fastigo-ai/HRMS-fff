import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from '../../../pages/employees/Dashboard';
import { useAuthStore } from '../../../store/authStore';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setCurrentTab, clockedIn } = useAuthStore();
  const { leaveBalances, tasks } = useEmployeeStore();
  const { notifications, triggerToast } = useUiStore();

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    navigate(`/employee/${tabId}`);
  };

  return (
    <EmployeeDashboard 
      setCurrentTab={handleTabChange}
      leaveBalances={leaveBalances}
      tasks={tasks}
      notifications={notifications}
      clockedIn={clockedIn}
      toggleClockInOut={() => useAuthStore.getState().toggleClock(triggerToast)}
      userRole="standard_employee"
    />
  );
}
