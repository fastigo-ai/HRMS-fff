import React from 'react';
import HRAttendance from '../../../pages/HR/Attendance';
import { useUiStore } from '../../../store/uiStore';

export default function AttendancePage() {
  const { triggerToast } = useUiStore();

  return (
    <HRAttendance 
      triggerToast={triggerToast}
    />
  );
}
