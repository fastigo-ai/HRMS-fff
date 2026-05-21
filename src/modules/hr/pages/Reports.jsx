import React from 'react';
import HRReports from '../../../pages/HR/Reports';
import { useUiStore } from '../../../store/uiStore';

export default function ReportsPage() {
  const { triggerToast } = useUiStore();

  return (
    <HRReports 
      triggerToast={triggerToast}
    />
  );
}
