import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardCheck,
  Milestone,
  X,
  ShieldAlert,
  TrendingUp,
  CalendarDays,
  IndianRupee,
  Bell
} from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

export default function PMSidebar({
  currentTab,
  setCurrentTab,
  sidebarOpen,
  setSidebarOpen
}) {
  const { profileData } = useAuthStore();

  const menuItems = [
    { id: 'pm-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pm-team', label: 'Team Allocation', icon: Users },
    { id: 'pm-tasks', label: 'Sprint Tasks', icon: CheckSquare },
    { id: 'pm-approvals', label: 'Approvals Hub', icon: ClipboardCheck },
    { id: 'pm-milestones', label: 'Milestones Gantt', icon: Milestone },
    { id: 'pm-holidays', label: 'Holiday Calendar', icon: CalendarDays },
    { id: 'pm-sales-audit', label: 'Sales Audit', icon: TrendingUp },
    { id: 'pm-payroll', label: 'Payroll', icon: IndianRupee },
    { id: 'pm-notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-205 dark:bg-slate-950 dark:border-slate-800 border-slate-200 transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out flex flex-col justify-between shrink-0`}>
      
      <div>
        {/* Branding Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-600 text-white font-extrabold shadow-md shadow-violet-600/20 animate-pulse">
              W
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Fastigo X</h1>
              <span className="text-[10px] text-violet-500 font-extrabold tracking-wider">PM WORKSPACE</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation links */}
        <nav className="px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentTab(item.id); setSidebarOpen(false); }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-450 group-hover:text-slate-600 dark:group-hover:text-slate-200'
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
        onClick={() => { setCurrentTab('pm-profile'); setSidebarOpen(false); }}
        className="p-4 border-t border-slate-100 dark:border-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all rounded-b-2xl"
      >
        <div className="flex items-center gap-3">
          <img 
            src={profileData?.avatar || (profileData?.gender === 'female' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256' 
              : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256')} 
            alt="PM User Avatar" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{profileData?.name || 'David Miller'}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{profileData?.position || 'Engineering Lead & PM'}</p>
          </div>
        </div>
      </div>
      
    </aside>
  );
}
