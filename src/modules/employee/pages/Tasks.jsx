import React from 'react';
import EmployeeTasks from '../../../pages/employees/Tasks';
import { useEmployeeStore } from '../../../store/employeeStore';
import { useUiStore } from '../../../store/uiStore';

export default function TasksPage() {
  const { 
    tasks, 
    updateTaskStatus, 
    incrementTaskProgress,
    startTask,
    addWorkReport,
    completeTask
  } = useEmployeeStore();
  const { triggerToast } = useUiStore();

  return (
    <EmployeeTasks 
      tasks={tasks}
      updateTaskStatus={updateTaskStatus}
      incrementTaskProgress={incrementTaskProgress}
      startTask={startTask}
      addWorkReport={addWorkReport}
      completeTask={completeTask}
      triggerToast={triggerToast}
    />
  );
}
