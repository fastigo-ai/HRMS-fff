import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboard from '../../../pages/employees/Dashboard';
import { useAuthStore } from '../../../store/authStore';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';
import { authenticatedFetch } from '../../../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { setCurrentTab, clockedIn, toggleClock, clockOutCompleted, profileData } = useAuthStore();
  const { leaveBalances, tasks } = useEmployeeStore();
  const { notifications, triggerToast } = useUiStore();

  const [attendanceStats, setAttendanceStats] = useState({
    presentDays: 0,
    lateMarks: 0,
    totalHours: 0,
    avgCheckIn: "09:00 AM"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authenticatedFetch("http://localhost:8000/api/attendance/my");
        const data = await res.json();
        if (res.ok) {
          setAttendanceStats(data.data.stats || {
            presentDays: 0,
            lateMarks: 0,
            totalHours: 0,
            avgCheckIn: "09:00 AM"
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard attendance stats:", err);
      }
    };
    fetchStats();
  }, [clockedIn]);

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
      clockOutCompleted={clockOutCompleted}
      toggleClockInOut={() => toggleClock(triggerToast)}
      userRole="standard_employee"
      attendanceStats={attendanceStats}
      profileData={profileData}
    />
  );
}
