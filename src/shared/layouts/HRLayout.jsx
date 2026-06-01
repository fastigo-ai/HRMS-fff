import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import HRSidebar from '../../components/HR/Sidebar';
import HRHeader from '../../components/HR/Header';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export default function HRLayout() {
  const { currentTab, setCurrentTab, clockedIn, updateElapsedTime, checkTodayClockStatus } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme, notifications, triggerToast, fetchNotifications } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync route path directly with HR active sidebars highlights
  useEffect(() => {
    const subpath = location.pathname.substring(4); // strip '/hr/'
    if (subpath && 'hr-' + subpath !== currentTab) {
      setCurrentTab('hr-' + subpath);
    }
  }, [location.pathname]);

  // Restore clock state and load notifications on initial render
  useEffect(() => {
    checkTodayClockStatus();
    fetchNotifications();
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
    const subpath = tabId.substring(3); // strip 'hr-'
    navigate(`/hr/${subpath}`);
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
      <HRSidebar 
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole="hr_admin"
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <HRHeader 
          currentTab={currentTab}
          theme={theme}
          toggleDarkMode={toggleTheme}
          userRole="hr_admin"
          setUserRole={handleRoleChange}
          setSidebarOpen={setSidebarOpen}
          unreadCount={notifications.filter(n => !n.isRead).length}
          setCurrentTab={handleTabChange}
          triggerToast={triggerToast}
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
