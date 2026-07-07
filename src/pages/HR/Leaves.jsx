import React, { useState, useEffect } from 'react';
import {
  Users,
  Plane,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Sparkles,
  Sliders,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Trash2,
  Tag
} from 'lucide-react';
import { DatabaseService } from '../../services/api';
import { hrService } from '../../services/hrService';
import { useEmployeeStore } from '../../store/employeeStore';
import EmployeeLeaves from '../employees/Leaves';

export default function HRLeaves({
  triggerToast
}) {
  const [requests, setRequests] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [wfhRequests, setWfhRequests] = useState([]);
  const [calendarStatus, setCalendarStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeTab, setActiveTab] = useState('requests');
  const { leaveBalances, leaveHistory, applyLeave, fetchEmployeeData } = useEmployeeStore();

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

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const teamAvailabilityDays = React.useMemo(() => {
    let firstDay = new Date(viewYear, viewMonth, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // 0=Mon, 6=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ empty: true });
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      let status = 'none';
      const isToday = new Date().getFullYear() === viewYear && 
                      new Date().getMonth() === viewMonth && 
                      new Date().getDate() === d;
      
      if (isToday) {
        status = 'today';
      }
      cells.push({ day: d, status, empty: false });
    }
    return cells;
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (activeTab === 'apply-leave') {
      fetchEmployeeData();
    }
  }, [activeTab]);
  const [holidays, setHolidays] = useState([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    description: '',
    isOptional: false
  });
  const [submittingHoliday, setSubmittingHoliday] = useState(false);

  // Fetch data asynchronously on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getHRLeaves();
        setRequests(data.requests);
        setPolicies(data.policies);
        setCalendarStatus(data.calendarStatus || {});
        
        const wfhData = await hrService.getWFHRequestsAll();
        setWfhRequests(wfhData || []);
      } catch (err) {
        triggerToast('Failed to connect to database schema.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setHolidaysLoading(true);
      const data = await hrService.getHolidays();
      setHolidays(data);
    } catch (err) {
      console.error("Failed to load holidays:", err);
    } finally {
      setHolidaysLoading(false);
    }
  };

  const handleAddHolidaySubmit = async (e) => {
    e.preventDefault();
    if (!newHoliday.name.trim() || !newHoliday.date) {
      triggerToast('Name and Date are required!', 'error');
      return;
    }
    setSubmittingHoliday(true);
    try {
      await hrService.addHoliday(newHoliday);
      triggerToast('Company holiday added successfully!');
      setNewHoliday({ name: '', date: '', description: '', isOptional: false });
      fetchHolidays();
    } catch (err) {
      triggerToast(err.message || 'Failed to add company holiday', 'error');
    } finally {
      setSubmittingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await hrService.deleteHoliday(id);
      triggerToast('Company holiday deleted successfully.');
      fetchHolidays();
    } catch (err) {
      triggerToast('Failed to delete company holiday.', 'error');
    }
  };

  const handleAction = async (id, name, action) => {
    try {
      // Optimistic state resolution
      setRequests(requests.filter(r => r.id !== id));
      triggerToast(
        action === 'approve' 
          ? `Approved leave request for ${name}` 
          : `Rejected leave request for ${name}`, 
        action === 'approve' ? 'success' : 'error'
      );
      
      // Async database persistence
      await DatabaseService.resolveLeaveRequest(id, action);
    } catch (err) {
      triggerToast('Failed to synchronize status with schema cache.', 'error');
    }
  };

  const handleResolveWFH = async (id, name, status) => {
    try {
      await hrService.resolveWFHRequest(id, status);
      triggerToast(`WFH request for ${name} has been ${status.toLowerCase()}d!`);
      const wfhData = await hrService.getWFHRequestsAll();
      setWfhRequests(wfhData || []);
    } catch (err) {
      triggerToast('Failed to resolve WFH request.', 'error');
    }
  };

  const handleAddNewPolicy = async () => {
    try {
      const demoPolicy = {
        name: 'Unpaid Sabbatical',
        desc: 'Exceptional Approvals',
        val: '30',
        unit: 'days cap'
      };
      const updated = await DatabaseService.addLeavePolicy(demoPolicy);
      setPolicies(updated);
      triggerToast('Sabbatical leave policy registered successfully!');
    } catch (err) {
      triggerToast('Error updating policy schemes.', 'error');
    }
  };

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingWFH = wfhRequests.filter(r => r.status === 'Pending');

  // Premium Shimmer Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Search bar skeleton */}
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full max-w-xl"></div>
        
        {/* Top metric row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl"></div>
          ))}
        </div>
        
        {/* Content split skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-48 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
            <div className="h-48 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
            <div className="h-48 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Search bar area matching screenshot exactly */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search approvals..." 
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white shadow-sm"
        />
      </div>

      {/* Premium Tab Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px gap-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'requests' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          Leave Requests & Policies
          {activeTab === 'requests' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'holidays' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Holiday Administration
          {activeTab === 'holidays' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('wfh')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'wfh' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          WFH Approvals
          {activeTab === 'wfh' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('apply-leave')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'apply-leave' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Apply Leave (Personal)
          {activeTab === 'apply-leave' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'apply-leave' ? (
        <EmployeeLeaves 
          leaveBalances={leaveBalances}
          leaveHistory={leaveHistory}
          applyLeave={(req) => applyLeave(req, triggerToast)}
          triggerToast={triggerToast}
        />
      ) : activeTab === 'requests' ? (
        <>
          {/* Top Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: In Office % */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border-l-4 border-indigo-650 dark:border-indigo-500 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Office %</span>
                <span className="text-2xl font-extrabold text-indigo-650 dark:text-indigo-400">84.2%</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: On Leave Today */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border-l-4 border-amber-500 dark:border-amber-600 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On Leave Today</span>
                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">12</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-550 dark:text-amber-400">
                <Plane className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Pending Requests */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border-l-4 border-rose-500 dark:border-rose-600 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Requests</span>
                <span className="text-2xl font-extrabold text-rose-500">{requests.length}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Main Grid Content Split */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Pending Requests (Spans 2 columns) */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Requests</h3>
                
                <div className="flex items-center gap-2">
                  <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-350 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition">
                    Filter
                  </button>
                  <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-350 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition">
                    Bulk Actions
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="bg-white dark:bg-slate-950 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">All requests resolved!</p>
                    <p className="text-xs text-slate-400">Great job keeping up with compliance schedules.</p>
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div 
                      key={req.id} 
                      className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition"
                    >
                      {/* Card Header details */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={req.avatar} alt={req.name} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{req.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{req.role}</p>
                          </div>
                        </div>

                        <span className={`self-start px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${req.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                          {req.type}
                        </span>
                      </div>

                      {/* Date details and days remaining status */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs font-semibold">
                        <div className="flex items-center gap-2 text-slate-650 dark:text-slate-350">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{req.dates}</span>
                        </div>

                        <div className={`flex items-center gap-1.5 ${req.isUrgent ? 'text-orange-600' : 'text-slate-500'}`}>
                          {req.isUrgent ? (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                          <span>{req.daysRemaining}</span>
                        </div>
                      </div>

                      {/* Quote block */}
                      <blockquote className="text-xs italic text-slate-550 dark:text-slate-400 font-medium pl-3 border-l-2 border-indigo-200 dark:border-indigo-900 leading-relaxed">
                        "{req.reason}"
                      </blockquote>

                      {/* Actions buttons footer */}
                      <div className="flex items-center gap-3 pt-2">
                        <button 
                          onClick={() => handleAction(req.id, req.name, 'approve')}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-sm hover:shadow"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, req.name, 'reject')}
                          className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 dark:border-slate-800 text-slate-650 dark:text-slate-300 rounded-xl text-xs font-extrabold transition"
                        >
                          Reject
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar Widgets Panel */}
            <div className="space-y-6">
              
              {/* Team Availability */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Team Availability</h3>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">{monthNames[viewMonth]} {viewYear}</span>
                    <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Mon-Sun Day header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>

                {/* Days Calendar grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  {teamAvailabilityDays.map((cell, idx) => {
                    if (cell.empty) {
                      return <span key={`empty-${idx}`} className="py-1"></span>;
                    }
                    if (cell.status === 'today') {
                      return <span key={idx} className="py-1 bg-indigo-600 text-white rounded-lg shadow-sm">{cell.day}</span>;
                    }
                    if (cell.status === 'pending') {
                      return <span key={idx} className="py-1 bg-indigo-50/60 text-indigo-650 border border-indigo-200/50 rounded-lg dark:bg-indigo-950/20">{cell.day}</span>;
                    }
                    if (cell.status === 'out') {
                      return <span key={idx} className="py-1 bg-orange-50/80 text-orange-600 border border-orange-200/40 rounded-lg dark:bg-orange-950/20">{cell.day}</span>;
                    }
                    return <span key={idx} className="py-1">{cell.day}</span>;
                  })}
                </div>

                {/* Legend indicators */}
                <div className="flex items-center gap-4 pt-2 border-t border-slate-50 dark:border-slate-900 justify-center text-[9px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    <span className="text-slate-450 uppercase tracking-wide">Today</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                    <span className="text-slate-450 uppercase tracking-wide">Out</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    <span className="text-slate-450 uppercase tracking-wide">Pending</span>
                  </div>
                </div>
              </div>

              {/* Leave Policies list */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 relative">
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Leave Policies</h3>

                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-800 dark:text-white leading-none">{policy.name}</h4>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-1">{policy.desc}</span>
                      </div>
                      <span className="text-xs font-extrabold text-indigo-650 dark:text-indigo-400">{policy.val} <span className="text-[10px] text-slate-450 font-semibold">{policy.unit}</span></span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => triggerToast('Opening policy configurator')}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Configure Policies
                </button>

                {/* Dynamic floating add policy button */}
                <button 
                  onClick={handleAddNewPolicy}
                  className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 transition"
                  title="Add New Policy"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Smart Insights sparks */}
              <div className="bg-indigo-50/40 border border-indigo-100/50 dark:bg-indigo-950/20 dark:border-indigo-900/40 p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <h4 className="text-[10px] font-extrabold text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">Smart Insights</h4>
                </div>
                <p className="text-[10px] text-indigo-850 dark:text-indigo-300 leading-relaxed font-semibold">
                  Based on historical data, leave requests spike by 15% in late October. Ensure your "Critical Project" blackout dates are updated.
                </p>
              </div>

            </div>

          </div>
        </>
      ) : activeTab === 'wfh' ? (
        /* Work From Home Approvals Tab Content */
        <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-50 dark:border-slate-900 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Work From Home (WFH) Approvals
              </h3>
              <p className="text-xs text-slate-400 mt-1">Review, audit and authorize remote work location schedules filed by employees across the organization</p>
            </div>
            <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full">{pendingWFH.length} Pending</span>
          </div>

          {pendingWFH.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1 opacity-80 mb-3 animate-bounce" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">WFH Approvals In Sync</h4>
              <p className="text-xs text-slate-450 mt-1">All employee WFH requests have been successfully audited and resolved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingWFH.map((req) => {
                const emp = req.employee || {};
                const name = emp.name || "Team Member";
                const role = emp.position || "Employee";
                return (
                  <div 
                    key={req._id} 
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl gap-6 hover:border-slate-200 dark:hover:border-slate-800 transition"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/10">
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{name}</h4>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                            {req.type || 'Full Day'} WFH
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic">
                          "{req.reason}"
                        </p>
                        <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                          <span>Role: {role}</span>
                          <span>•</span>
                          <span className="text-indigo-500">
                            Duration: {new Date(req.startDate).toLocaleDateString()} ➔ {new Date(req.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:items-center gap-3 shrink-0 self-end lg:self-center">
                      <button 
                        onClick={() => handleResolveWFH(req._id, name, 'Rejected')}
                        className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl transition flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleResolveWFH(req._id, name, 'Approved')}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition flex items-center gap-1 shadow-md shadow-violet-600/10"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve WFH
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Holiday Administration Tab Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-transition">
          {/* Scheduled Holidays Feed (2/3) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-900">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Scheduled Corporate Holidays
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Total: {holidays.length}</span>
            </div>

            {holidaysLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : holidays.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {holidays.map((h) => {
                  const dateObj = new Date(h.date);
                  const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const day = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
                  return (
                    <div key={h._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-[9px] font-extrabold p-2 rounded-xl text-center w-12 shrink-0 border border-rose-100 dark:border-rose-900/30">
                          <span className="block leading-none">{month}</span>
                          <span className="block text-sm font-extrabold leading-none mt-1">{day}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                            {h.name}
                            {h.isOptional && (
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Optional
                              </span>
                            )}
                          </h4>
                          {h.description && (
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{h.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHoliday(h._id)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-rose-500 transition"
                        title="Delete Holiday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-350 dark:text-slate-650" />
                <h4 className="text-xs font-bold text-slate-500">No scheduled holidays found</h4>
                <p className="text-[10px] text-slate-400 max-w-xs">Use the calendar scheduler on the right to populate the annual calendar.</p>
              </div>
            )}
          </div>

          {/* Add Holiday Scheduler (1/3) */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" />
              Schedule New Holiday
            </h3>

            <form onSubmit={handleAddHolidaySubmit} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">HOLIDAY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Christmas Day"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">DATE</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">DESCRIPTION</label>
                <textarea
                  placeholder="Describe the holiday or specify team coverage rules..."
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-200 transition">
                  <input
                    type="checkbox"
                    checked={newHoliday.isOptional}
                    onChange={(e) => setNewHoliday({ ...newHoliday, isOptional: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Optional / Restricted Holiday</span>
                    <span className="text-[9px] text-slate-400">Employees can selectively claim this day off</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submittingHoliday}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                {submittingHoliday ? 'Scheduling...' : 'Schedule Company Holiday'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
