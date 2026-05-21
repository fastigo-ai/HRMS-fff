import React from 'react';
import EmployeeNotifications from '../../../pages/employees/Notifications';
import { useUiStore } from '../../../store/uiStore';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, triggerToast } = useUiStore();

  return (
    <EmployeeNotifications 
      notifications={notifications}
      markNotificationRead={markNotificationRead}
      triggerToast={triggerToast}
    />
  );
}
