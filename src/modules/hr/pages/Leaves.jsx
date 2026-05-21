import React from 'react';
import HRLeaves from '../../../pages/HR/Leaves';
import { useHrStore } from '../../../store/hrStore';
import { useUiStore } from '../../../store/uiStore';

export default function LeavesPage() {
  const { hrPendingLeaves, resolveLeaveRequest } = useHrStore();
  const { triggerToast } = useUiStore();

  return (
    <HRLeaves 
      pendingLeaves={hrPendingLeaves}
      resolveLeave={(id, decision) => resolveLeaveRequest(id, decision, triggerToast)}
      triggerToast={triggerToast}
    />
  );
}
