import React from 'react';
import {
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard({
  setCurrentTab,
  leaveBalances,
  tasks,
  notifications,
  clockedIn,
  toggleClockInOut,
  userRole
}) {
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const announcementCount = notifications.filter(n => n.category === 'announcement').length;
  const recentAlerts = notifications.slice(0, 3);

  // Upcoming holidays array
  const holidays = [
    { date: '25 May 2026', name: 'Memorial Day', day: 'Monday' },
    { date: '19 Jun 2026', name: 'Juneteenth', day: 'Friday' },
    { date: '04 Jul 2026', name: 'Independence Day', day: 'Saturday' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Greetings */}
      <div className="relative p-6 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-extrabold mb-1">Welcome Back to WorkSphere!</h2>
          <p className="text-indigo-200 text-sm mb-4">You have {pendingTasksCount} pending tasks on your schedule for today. Keep track of operations cleanly.</p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setCurrentTab('attendance')}
              className="px-4 py-2 text-xs font-bold bg-white text-indigo-700 rounded-xl hover:bg-slate-50 transition shadow"
            >
              {clockedIn ? 'Check Active Session' : 'Clock In Now'}
            </button>
            <button 
              onClick={() => setCurrentTab('leaves')}
              className="px-4 py-2 text-xs font-bold bg-indigo-600/30 text-white border border-white/20 rounded-xl hover:bg-indigo-600/50 transition"
            >
              Request Time Off
            </button>
          </div>
        </div>
      </div>

      {/* Grid Quick Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Clock state */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clock Status</span>
            <div className={`p-2 rounded-xl ${clockedIn ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              {clockedIn ? 'Active' : 'Offline'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Today's work shift tracker</p>
            <button 
              onClick={toggleClockInOut}
              className={`w-full py-2 text-xs font-bold rounded-xl transition ${
                clockedIn 
                  ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400' 
                  : 'bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400'
              }`}
            >
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </div>

        {/* Card 2: Leave Balance */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Available Leaves</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              {leaveBalances.casualLeave + leaveBalances.sickLeave + leaveBalances.paidLeave} Days
            </h3>
            <p className="text-xs text-indigo-500 font-semibold mb-3">Across casual, paid, & sick</p>
            <button 
              onClick={() => setCurrentTab('leaves')}
              className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
            >
              Leave Portal
            </button>
          </div>
        </div>

        {/* Card 3: Tasks Tracker */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tasks Pending</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
              {pendingTasksCount} Tasks
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">On dynamic Agile sprint</p>
            <button 
              onClick={() => setCurrentTab('tasks')}
              className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
            >
              Task Kanban Board
            </button>
          </div>
        </div>

        {/* Card 4: Role access */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Access Scope</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 capitalize truncate">
              {userRole.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Access constraints enforced</p>
            <div className="px-3 py-2 text-[10px] bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-500 font-bold border border-slate-100 dark:border-slate-800 uppercase tracking-wider text-center">
              Role-Based RBAC active
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: announcements + upcoming holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Announcements list */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-900">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Announcements Feed</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Important circulars and events</p>
            </div>
            <button 
              onClick={() => setCurrentTab('notifications')}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {recentAlerts.map(alert => (
              <div key={alert.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 flex items-start gap-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                      {alert.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-1">{alert.message}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Holidays list */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Holidays</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Corporate calendar cycle</p>
            </div>
            <div className="space-y-3">
              {holidays.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{h.name}</h4>
                    <span className="text-[10px] text-slate-400">{h.day}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                    {h.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-900 text-center">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">Total paid annual holidays: 14 days</span>
          </div>
        </div>

      </div>

    </div>
  );
}
