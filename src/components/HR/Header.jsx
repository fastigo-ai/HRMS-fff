import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Shield,
  LogOut,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export default function HRHeader({
  currentTab,
  theme,
  toggleDarkMode,
  userRole,
  setUserRole,
  setSidebarOpen,
  unreadCount,
  setCurrentTab,
  triggerToast
}) {
  const { logout, profileData, clockedIn, elapsedTime, toggleClock } = useAuthStore();
  const { triggerToast: uiToast } = useUiStore();

  const handleLogout = () => {
    logout();
    const showToast = triggerToast || uiToast;
    if (showToast) showToast('Logged out successfully! Workspace session cleared.');
  };
  
  // Format HR Admin tab names nicely for breadcrumbs
  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'hr-dashboard': return 'HR Overview';
      case 'hr-employees': return 'Active Directory';
      case 'hr-departments': return 'Departments Matrix';
      case 'hr-attendance': return 'Attendance Auditor';
      case 'hr-leaves': return 'Leave Approvals Ledger';
      case 'hr-payroll': return 'Monthly Payroll';
      case 'hr-recruitment': return 'Recruitment Hub';
      case 'hr-reports': return 'Quarterly Analytics Reports';
      case 'hr-profile': return 'HR Director Profile Details';
      default: return 'HR Admin Portal';
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
            placeholder="Search employees, reports, actions..." 
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-4">
        


        {/* Personal clock-in/out trigger */}
        <button
          onClick={() => toggleClock(triggerToast || uiToast)}
          className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-300 border ${
            clockedIn 
              ? 'bg-rose-50 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
              : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400'
          }`}
          title={clockedIn ? "Click to clock out of geofenced system" : "Click to clock in to active workspace"}
        >
          {clockedIn ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Clock Out ({elapsedTime})</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Clock In</span>
            </>
          )}
        </button>

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
          onClick={() => {
            setCurrentTab('hr-dashboard');
            if (triggerToast) triggerToast('Navigating to HR Overview dashboard.');
          }}
          className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950"></span>
          )}
        </button>

        <button 
          onClick={() => {
            if (triggerToast) triggerToast('HR Help Center database loaded.');
          }}
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

        {/* User visual card (Dynamic) */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden lg:block text-right">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{profileData?.name || 'Sarah Jenkins'}</h2>
            <span className="text-[10px] text-slate-400 font-medium">{profileData?.position || 'HR Director'}</span>
          </div>
          <img 
            src={profileData?.avatar || (profileData?.gender === 'female' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256' 
              : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256')} 
            alt="HR Director Avatar" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/10 cursor-pointer"
            onClick={() => setCurrentTab('hr-profile')}
          />
        </div>

      </div>

    </header>
  );
}
