import React from 'react';
import EmployeeWFHRequest from '../../../pages/employees/WFHRequest';
import { useUiStore } from '../../../store/uiStore';

export default function WFHRequestPage() {
  const { triggerToast } = useUiStore();

  return (
    <EmployeeWFHRequest 
      triggerToast={triggerToast}
    />
  );
}
