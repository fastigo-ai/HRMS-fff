import React, { useState, useEffect } from 'react';
import EmployeeSettings from '../../../pages/employees/Settings';
import { useUiStore } from '../../../store/uiStore';
import { employeeService } from '../../../services/employeeService';

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

  const [resignation, setResignation] = useState(null);
  const [resignationLoading, setResignationLoading] = useState(true);

  useEffect(() => {
    fetchResignation();
  }, []);

  const fetchResignation = async () => {
    setResignationLoading(true);
    try {
      const data = await employeeService.getResignation();
      setResignation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setResignationLoading(false);
    }
  };

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

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      triggerToast('All password fields are required!', 'error');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      triggerToast('New passwords do not match!', 'error');
      return;
    }
    
    try {
      setIsUpdatingPassword(true);
      await employeeService.updatePassword(passwordForm.current, passwordForm.new);
      triggerToast('Corporate password credentials successfully synchronized!');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      triggerToast(error.message || 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSubmitResignation = async (lastWorkingDay, reason) => {
    try {
      const data = await employeeService.submitResignation({ lastWorkingDay, reason });
      setResignation(data);
      triggerToast('Resignation successfully submitted for review!');
    } catch (err) {
      triggerToast(err.message || 'Failed to submit resignation request', 'error');
    }
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
      isUpdatingPassword={isUpdatingPassword}
      triggerToast={triggerToast}
      resignation={resignation}
      resignationLoading={resignationLoading}
      onSubmitResignation={handleSubmitResignation}
    />
  );
}
