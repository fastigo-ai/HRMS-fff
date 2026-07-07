import React, { useState, useEffect } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { DatabaseService } from '../../services/api';

export default function Leaves({
  leaveBalances,
  setLeaveBalances,
  leaveHistory,
  setLeaveHistory,
  applyLeave,
  triggerToast
}) {
  const [activeViewTab, setActiveViewTab] = useState('planner'); // planner | holidays
  const [liveHolidays, setLiveHolidays] = useState([]);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  useEffect(() => {
    const fetchHols = async () => {
      try {
        const data = await DatabaseService.getHolidays();
        setLiveHolidays(data || []);
      } catch (err) {
        console.error("Failed to fetch holidays in leaves component:", err);
      }
    };
    fetchHols();
  }, []);

  const [quickForm, setQuickForm] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickForm.startDate || !quickForm.endDate || !quickForm.reason) {
      triggerToast('Please fill in all quick apply fields.', 'error');
      return;
    }

    const start = new Date(quickForm.startDate);
    const end = new Date(quickForm.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let balanceKey = 'casualLeave';
    if (quickForm.type === 'Sick Leave') balanceKey = 'sickLeave';
    else if (quickForm.type === 'Paid Leave') balanceKey = 'paidLeave';

    if (leaveBalances[balanceKey] < diffDays) {
      triggerToast(`Insufficient ${quickForm.type} balance.`, 'error');
      return;
    }

    const newReq = {
      type: quickForm.type,
      startDate: quickForm.startDate,
      endDate: quickForm.endDate,
      totalDays: diffDays,
      reason: quickForm.reason
    };

    if (typeof applyLeave === 'function') {
      applyLeave(newReq);
    } else {
      // Fallback: update local React state if state callbacks were supplied
      if (typeof setLeaveBalances === 'function') {
        setLeaveBalances({
          ...leaveBalances,
          [balanceKey]: leaveBalances[balanceKey] - diffDays
        });
      }
      if (typeof setLeaveHistory === 'function') {
        setLeaveHistory([
          { id: leaveHistory ? leaveHistory.length + 1 : 1, ...newReq, status: 'Pending', approvedBy: 'Pending' },
          ...(leaveHistory || [])
        ]);
      }
      triggerToast(`Leave request for ${diffDays} day(s) submitted.`);
    }

    setQuickForm({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
  };

  // Helper component to render circular progress rings matching Screenshot 3
  const CircularProgress = ({ val, total, label, colorClass, strokeColor }) => {
    const percentage = (val / total) * 100;
    const r = 26;
    const circ = 2 * Math.PI * r;
    const strokeOffset = circ - (percentage / 100) * circ;

    return (
      <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-3 flex-1 text-center">
        
        {/* SVG Ring container */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background path */}
            <circle 
              cx="40" 
              cy="40" 
              r={r} 
              className="stroke-slate-100 dark:stroke-slate-900 fill-none" 
              strokeWidth="6" 
            />
            {/* Active path */}
            <circle 
              cx="40" 
              cy="40" 
              r={r} 
              className="fill-none transition-all duration-500" 
              stroke={strokeColor}
              strokeWidth="6" 
              strokeDasharray={circ}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Central count text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">
              {String(val).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Labels info */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{label}</h4>
          <span className="text-[10px] text-slate-400 font-semibold">{total} Total Days</span>
        </div>

      </div>
    );
  };

  const leaveCalendarDays = React.useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    
    const cells = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, currentMonth: false });
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      let type = null;
      let label = null;
      
      if (leaveHistory && leaveHistory.length > 0) {
        const currentDate = new Date(viewYear, viewMonth, d);
        currentDate.setHours(0,0,0,0);
        
        for (const req of leaveHistory) {
          if (req.status === 'Approved') {
            const start = new Date(req.startDate); start.setHours(0,0,0,0);
            const end = new Date(req.endDate); end.setHours(0,0,0,0);
            if (currentDate >= start && currentDate <= end) {
              if (req.type === 'Sick Leave') { type = 'sick_leave'; label = 'Sick Leave'; }
              else if (req.type === 'Casual Leave') { type = 'casual_leave'; label = 'Casual Leave'; }
              else if (req.type === 'Paid Leave') { type = 'paid_leave'; label = 'Paid Leave'; }
              else { type = 'annual_leave'; label = 'Annual Leave'; }
              break;
            }
          }
        }
      }
      cells.push({ day: d, currentMonth: true, type, label });
    }
    
    const remainder = cells.length % 7;
    const nextDaysNeeded = remainder === 0 ? 0 : 7 - remainder;
    
    for (let d = 1; d <= nextDaysNeeded; d++) {
      cells.push({ day: d, currentMonth: false });
    }
    
    return cells;
  }, [viewYear, viewMonth, leaveHistory]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      
      {/* Title Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leave Management</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Plan your time off and track your leave balances effortlessly.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-105 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-850 shadow-inner">
            <button
              onClick={() => setActiveViewTab('planner')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeViewTab === 'planner' 
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              My Leave Planner
            </button>
            <button
              onClick={() => setActiveViewTab('holidays')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeViewTab === 'holidays' 
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              Holiday Calendar View
            </button>
          </div>
          <button 
            onClick={() => triggerToast('Main leave application wizard opened')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>
      </div>

      {activeViewTab === 'planner' && (
        <>
          {/* Progress Circles grid row matching Screenshot 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <CircularProgress 
              val={leaveBalances.sickLeave} 
              total={10} 
              label="Sick Leave" 
              strokeColor="#4f46e5" // Indigo 600
            />
            
            <CircularProgress 
              val={leaveBalances.casualLeave} 
              total={10} 
              label="Casual Leave" 
              strokeColor="#3b82f6" // Blue 500
            />
            
            <CircularProgress 
              val={leaveBalances.paidLeave} 
              total={14} 
              label="Paid Leave" 
              strokeColor="#8b5cf6" // Violet 500
            />

          </div>

          {/* Main split grid: Calendar on left, Quick apply form on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (2/3 space): Leave Calendar */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Leave Calendar</h3>
                
                {/* Navigator controls */}
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm shrink-0">
                  <button 
                    onClick={prevMonth}
                    className="p-1.5 text-slate-500 hover:bg-slate-55 hover:bg-slate-100 dark:hover:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950">
                    {monthNames[viewMonth]} {viewYear}
                  </span>
                  <button 
                    onClick={nextMonth}
                    className="p-1.5 text-slate-500 hover:bg-slate-55 hover:bg-slate-100 dark:hover:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Mon-Sun Grid Layout */}
              <div>
                <div className="grid grid-cols-7 gap-px bg-slate-150 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  
                  {/* Day Labels matching Screenshot 3 (starts with SUN) */}
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900/50 py-3 text-center text-[10px] font-bold text-slate-400 tracking-wider">
                      {d}
                    </div>
                  ))}

                  {/* Day Cells */}
                  {leaveCalendarDays.map((cell, idx) => {
                    let cellClass = "bg-white dark:bg-slate-950 h-20 p-2 relative flex flex-col justify-between transition-colors";
                    let textClass = "text-xs font-bold ";
                    
                    if (!cell.currentMonth) {
                      textClass += "text-slate-300 dark:text-slate-700";
                    } else {
                      textClass += "text-slate-800 dark:text-slate-200";
                    }

                    return (
                      <div key={idx} className={cellClass}>
                        <span className={textClass}>{cell.day}</span>
                        
                        {/* Different leave blocks based on type */}
                        {cell.type === 'wfh_approved' && (
                          <div className="bg-sky-50 dark:bg-sky-950/40 p-1 rounded border border-sky-100 dark:border-sky-900/80 text-[7px] font-extrabold text-sky-700 dark:text-sky-300 leading-none truncate">
                            {cell.label}
                          </div>
                        )}
                        {cell.type === 'sick_leave' && (
                          <div className="bg-rose-50 dark:bg-rose-950/40 p-1 rounded border border-rose-100 dark:border-rose-900/80 text-[7px] font-extrabold text-rose-700 dark:text-rose-300 leading-none truncate">
                            {cell.label}
                          </div>
                        )}
                        {cell.type === 'casual_leave' && (
                          <div className="bg-sky-50 dark:bg-sky-950/40 p-1 rounded border border-sky-100 dark:border-sky-900/80 text-[7px] font-extrabold text-sky-700 dark:text-sky-300 leading-none truncate">
                            {cell.label}
                          </div>
                        )}
                        {cell.type === 'paid_leave' && (
                          <div className="bg-indigo-600 p-1 rounded border border-indigo-700 text-[7px] font-extrabold text-white leading-none truncate">
                            {cell.label}
                          </div>
                        )}
                        {cell.type === 'annual_leave' && (
                          <div className="bg-indigo-600 p-1 rounded border border-indigo-700 text-[7px] font-extrabold text-white leading-none truncate">
                            {cell.label}
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>

            {/* Right Column (1/3 space): Quick Apply card matching Screenshot 3 */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Quick Apply</h3>
                
                <form onSubmit={handleQuickSubmit} className="space-y-4">
                  
                  {/* Leave Type */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Leave Type</label>
                    <select 
                      value={quickForm.type}
                      onChange={(e) => setQuickForm({ ...quickForm, type: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Paid Leave">Paid Leave</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Start Date</label>
                    <input 
                      type="date"
                      value={quickForm.startDate}
                      onChange={(e) => setQuickForm({ ...quickForm, startDate: e.target.value })}
                      className="w-full pl-3 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">End Date</label>
                    <input 
                      type="date"
                      value={quickForm.endDate}
                      onChange={(e) => setQuickForm({ ...quickForm, endDate: e.target.value })}
                      className="w-full pl-3 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Reason for Leave</label>
                    <textarea 
                      rows="3"
                      placeholder="Briefly describe your reason..."
                      value={quickForm.reason}
                      onChange={(e) => setQuickForm({ ...quickForm, reason: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white leading-normal"
                    ></textarea>
                  </div>

                  {/* Submit button */}
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    Submit Request
                  </button>

                </form>
              </div>

            </div>

          </div>

          {/* Leave History Ledger Section */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">My Leave Requests History</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Track all your submitted requests and their real-time approval status.</p>
              </div>
              
              <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-800 uppercase tracking-wide">
                {leaveHistory?.length || 0} Request{leaveHistory?.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table or empty state */}
            {!leaveHistory || leaveHistory.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <Info className="w-8 h-8 text-slate-350 dark:text-slate-655 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Leave Requests Found</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">You haven't submitted any leave applications yet. Use the Quick Apply form to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave Type</th>
                      <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dates & Duration</th>
                      <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                      <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                    {leaveHistory.map((req, idx) => {
                      const formatDate = (dateStr) => {
                        if (!dateStr) return '';
                        const d = new Date(dateStr);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      };

                      let typeBadgeColor = 'bg-slate-50 text-slate-655 dark:bg-slate-900 dark:text-slate-400';
                      if (req.type === 'Sick Leave') typeBadgeColor = 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40';
                      else if (req.type === 'Casual Leave') typeBadgeColor = 'bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/40';
                      else if (req.type === 'Paid Leave') typeBadgeColor = 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/40';

                      let statusBadgeColor = 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
                      if (req.status === 'Approved') statusBadgeColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
                      else if (req.status === 'Rejected') statusBadgeColor = 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40';

                      return (
                        <tr key={req.id || req._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${typeBadgeColor}`}>
                              {req.type}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-white">
                                {formatDate(req.startDate)} - {formatDate(req.endDate)}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                                {req.totalDays} day{req.totalDays !== 1 ? 's' : ''} requested
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-medium text-slate-655 dark:text-slate-400 italic max-w-xs block truncate" title={req.reason}>
                              "{req.reason}"
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 text-[9px] font-extrabold rounded-full uppercase tracking-widest ${statusBadgeColor}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {req.status === 'Pending' ? (
                              <span className="text-slate-400 italic">Pending Review</span>
                            ) : (
                              <span>{req.approvedBy || 'HR Admin'}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Holiday Calendar View Tab */}
      {activeViewTab === 'holidays' && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Holidays Calendar</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Official gazetted and corporate holidays for the current calendar cycle.</p>
          </div>
          {liveHolidays.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <Calendar className="w-8 h-8 text-slate-350 dark:text-slate-600 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Holidays Scheduled</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">No upcoming holidays are currently recorded in the corporate registry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveHolidays.map((hol) => (
                <div key={hol._id} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-2xl flex gap-4 hover:border-indigo-100 dark:hover:border-indigo-950 transition">
                  <div className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-[10px] font-extrabold p-3 rounded-xl text-center w-14 shrink-0 h-fit">
                    <span className="block leading-none uppercase">{new Date(hol.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="block text-sm font-extrabold leading-none mt-1">{new Date(hol.date).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{hol.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{hol.description || 'Gazetted Corporate Holiday'}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full uppercase ${
                        hol.isOptional 
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' 
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20'
                      }`}>
                        {hol.isOptional ? 'Optional' : 'Compulsory'}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-2 py-0.5 rounded-full">
                        {new Date(hol.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
