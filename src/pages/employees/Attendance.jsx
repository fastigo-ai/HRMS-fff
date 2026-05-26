import React, { useState } from 'react';
import {
  Clock,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Attendance({
  clockedIn,
  clockOutCompleted,
  toggleClockInOut,
  elapsedTime,
  setCurrentTab,
  triggerToast,
  logs = [],
  stats = {}
}) {
  const [selectedLogsMonth, setSelectedLogsMonth] = useState('May 2026');

  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Generate calendar days dynamically for May 2026
  const getCalendarDays = () => {
    const days = [];
    // April 2026 padding (starts Friday, Mon-Thu are previous month)
    for (let d = 27; d <= 30; d++) {
      days.push({ day: d, currentMonth: false });
    }
    // May 2026 days
    for (let d = 1; d <= 31; d++) {
      const dayStr = String(d).padStart(2, "0");
      const fullDateStr = `2026-05-${dayStr}`;
      const log = logs.find(l => l.date === fullDateStr);
      
      let type = undefined;
      if (log) {
        if (log.clockIn && !log.clockOut) {
          type = 'active';
        } else if (log.mode === "WFH") {
          type = 'wfh';
        } else if (log.mode === "Field") {
          type = 'field';
        } else {
          type = 'office';
        }
      }
      days.push({ day: d, currentMonth: true, type });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6">
      
      {/* Page Header Area matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Overview</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Tracking your productivity for May 2026</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => triggerToast('Attendance report exported successfully!')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Report
          </button>
          
          <button 
            onClick={toggleClockInOut}
            disabled={clockOutCompleted}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md transition ${
              clockOutCompleted
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-600 shadow-none'
                : clockedIn 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 hover:shadow-rose-600/20 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 hover:shadow-indigo-600/20 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            {clockOutCompleted ? 'Shift Completed' : clockedIn ? `Clock Out (${elapsedTime})` : 'Clock In'}
          </button>
        </div>
      </div>

      {/* Metrics Row (4 Card Grid) matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Working Hours */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Working Hours</span>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalHours || 0}</span>
            <span className="text-xs text-slate-400 font-semibold ml-1">hrs</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-900">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">Active</span>
            <span className="text-[10px] text-slate-400">cumulative shift log</span>
          </div>
        </div>

        {/* Average Check In */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Avg. Check-In</span>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {(stats.avgCheckIn || "09:00 AM").split(" ")[0]}
            </span>
            <span className="text-xs text-slate-400 font-semibold ml-1">
              {(stats.avgCheckIn || "09:00 AM").split(" ")[1]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-900">
            <span className="text-[10px] text-slate-400">Shift Target: 09:30 AM</span>
          </div>
        </div>

        {/* Present Days */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Present Days</span>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.presentDays || 0}</span>
            <span className="text-xs text-slate-400 font-semibold ml-1">/ 22</span>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: `${Math.min(((stats.presentDays || 0) / 22) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Late Marks */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Late Marks</span>
          <div>
            <span className={`text-2xl font-extrabold ${stats.lateMarks > 3 ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
              {String(stats.lateMarks || 0).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-900">
            <span className="text-[10px] text-slate-400">Allowed: 3 per month</span>
          </div>
        </div>

      </div>

      {/* Main content grid: Calendar on left, Live feeds on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Attendance Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Calendar title, legends and navigator */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Calendar</h3>
            </div>
            
            {/* Color indicators */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Office</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>WFH</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                <span>Field</span>
              </div>
            </div>

            {/* Navigator controls */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm shrink-0">
              <button 
                onClick={() => triggerToast('Simulated month rollback')}
                className="p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950">
                May 2026
              </span>
              <button 
                onClick={() => triggerToast('Simulated month advance')}
                className="p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Mon-Sun Grid Layout */}
          <div>
            <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              
              {/* Day Labels */}
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/50 py-3 text-center text-[10px] font-bold text-slate-400 tracking-wider">
                  {d}
                </div>
              ))}

              {/* Day Cells */}
              {calendarDays.map((cell, idx) => {
                let cellClass = "bg-white dark:bg-slate-950 h-16 p-2 relative flex flex-col justify-between transition-colors";
                let textClass = "text-xs font-bold ";
                
                if (!cell.currentMonth) {
                  textClass += "text-slate-300 dark:text-slate-700";
                } else {
                  textClass += "text-slate-800 dark:text-slate-200";
                }

                // Selected Active day in blue
                if (cell.type === 'active') {
                  cellClass = "bg-indigo-600 text-white h-16 p-2 relative flex flex-col justify-between shadow-lg shadow-indigo-600/20";
                  textClass = "text-xs font-bold text-white";
                }

                return (
                  <div key={idx} className={cellClass}>
                    <span className={textClass}>{cell.day}</span>
                    
                    {/* Visual dot labels based on status matching Screenshot 1 */}
                    {cell.type === 'office' && (
                      <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-indigo-600"></span>
                    )}
                    {cell.type === 'wfh' && (
                      <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-400"></span>
                    )}
                    {cell.type === 'field' && (
                      <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-amber-700"></span>
                    )}
                    {cell.type === 'active' && (
                      <span className="absolute bottom-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-white text-indigo-600 shadow text-[8px] font-extrabold">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

        </div>

        {/* Right Column: Live Records & Work Hours */}
        <div className="space-y-6">
          
          {/* Live Records Card matching Screenshot 1 */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-900">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Records</h3>
              <button 
                onClick={() => triggerToast('Timeline history opened')}
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600"
              >
                View All
              </button>
            </div>

            <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              
              {logs.slice(0, 3).map((log, i) => {
                let dotColor = "bg-indigo-600";
                if (log.mode === "WFH") dotColor = "bg-slate-400";
                if (log.mode === "Field") dotColor = "bg-amber-700";

                let badgeText = "OFFICE";
                let badgeClass = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300";
                if (log.mode === "WFH") {
                  badgeText = "REMOTE";
                  badgeClass = "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400";
                } else if (log.mode === "Field") {
                  badgeText = "EXTERNAL";
                  badgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
                } else if (log.status === "Late") {
                  badgeText = "LATE ARRIVAL";
                  badgeClass = "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455";
                }

                const formatTime = (timeStr) => {
                  if (!timeStr) return "";
                  return new Date(timeStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                };

                const formatDate = (timeStr) => {
                  if (!timeStr) return "";
                  const d = new Date(timeStr);
                  const todayStr = getLocalDateString(new Date());
                  const logDayStr = getLocalDateString(d);
                  if (todayStr === logDayStr) return "Today";
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                };

                return (
                  <div key={log._id || i} className="relative space-y-1">
                    <span className={`absolute -left-4 top-1 w-3 h-3 rounded-full ${dotColor} ring-4 ring-white dark:ring-slate-950`}></span>
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                         Clocked In at {log.location || "Headquarters"}
                       </h4>
                       <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${badgeClass}`}>{badgeText}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {formatDate(log.clockIn)}, {formatTime(log.clockIn)} {log.clockOut ? `(Out: ${formatTime(log.clockOut)})` : ""}
                    </p>
                  </div>
                );
              })}

              {logs.length === 0 && (
                <p className="text-[10px] text-slate-400 py-4 italic">No logs recorded for this month.</p>
              )}

            </div>

            {/* Quick trigger button for WFH request */}
            <div className="pt-2 border-t border-slate-50 dark:border-slate-900">
              <button 
                onClick={() => setCurrentTab('wfh-request')}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition"
              >
                Apply for Work From Home (WFH)
              </button>
            </div>
          </div>

          {/* Work Hours Chart Card */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Work Hours</h3>
            
            {/* Visual Bar chart simulator matching Screenshot 1 */}
            <div className="h-32 flex items-end justify-between gap-2 px-2">
              {[
                { label: 'MON', val: 50 },
                { label: 'TUE', val: 80 },
                { label: 'WED', val: 68 },
                { label: 'THU', val: 95 },
                { label: 'FRI', val: 35 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-indigo-50 dark:bg-indigo-950/20 rounded-t-lg relative flex items-end justify-center overflow-hidden" style={{ height: '80px' }}>
                    <div className="w-full bg-indigo-200 dark:bg-indigo-500 rounded-t-lg transition-all duration-500" style={{ height: `${bar.val}%` }}></div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section: Detailed Attendance Logs Table */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table title and actions */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detailed Attendance Logs</h3>
          <button 
            onClick={() => triggerToast('Search filtering panel')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition"
            title="Filter Results"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900">
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
              
              {logs.map((log) => {
                const d = new Date(log.clockIn);
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const weekdayStr = d.toLocaleDateString('en-US', { weekday: 'long' });
                
                const inTimeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const outTimeStr = log.clockOut 
                  ? new Date(log.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : "--:--";

                let statusText = "Present";
                let statusClass = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300";
                if (log.mode === "WFH") {
                  statusText = "WFH";
                  statusClass = "bg-slate-100 text-slate-655 dark:bg-slate-900 dark:text-slate-400";
                } else if (log.status === "Late") {
                  statusText = "Late Arrival";
                  statusClass = "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400";
                }

                return (
                  <tr key={log._id}>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-white block">{dateStr}</span>
                      <span className="text-[9px] text-slate-400">{weekdayStr}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-650 dark:text-slate-300">{inTimeStr}</td>
                    <td className="px-6 py-4 font-medium text-slate-400">{outTimeStr}</td>
                    <td className="px-6 py-4 font-medium text-slate-655 dark:text-slate-300">{log.timeSpent || "Current"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase ${statusClass}`}>{statusText}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{log.location || "Headquarters"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => triggerToast(`Check-in coordinates verified: ${log.location || "Headquarters"}`)} className="text-[10px] font-bold text-slate-400 hover:text-indigo-600">Details</button>
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">
                    No attendance records found in database.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* Load Previous Month Dropdown Trigger */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-900 text-center">
          <button 
            onClick={() => triggerToast('Logs expanded for previous months.')}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600"
          >
            Load Previous Month <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
