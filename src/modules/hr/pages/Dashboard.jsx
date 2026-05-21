import React from 'react';
import HRDashboard from '../../../pages/HR/Dashboard';
import { useUiStore } from '../../../store/uiStore';

export default function DashboardPage() {
  const { triggerToast } = useUiStore();

  return (
    <HRDashboard 
      triggerToast={triggerToast}
    />
  );
}
