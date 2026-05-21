import React from 'react';
import PMTasks from '../../../pages/Manager/Tasks';
import { useUiStore } from '../../../store/uiStore';

export default function TasksPage() {
  const { triggerToast } = useUiStore();

  return (
    <PMTasks 
      triggerToast={triggerToast}
    />
  );
}
