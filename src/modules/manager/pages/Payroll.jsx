import React, { useEffect } from 'react';
import EmployeePayroll from '../../../pages/employees/Payroll';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';

export default function PayrollPage() {
  const { payslips, handleDocumentDownload, downloadingDocument, fetchEmployeeData } = useEmployeeStore();
  const { triggerToast } = useUiStore();
  const { profileData } = useAuthStore();

  // Fetch manager's own payslips on mount (reuses the same /payroll/my API)
  useEffect(() => {
    fetchEmployeeData();
  }, []);

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
