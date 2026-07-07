import React from 'react';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  IndianRupee,
  CheckSquare,
  Bell,
  Settings as SettingsIcon,
  Plus,
  X,
  Briefcase
} from 'lucide-react';

export default function Sidebar({
  currentTab,
  setCurrentTab,
  sidebarOpen,
  setSidebarOpen,
  unreadNotificationsCount,
  profileData
}) {

  const isSalesRole = profileData?.role === 'salesperson' || 
                      profileData?.position?.toLowerCase().includes('sale') ||
                      profileData?.department?.toLowerCase().includes('sale') ||
                      profileData?.role === 'manager' || 
                      profileData?.role === 'hr_admin';

  let menuItems = [];

  if (profileData?.role === 'salesperson') {
    menuItems = [
      { id: 'sales-crm', label: 'Sales CRM', icon: Briefcase },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell, badgeCount: unreadNotificationsCount },
      { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ];
  } else {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'attendance', label: 'Attendance', icon: Clock },
      { id: 'leaves', label: 'Leaves', icon: CalendarDays },
      { id: 'holidays', label: 'Holiday Calendar', icon: CalendarDays },
      { id: 'payroll', label: 'Payroll', icon: IndianRupee },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
      ...(isSalesRole ? [{ id: 'sales-crm', label: 'Sales CRM', icon: Briefcase }] : []),
      { id: 'notifications', label: 'Notifications', icon: Bell, badgeCount: unreadNotificationsCount },
      { id: 'settings', label: 'Settings', icon: SettingsIcon },
      { id: 'company-details', label: 'Company Settings', icon: SettingsIcon },
    ];
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800 transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out flex flex-col justify-between shrink-0`}>
      
      <div>
        {/* Branding Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/20">
              W
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Fastigo X</h1>
              <span className="text-[10px] text-indigo-500 font-bold tracking-wider">HRMS PORTAL</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation links */}
        <nav className="px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id || (item.id === 'attendance' && currentTab === 'wfh-request');
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentTab(item.id); setSidebarOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                    isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white animate-pulse'
                  }`}>
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer details */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-900 space-y-4">
        <button 
          onClick={() => { setCurrentTab('leaves'); setSidebarOpen(false); }}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25"
        >
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-900">
          <img 
            src={profileData?.avatar || (profileData?.gender === 'female' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256' 
              : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256')} 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{profileData.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{profileData.position}</p>
          </div>
        </div>
      </div>
      
    </aside>
  );
}
