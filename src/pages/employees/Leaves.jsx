import React, { useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Leaves({
  leaveBalances,
  setLeaveBalances,
  leaveHistory,
  setLeaveHistory,
  triggerToast
}) {
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

    // Update balances
    setLeaveBalances({
      ...leaveBalances,
      [balanceKey]: leaveBalances[balanceKey] - diffDays
    });

    // Add to history
    const newReq = {
      id: leaveHistory.length + 1,
      type: quickForm.type,
      startDate: quickForm.startDate,
      endDate: quickForm.endDate,
      totalDays: diffDays,
      reason: quickForm.reason,
      status: 'Pending',
      approvedBy: 'Pending'
    };

    setLeaveHistory([newReq, ...leaveHistory]);
    setQuickForm({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
    triggerToast(`Leave request for ${diffDays} day(s) submitted.`);
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

  // hardcoded calendar days matching October 2023 from Screenshot 3
  const leaveCalendarDays = [
    { day: 24, currentMonth: false },
    { day: 25, currentMonth: false },
    { day: 26, currentMonth: false },
    { day: 27, currentMonth: false },
    { day: 28, currentMonth: false },
    { day: 29, currentMonth: false },
    { day: 30, currentMonth: false },
    { day: 1, currentMonth: true },
    { day: 2, currentMonth: true },
    { day: 3, currentMonth: true, type: 'wfh_approved', label: 'WFH Approved' },
    { day: 4, currentMonth: true },
    { day: 5, currentMonth: true },
    { day: 6, currentMonth: true },
    { day: 7, currentMonth: true },
    { day: 8, currentMonth: true },
    { day: 9, currentMonth: true },
    { day: 10, currentMonth: true },
    { day: 11, currentMonth: true, type: 'annual_leave', label: 'Annual Leave' },
    { day: 12, currentMonth: true, type: 'annual_leave', label: 'Annual Leave' },
    { day: 13, currentMonth: true },
    { day: 14, currentMonth: true },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leave Management</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Plan your time off and track your leave balances effortlessly.</p>
        </div>
        
        <button 
          onClick={() => triggerToast('Main leave application wizard opened')}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Apply Leave
        </button>
      </div>

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
                onClick={() => triggerToast('Rollback leave calendar')}
                className="p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950">
                October 2023
              </span>
              <button 
                onClick={() => triggerToast('Advance leave calendar')}
                className="p-1.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Mon-Sun Grid Layout */}
          <div>
            <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              
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
                    
                    {/* WFH Approved block in light blue/grey with blue text */}
                    {cell.type === 'wfh_approved' && (
                      <div className="bg-sky-50 dark:bg-sky-950/40 p-1 rounded border border-sky-100 dark:border-sky-900/80 text-[7px] font-extrabold text-sky-700 dark:text-sky-300 leading-none truncate">
                        WFH Approved
                      </div>
                    )}

                    {/* Annual Leave block in dark blue/indigo with white text */}
                    {cell.type === 'annual_leave' && (
                      <div className="bg-indigo-600 p-1 rounded border border-indigo-700 text-[7px] font-extrabold text-white leading-none truncate">
                        Annual Leave
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

    </div>
  );
}
