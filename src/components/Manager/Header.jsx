import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Shield,
  Layers,
  LogOut,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export default function PMHeader({
  currentTab,
  theme,
  toggleDarkMode,
  userRole,
  setUserRole,
  setSidebarOpen,
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
  
  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'pm-dashboard': return 'PM Dashboard Overview';
      case 'pm-team': return 'Team Allocation & Bandwidth';
      case 'pm-tasks': return 'Sprint Kanban board';
      case 'pm-approvals': return 'Approvals Hub & Timesheets';
      case 'pm-milestones': return 'Milestone Gantt Roadmap';
      case 'pm-profile': return 'Manager Profile Details';
      default: return 'Project Manager Panel';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 border-b border-slate-200 dark:bg-slate-950/80 dark:border-slate-900 backdrop-blur-md">
      
      {/* Left Title / Breadcrumbs area */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-none">{getBreadcrumbTitle()}</h2>
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-4">
        
        {/* Dynamic Sandbox Role switcher */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Shield className="w-4 h-4 text-violet-500" />
          <select 
            value={userRole} 
            onChange={(e) => setUserRole(e.target.value)}
            className="text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="standard_employee">Employee View</option>
            <option value="hr_admin">HR Admin View</option>
            <option value="manager">Manager View</option>
          </select>
        </div>

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
          className="p-2.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Active Project indicator dropdown */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-955/20 text-violet-650 dark:text-violet-400 rounded-xl border border-violet-100 dark:border-violet-900/40">
          <Layers className="w-4 h-4 text-violet-500" />
          <select 
            defaultValue="Refactor Sprint"
            onChange={(e) => {
              const showToast = triggerToast || uiToast;
              if (showToast) showToast(`Workspace sprint focus switched to: ${e.target.value}`);
            }}
            className="text-xs font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-violet-650 dark:text-violet-400 cursor-pointer"
          >
            <option value="Refactor Sprint">Refactor Sprint</option>
            <option value="Payroll Sprint">Payroll Sprint</option>
            <option value="Roster Sprint">Roster Sprint</option>
            <option value="Seeding Sprint">Seeding Sprint</option>
          </select>
        </div>

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
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{profileData?.name || 'David Miller'}</h2>
            <span className="text-[10px] text-slate-400 font-medium">{profileData?.position || 'Engineering Lead & PM'}</span>
          </div>
          <img 
            src={profileData?.avatar || (profileData?.gender === 'female' 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256' 
              : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256')} 
            alt="PM Director Avatar" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/10 cursor-pointer"
            onClick={() => setCurrentTab('pm-profile')}
          />
        </div>

      </div>

    </header>
  );
}
