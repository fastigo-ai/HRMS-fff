import React, { useState } from 'react';
import EmployeeSettings from '../../../pages/employees/Settings';
import { useUiStore } from '../../../store/uiStore';

export default function SettingsPage() {
  const { theme, toggleTheme, triggerToast } = useUiStore();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    attendanceAlerts: true,
    leaveUpdates: true,
    payrollNotifications: true,
    announcements: true,
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleToggleMfa = () => {
    setMfaEnabled(!mfaEnabled);
    triggerToast(!mfaEnabled ? 'Multi-Factor Authenticator initialized' : 'MFA authentication layer disabled');
  };

  const handleToggleNotification = (id) => {
    setNotificationSettings(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    triggerToast('Push alert parameter updated!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      triggerToast('All password fields are required!', 'error');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      triggerToast('New passwords do not match!', 'error');
      return;
    }
    triggerToast('Corporate password credentials successfully synchronized!');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <EmployeeSettings 
      theme={theme}
      toggleDarkMode={toggleTheme}
      mfaEnabled={mfaEnabled}
      handleToggleMfa={handleToggleMfa}
      notificationSettings={notificationSettings}
      handleToggleNotification={handleToggleNotification}
      passwordForm={passwordForm}
      setPasswordForm={setPasswordForm}
      handlePasswordChange={handlePasswordChange}
      triggerToast={triggerToast}
    />
  );
}
