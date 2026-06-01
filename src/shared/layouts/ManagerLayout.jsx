import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PMSidebar from '../../components/Manager/Sidebar';
import PMHeader from '../../components/Manager/Header';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useManagerStore } from '../../store/managerStore';

export default function ManagerLayout() {
  const { currentTab, setCurrentTab, clockedIn, updateElapsedTime, checkTodayClockStatus } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme, notifications, fetchNotifications } = useUiStore();
  const { fetchPMData } = useManagerStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync route path directly with PM active sidebars highlights
  useEffect(() => {
    const subpath = location.pathname.substring(9); // strip '/manager/'
    if (subpath && 'pm-' + subpath !== currentTab) {
      setCurrentTab('pm-' + subpath);
    }
  }, [location.pathname]);

  // Sync dataset, clock state, and notifications
  useEffect(() => {
    fetchPMData();
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
    const subpath = tabId.substring(3); // strip 'pm-'
    navigate(`/manager/${subpath}`);
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
      <PMSidebar 
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-900">
        <PMHeader 
          currentTab={currentTab}
          theme={theme}
          toggleDarkMode={toggleTheme}
          userRole="manager"
          setUserRole={handleRoleChange}
          setSidebarOpen={setSidebarOpen}
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
