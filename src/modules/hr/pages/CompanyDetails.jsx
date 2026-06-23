import React from 'react';
import CompanyDetails from '../../../pages/HR/CompanyDetails';
import { useUiStore } from '../../../store/uiStore';

export default function HRCompanyDetailsPage() {
  const { triggerToast } = useUiStore();

  return (
    <CompanyDetails triggerToast={triggerToast} />
  );
}
