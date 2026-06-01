import React from 'react';
import EmployeePayroll from '../../../pages/employees/Payroll';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';

export default function PayrollPage() {
  const { payslips, downloadingDocument, handleDocumentDownload } = useEmployeeStore();
  const { triggerToast } = useUiStore();
  const { profileData } = useAuthStore();

  return (
    <EmployeePayroll 
      payslips={payslips}
      profileData={profileData}
      handleDocumentDownload={(doc) => handleDocumentDownload(doc, triggerToast)}
      downloadingDocument={downloadingDocument}
      triggerToast={triggerToast}
    />
  );
}
