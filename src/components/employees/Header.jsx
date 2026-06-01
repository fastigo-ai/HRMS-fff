import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export default function Header({
  currentTab,
  theme,
  toggleDarkMode,
  userRole,
  setUserRole,
  setSidebarOpen,
  profileData,
  clockedIn,
  elapsedTime,
  unreadCount,
  setCurrentTab
}) {
  const { logout } = useAuthStore();
  const { triggerToast } = useUiStore();

  const handleLogout = () => {
    logout();
    triggerToast('Logged out successfully! Workspace session cleared.');
  };
  
  // Format tab names nicely for breadcrumbs
  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'profile': return 'Employee Profile';
      case 'attendance': return 'Attendance Dashboard';
      case 'wfh-request': return 'Work From Home Request';
      case 'leaves': return 'Leave Management';
      case 'payroll': return 'Payroll & Salary Structure';
      case 'tasks': return 'Tasks & Performance';
      case 'notifications': return 'Notifications Center';
      case 'settings': return 'Settings & Security';
      default: return 'HRM Portal';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-slate-200 dark:bg-slate-950/80 dark:border-slate-900 backdrop-blur-md">
      
      {/* Left Search Box */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search records, policies, tasks..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-4">
        
        {/* Geofence Clock Status Pill */}
        {clockedIn && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/80 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Clocked In ({elapsedTime})</span>
          </div>
        )}



        {/* Theme Switcher Button */}
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications Icon with Indicator */}
        <button 
          onClick={() => setCurrentTab('notifications')}
          className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950"></span>
          )}
        </button>

        <button 
          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition hidden sm:block"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <button 
          onClick={handleLogout}
          className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition cursor-pointer"
          title="Sign Out Session"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* User visual card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden lg:block text-right">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{profileData.name}</h2>
            <span className="text-[10px] text-slate-400 font-medium">{profileData.position}</span>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256" 
            alt="Avatar" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/10 cursor-pointer"
            onClick={() => setCurrentTab('profile')}
          />
        </div>

      </div>

    </header>
  );
}
