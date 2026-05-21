import React from 'react';
import HRPayroll from '../../../pages/HR/Payroll';
import { useUiStore } from '../../../store/uiStore';

export default function PayrollPage() {
  const { triggerToast } = useUiStore();

  return (
    <HRPayroll 
      triggerToast={triggerToast}
    />
  );
}
