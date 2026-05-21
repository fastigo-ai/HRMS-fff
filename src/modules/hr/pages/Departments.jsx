import React from 'react';
import HRDepartments from '../../../pages/HR/Departments';
import { useUiStore } from '../../../store/uiStore';

export default function DepartmentsPage() {
  const { triggerToast } = useUiStore();

  return (
    <HRDepartments 
      triggerToast={triggerToast}
    />
  );
}
