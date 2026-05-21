import React from 'react';
import EmployeeProfile from '../../../pages/employees/Profile';
import { useAuthStore } from '../../../store/authStore';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';

export default function ProfilePage() {
  const { profileData, setProfileData } = useAuthStore();
  const { downloadingDocument, handleDocumentDownload } = useEmployeeStore();
  const { triggerToast } = useUiStore();

  return (
    <EmployeeProfile 
      profileData={profileData}
      setProfileData={setProfileData}
      handleDocumentDownload={(doc) => handleDocumentDownload(doc, triggerToast)}
      downloadingDocument={downloadingDocument}
    />
  );
}
