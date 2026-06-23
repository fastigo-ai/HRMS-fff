import React, { useState, useEffect } from 'react';
import HRDashboard from '../../../pages/HR/Dashboard';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { useEmployeeStore } from '../../../store/employeeStore';
import { authenticatedFetch, API_BASE_URL } from '../../../services/api';

export default function DashboardPage() {
  const { triggerToast, notifications } = useUiStore();
  const { profileData, clockedIn, toggleClock, elapsedTime, clockOutCompleted, setCurrentTab } = useAuthStore();
  const { leaveBalances, payslips, fetchEmployeeData, leaveHistory, applyLeave } = useEmployeeStore();

  const [attendanceStats, setAttendanceStats] = useState({
    presentDays: 0,
    lateMarks: 0,
    totalHours: 0,
    avgCheckIn: "09:00 AM"
  });
  const [personalAttendance, setPersonalAttendance] = useState({
    logs: [],
    stats: {
      totalHours: 0,
      avgCheckIn: "09:00 AM",
      presentDays: 0,
      lateMarks: 0
    }
  });

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  useEffect(() => {
    const fetchPersonalStats = async () => {
      try {
        const res = await authenticatedFetch(`${API_BASE_URL}/attendance/my`);
        const data = await res.json();
        if (res.ok) {
          setAttendanceStats(data.data.stats || {
            presentDays: 0,
            lateMarks: 0,
            totalHours: 0,
            avgCheckIn: "09:00 AM"
          });
          setPersonalAttendance({
            logs: data.data.logs || [],
            stats: data.data.stats || {
              totalHours: 0,
              avgCheckIn: "09:00 AM",
              presentDays: 0,
              lateMarks: 0
            }
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard personal stats:", err);
      }
    };
    fetchPersonalStats();
  }, [clockedIn]);

  return (
    <HRDashboard 
      triggerToast={triggerToast}
      profileData={profileData}
      clockedIn={clockedIn}
      toggleClockInOut={() => toggleClock(triggerToast)}
      elapsedTime={elapsedTime}
      clockOutCompleted={clockOutCompleted}
      setCurrentTab={setCurrentTab}
      leaveBalances={leaveBalances}
      payslips={payslips}
      leaveHistory={leaveHistory}
      applyLeave={(req) => applyLeave(req, triggerToast)}
      attendanceStats={attendanceStats}
      personalAttendance={personalAttendance}
      notifications={notifications}
    />
  );
}
