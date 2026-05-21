import React from 'react';
import HRRecruitment from '../../../pages/HR/Recruitment';
import { useUiStore } from '../../../store/uiStore';

export default function RecruitmentPage() {
  const { triggerToast } = useUiStore();

  return (
    <HRRecruitment 
      triggerToast={triggerToast}
    />
  );
}
