import React, { useEffect } from 'react';
import HRPayroll from '../../../pages/HR/Payroll';
import { useUiStore } from '../../../store/uiStore';
import { useHrStore } from '../../../store/hrStore';

export default function PayrollPage() {
  const { triggerToast } = useUiStore();
  const { hrEmployees, fetchHREmployees } = useHrStore();

  useEffect(() => {
    fetchHREmployees();
  }, [fetchHREmployees]);

  return (
    <HRPayroll 
      triggerToast={triggerToast}
      hrEmployees={hrEmployees || []}
    />
  );
}
