import React from 'react';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  IndianRupee,
  X,
  FolderKanban,
  Briefcase,
  BarChart3
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

export default function HRSidebar({
  currentTab,
  setCurrentTab,
  sidebarOpen,
  setSidebarOpen,
  userRole
}) {
  const { profileData } = useAuthStore();

  const menuItems = [
    { id: 'hr-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hr-employees', label: 'Employees', icon: User },
    { id: 'hr-departments', label: 'Departments', icon: FolderKanban },
    { id: 'hr-attendance', label: 'Attendance', icon: Clock },
    { id: 'hr-leaves', label: 'Leaves', icon: CalendarDays },
    { id: 'hr-payroll', label: 'Payroll', icon: IndianRupee },
    { id: 'hr-recruitment', label: 'Recruitment', icon: Briefcase },
    { id: 'hr-reports', label: 'Reports', icon: BarChart3 }
  ];

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
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">WorkSphere</h1>
              <span className="text-[10px] text-indigo-555 text-indigo-500 font-bold tracking-wider">HRMS ADMIN</span>
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
            const isActive = currentTab === item.id;
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
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer details */}
      <div 
        onClick={() => { setCurrentTab('hr-profile'); setSidebarOpen(false); }}
        className="p-4 border-t border-slate-100 dark:border-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all rounded-b-2xl"
      >
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256" 
            alt="HR User Avatar" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{profileData?.name || 'Sarah Jenkins'}</p>
            <p className="text-xs text-slate-400 dark:text-slate-550 truncate">{profileData?.position || 'HR Director'}</p>
          </div>
        </div>
      </div>
      
    </aside>
  );
}
