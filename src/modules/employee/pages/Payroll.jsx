import React from 'react';
import EmployeePayroll from '../../../pages/employees/Payroll';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';

export default function PayrollPage() {
  const { downloadingDocument, handleDocumentDownload } = useEmployeeStore();
  const { triggerToast } = useUiStore();

  return (
    <EmployeePayroll 
      handleDocumentDownload={(doc) => handleDocumentDownload(doc, triggerToast)}
      downloadingDocument={downloadingDocument}
      triggerToast={triggerToast}
    />
  );
}
