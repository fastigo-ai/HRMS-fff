import React from 'react';
import PMTeam from '../../../pages/Manager/Team';
import { useUiStore } from '../../../store/uiStore';

export default function TeamPage() {
  const { triggerToast } = useUiStore();

  return (
    <PMTeam 
      triggerToast={triggerToast}
    />
  );
}
