import React, { useState } from 'react';
import {
  Check,
  Bell,
  Filter,
  Users,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Info,
  Plus
} from 'lucide-react';

export default function Notifications({
  notifications,
  setNotifications,
  triggerToast
}) {
  const [selectedFilter, setSelectedFilter] = useState('all'); // all | announcement | attendance | leave | payroll
  const [pushToggled, setPushToggled] = useState(true);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    triggerToast('All notifications marked as read.');
  };

  const getFilteredNotifications = () => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter(n => n.category === selectedFilter);
  };

  // Group notifications into Today and Yesterday simulated
  const todayNotifications = getFilteredNotifications().filter(n => !n.time.includes('Yesterday') && !n.time.includes('days ago'));
  const yesterdayNotifications = getFilteredNotifications().filter(n => n.time.includes('Yesterday') || n.time.includes('days ago'));

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400';
      case 'medium': return 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header Area matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Stay updated with the latest activity across Fastigo X.</p>
        </div>
        
        <button 
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition"
        >
          <Check className="w-4 h-4 text-indigo-600" />
          Mark all as read
        </button>
      </div>

      {/* Main Grid matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column (1/4 space): Filters panel & Quick Preferences */}
        <div className="space-y-6">
          
          {/* Filters Card */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Filters</h3>
            
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'all', label: 'All Activity', count: notifications.length },
                { id: 'announcement', label: 'Announcements', count: notifications.filter(n => n.category === 'announcement').length },
                { id: 'attendance', label: 'Attendance', count: notifications.filter(n => n.category === 'attendance').length },
                { id: 'leave', label: 'Leaves', count: notifications.filter(n => n.category === 'leave').length },
                { id: 'payroll', label: 'Payroll', count: notifications.filter(n => n.category === 'payroll').length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFilter === f.id
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <span>{f.label}</span>
                  {f.count > 0 && (
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      selectedFilter === f.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                    }`}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Preferences toggler */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Preferences</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Push alerts</span>
                <button 
                  onClick={() => { setPushToggled(!pushToggled); triggerToast('Push preferences synced.'); }}
                  className={`w-9 h-5 rounded-full relative transition-colors ${pushToggled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${pushToggled ? 'right-0.5' : 'left-0.5'}`}></span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (3/4 space): Timeline list feeds */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Today Group */}
          {todayNotifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">Today</h3>
              
              {todayNotifications.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition relative">
                  
                  {/* Blue unread circular indicator */}
                  {!item.isRead && (
                    <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}

                  <div className="p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="space-y-2 flex-1 min-w-0 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.title}</h4>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyles(item.priority || 'medium')}`}>
                        {item.priority || 'medium'} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.message}</p>
                    
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold">
                      <span>⏰ {item.time}</span>
                      {item.category === 'announcement' && (
                        <button 
                          onClick={() => triggerToast('Opening announcement links')}
                          className="text-indigo-600 hover:text-indigo-700 font-bold"
                        >
                          View details →
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Yesterday Group */}
          {yesterdayNotifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 pl-1">Yesterday</h3>
              
              {yesterdayNotifications.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:border-slate-200 dark:hover:border-slate-800 transition relative">
                  
                  {/* Unread circle */}
                  {!item.isRead && (
                    <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 text-slate-500 rounded-xl shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="space-y-2 flex-1 min-w-0 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.title}</h4>
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500">
                        {item.priority || 'low'} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.message}</p>
                    <span className="text-[10px] text-slate-400 font-semibold block">⏰ {item.time}</span>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Corporate Promo Card matching Screenshot 4 */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
            
            {/* Promo banner graphic */}
            <div className="h-48 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 flex items-end p-6">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
              <h3 className="text-xl font-extrabold text-white z-10">Fastigo X Annual Tech Summit 2024</h3>
              
              {/* Floating plus button */}
              <button 
                onClick={() => triggerToast('Summit details added to schedule!')}
                className="absolute bottom-4 right-6 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Poster info & description */}
            <div className="p-6 space-y-4">
              
              {/* Profile details */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-50 dark:border-slate-900">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64" alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-950" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64" alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-950" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  Posted by <span className="text-slate-600 dark:text-slate-300">HR Communications</span> • 2 days ago
                </span>
              </div>

              {/* Rich description text */}
              <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                <p>
                  We are thrilled to announce our upcoming internal Tech Summit. This year's theme is "Augmenting HR with AI Intelligence". Join us for two days of workshops, networking, and insightful keynote speeches from industry leaders.
                </p>

                {/* Bullet list */}
                <ul className="space-y-2 list-disc pl-5">
                  <li>Interactive AI demos and hands-on training sessions</li>
                  <li>Guest speech by Chief People Officer</li>
                  <li>Gala dinner and innovation awards ceremony</li>
                </ul>
              </div>

              {/* RSVP Actions buttons */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-50 dark:border-slate-900">
                <button 
                  onClick={() => triggerToast('Successfully RSVP\'d for Tech Summit!')}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
                >
                  RSVP Now
                </button>
                
                <button 
                  onClick={() => triggerToast('Agenda document downloading')}
                  className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition"
                >
                  View Full Agenda
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
