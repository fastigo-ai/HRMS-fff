import React from 'react';
import EmployeeNotifications from '../../../pages/employees/Notifications';
import { useUiStore } from '../../../store/uiStore';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, setNotifications, triggerToast } = useUiStore();

  return (
    <EmployeeNotifications
      notifications={notifications}
      setNotifications={setNotifications}
      markNotificationRead={markNotificationRead}
      triggerToast={triggerToast}
    />
  );
}
