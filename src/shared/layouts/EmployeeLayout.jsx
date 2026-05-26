import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/employees/Sidebar';
import Header from '../../components/employees/Header';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useEmployeeStore } from '../../store/employeeStore';

export default function EmployeeLayout() {
  const { profileData, clockedIn, elapsedTime, updateElapsedTime, currentTab, setCurrentTab, checkTodayClockStatus } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme, notifications } = useUiStore();
  const { fetchEmployeeData } = useEmployeeStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync route path directly with sidebar active highlight states
  useEffect(() => {
    const subpath = location.pathname.substring(10); // strip '/employee/'
    if (subpath && subpath !== currentTab) {
      setCurrentTab(subpath);
    }
  }, [location.pathname]);

  // Fetch task lists and restore clock state on initial render
  useEffect(() => {
    fetchEmployeeData();
    checkTodayClockStatus();
  }, []);

  // Clock elapsed timer sync
  useEffect(() => {
    let intervalId;
    if (clockedIn) {
      intervalId = setInterval(() => {
        updateElapsedTime();
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [clockedIn]);

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    navigate(`/employee/${tabId}`);
  };

  const handleRoleChange = (newRole) => {
    if (newRole === 'hr_admin') {
      navigate('/hr/dashboard');
    } else if (newRole === 'manager') {
      navigate('/manager/dashboard');
    } else {
      navigate('/employee/dashboard');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
        profileData={profileData}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <Header 
          currentTab={currentTab}
          theme={theme}
          toggleDarkMode={toggleTheme}
          userRole="standard_employee"
          setUserRole={handleRoleChange}
          setSidebarOpen={setSidebarOpen}
          profileData={profileData}
          clockedIn={clockedIn}
          elapsedTime={elapsedTime}
          unreadCount={notifications.filter(n => !n.isRead).length}
          setCurrentTab={handleTabChange}
        />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
