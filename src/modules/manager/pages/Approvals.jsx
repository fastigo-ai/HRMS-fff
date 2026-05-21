import React from 'react';
import PMApprovals from '../../../pages/Manager/Approvals';
import { useUiStore } from '../../../store/uiStore';

export default function ApprovalsPage() {
  const { triggerToast } = useUiStore();

  return (
    <PMApprovals 
      triggerToast={triggerToast}
    />
  );
}
