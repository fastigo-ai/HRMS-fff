import React from 'react';
import EmployeeLeaves from '../../../pages/employees/Leaves';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';

export default function LeavesPage() {
  const { leaveBalances, leaveHistory, applyLeave } = useEmployeeStore();
  const { triggerToast } = useUiStore();

  return (
    <EmployeeLeaves 
      leaveBalances={leaveBalances}
      leaveHistory={leaveHistory}
      applyLeave={(req) => applyLeave(req, triggerToast)}
      triggerToast={triggerToast}
    />
  );
}
