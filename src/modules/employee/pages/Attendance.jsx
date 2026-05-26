import React, { useState, useEffect } from 'react';
import EmployeeAttendance from '../../../pages/employees/Attendance';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { authenticatedFetch } from '../../../services/api';

export default function AttendancePage() {
  const { clockedIn, elapsedTime, toggleClock, clockOutCompleted } = useAuthStore();
  const { triggerToast } = useUiStore();
  const [attendanceData, setAttendanceData] = useState({
    logs: [],
    stats: {
      totalHours: 0,
      avgCheckIn: "09:00 AM",
      presentDays: 0,
      lateMarks: 0
    }
  });

  const fetchAttendance = async () => {
    try {
      const res = await authenticatedFetch("http://localhost:8000/api/attendance/my");
      const data = await res.json();
      if (res.ok) {
        setAttendanceData({
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
      console.error("Failed to fetch attendance:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [clockedIn]);

  return (
    <EmployeeAttendance 
      clockedIn={clockedIn}
      clockOutCompleted={clockOutCompleted}
      toggleClockInOut={() => toggleClock(triggerToast)}
      elapsedTime={elapsedTime}
      triggerToast={triggerToast}
      logs={attendanceData.logs}
      stats={attendanceData.stats}
    />
  );
}
