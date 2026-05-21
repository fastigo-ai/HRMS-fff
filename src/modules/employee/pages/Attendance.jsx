import React from 'react';
import EmployeeAttendance from '../../../pages/employees/Attendance';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';

export default function AttendancePage() {
  const { clockedIn, elapsedTime } = useAuthStore();
  const { triggerToast } = useUiStore();

  return (
    <EmployeeAttendance 
      clockedIn={clockedIn}
      toggleClockInOut={() => useAuthStore.getState().toggleClock(triggerToast)}
      elapsedTime={elapsedTime}
      triggerToast={triggerToast}
    />
  );
}
