import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/api';
import { useUiStore } from '../../store/uiStore';
import { hrService } from '../../services/hrService';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function PMApprovals() {
  const [timesheets, setTimesheets] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [wfhRequests, setWfhRequests] = useState([]);
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timesheets');
  const { triggerToast } = useUiStore();

  const loadData = async () => {
    try {
      setLoading(true);
      const pmTimesheets = await DatabaseService.getManagerTimesheets();
      setTimesheets(pmTimesheets);
      
      const leavesData = await DatabaseService.getHRLeaves();
      setLeaves(leavesData.requests || []);

      const wfhData = await hrService.getWFHRequestsAll();
      setWfhRequests(wfhData || []);

      const otData = await hrService.getOvertimeRequestsAll();
      setOvertimeRequests(otData || []);

      const regData = await hrService.getRegularizationsAll();
      setRegularizations(regData || []);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      const updated = await DatabaseService.resolveTimesheet(id, newStatus);
      setTimesheets(updated);
      triggerToast(`Timesheet has been successfully ${newStatus.toLowerCase()}ed.`);
    } catch (err) {
      console.error('Failed to update timesheet log status:', err);
      triggerToast('Failed to resolve timesheet.', 'error');
    }
  };

  const handleLeaveAction = async (id, name, action) => {
    try {
      setLeaves(prev => prev.filter(r => r.id !== id));
      triggerToast(
        action === 'approve' 
          ? `Approved leave request for ${name}` 
          : `Rejected leave request for ${name}`, 
        action === 'approve' ? 'success' : 'error'
      );
      await DatabaseService.resolveLeaveRequest(id, action);
    } catch (err) {
      triggerToast('Failed to resolve leave request.', 'error');
    }
  };

  const handleResolveWFH = async (id, name, status) => {
    try {
      await hrService.resolveWFHRequest(id, status);
      triggerToast(`WFH request for ${name} has been ${status.toLowerCase()}d!`);
      // Reload WFH
      const wfhData = await hrService.getWFHRequestsAll();
      setWfhRequests(wfhData || []);
    } catch (err) {
      triggerToast('Failed to resolve WFH request.', 'error');
    }
  };

  const handleResolveOvertime = async (id, name, status) => {
    try {
      await hrService.resolveOvertimeRequest(id, status);
      triggerToast(`Overtime request for ${name} has been ${status.toLowerCase()}d!`);
      // Reload Overtime
      const otData = await hrService.getOvertimeRequestsAll();
      setOvertimeRequests(otData || []);
    } catch (err) {
      triggerToast('Failed to resolve Overtime request.', 'error');
    }
  };

  const handleResolveRegularization = async (id, name, status) => {
    try {
      await hrService.resolveRegularization(id, status);
      triggerToast(`Regularization request for ${name} has been ${status.toLowerCase()}d!`);
      // Reload Regularizations
      const regData = await hrService.getRegularizationsAll();
      setRegularizations(regData || []);
    } catch (err) {
      triggerToast('Failed to resolve Regularization request.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  const pendingSheets = timesheets.filter(t => t.status === 'Pending');
  const totalApprovedHours = timesheets
    .filter(t => t.status === 'Approved')
    .reduce((sum, curr) => sum + curr.hours, 0);

  const pendingWFH = wfhRequests.filter(r => r.status === 'Pending');
  const pendingOvertime = overtimeRequests.filter(r => r.status === 'Pending');
  const pendingRegularization = regularizations.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-6">
      
      {/* 3-Card Header row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Pending Timesheets</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{pendingSheets.length}</h3>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Approved Team Hours</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{totalApprovedHours} hrs</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Pending Leaves & WFH</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
              {leaves.length + pendingWFH.length}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tab Navigation selectors */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl flex-wrap text-xs font-semibold w-full">
        <button
          onClick={() => setActiveTab('timesheets')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'timesheets'
              ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800 font-extrabold'
              : 'text-slate-450 hover:text-slate-700'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 shrink-0" />
          Timesheets ({pendingSheets.length})
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'leaves'
              ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800 font-extrabold'
              : 'text-slate-450 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4 shrink-0" />
          Leaves ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('wfh')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'wfh'
              ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800 font-extrabold'
              : 'text-slate-455 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          WFH ({pendingWFH.length})
        </button>
        <button
          onClick={() => setActiveTab('overtime')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'overtime'
              ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800 font-extrabold'
              : 'text-slate-455 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          Overtime ({pendingOvertime.length})
        </button>
        <button
          onClick={() => setActiveTab('regularization')}
          className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'regularization'
              ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800 font-extrabold'
              : 'text-slate-455 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          Regularize ({pendingRegularization.length})
        </button>
      </div>

      {/* Main Ledger */}
      <div className="glass-panel p-6 bg-white dark:bg-slate-955 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
        
        {/* TIMESHEETS TAB */}
        {activeTab === 'timesheets' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Timesheet Approval Ledger</h3>
                <p className="text-xs text-slate-400">Review, audit and confirm timecards submitted by direct reports</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{pendingSheets.length} Pending Sheets</span>
            </div>

            {pendingSheets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1 opacity-80 mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Approvals In Sync</h4>
                <p className="text-xs text-slate-450 mt-1">All direct reports timesheets have been successfully audited and finalized.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingSheets.map((sheet) => (
                  <div 
                    key={sheet.id} 
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl gap-6 hover:border-slate-200 dark:hover:border-slate-800 transition"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="p-3 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-2xl h-fit shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{sheet.name}</h4>
                          <span className="text-[10px] text-slate-500 bg-slate-150 dark:bg-slate-900 px-2 py-0.5 rounded-lg font-bold">
                            {sheet.project}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                          {sheet.details}
                        </p>
                        <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                          <span>Period: {sheet.period}</span>
                          <span>•</span>
                          <span className="text-violet-500 font-extrabold">Logged Time: {sheet.hours} Hours</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:items-center gap-3 shrink-0 self-end lg:self-center">
                      <button 
                        onClick={() => handleAction(sheet.id, 'Rejected')}
                        className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl transition flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleAction(sheet.id, 'Approved')}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition flex items-center gap-1 shadow-md shadow-violet-600/10"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Timecard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* LEAVES TAB */}
        {activeTab === 'leaves' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Leave Approvals Ledger</h3>
                <p className="text-xs text-slate-400">Review, audit and authorize leave applications submitted by employees</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{leaves.length} Pending Leaves</span>
            </div>

            {leaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1 opacity-80 mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Leave Approvals In Sync</h4>
                <p className="text-xs text-slate-450 mt-1">All employee leave requests have been successfully audited and resolved.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {leaves.map((req) => (
                  <div 
                    key={req.id} 
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl gap-6 hover:border-slate-200 dark:hover:border-slate-800 transition"
                  >
                    <div className="flex gap-4 flex-1">
                      <img src={req.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64&h=64'} alt={req.name} className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-violet-500/10" />
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{req.name}</h4>
                          <span className={`text-[10px] font-extrabold uppercase tracking-wide border px-2 py-0.5 rounded-lg ${req.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                            {req.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                          "{req.reason}"
                        </p>
                        <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                          <span>Period: {req.dates}</span>
                          <span>•</span>
                          <span className={req.isUrgent ? 'text-orange-500 font-extrabold' : 'text-slate-400 font-semibold'}>{req.daysRemaining}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:items-center gap-3 shrink-0 self-end lg:self-center">
                      <button 
                        onClick={() => handleLeaveAction(req.id, req.name, 'reject')}
                        className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl transition flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleLeaveAction(req.id, req.name, 'approve')}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition flex items-center gap-1 shadow-md shadow-violet-600/10"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve Leave
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* WORK FROM HOME TAB */}
        {activeTab === 'wfh' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Work From Home (WFH) Approvals Ledger</h3>
                <p className="text-xs text-slate-400">Review, audit and authorize remote work location schedules filed by team members</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{pendingWFH.length} Pending Requests</span>
            </div>

            {pendingWFH.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1 opacity-80 mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">WFH Approvals In Sync</h4>
                <p className="text-xs text-slate-450 mt-1">All employee WFH regional requests have been resolved.</p>
              </div>
            ) : (
              <div className="space-y-6">
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
          </>
        )}

        {/* OVERTIME TAB */}
        {activeTab === 'overtime' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Overtime (OT) Approvals Ledger</h3>
                <p className="text-xs text-slate-400">Review, audit and authorize additional working hours logged by team members</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{pendingOvertime.length} Pending Hours</span>
            </div>

            {pendingOvertime.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1 opacity-80 mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Overtime Approvals In Sync</h4>
                <p className="text-xs text-slate-450 mt-1">All employee overtime hours have been resolved.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingOvertime.map((req) => {
                  const emp = req.employee || {};
                  const name = emp.name || "Team Member";
                  const role = emp.position || "Employee";
                  return (
                    <div 
                      key={req._id} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl gap-6 hover:border-slate-200 dark:hover:border-slate-800 transition"
                    >
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/10">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{name}</h4>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              ⚡ {req.hours} Hours OT
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic">
                            "{req.reason}"
                          </p>
                          <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                            <span>Role: {role}</span>
                            <span>•</span>
                            <span className="text-indigo-500">
                              Overtime Date: {new Date(req.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:items-center gap-3 shrink-0 self-end lg:self-center">
                        <button 
                          onClick={() => handleResolveOvertime(req._id, name, 'Rejected')}
                          className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl transition flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button 
                          onClick={() => handleResolveOvertime(req._id, name, 'Approved')}
                          className="px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition flex items-center gap-1 shadow-md shadow-violet-600/10"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve OT
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* REGULARIZATION TAB */}
        {activeTab === 'regularization' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Regularization Ledger</h3>
                <p className="text-xs text-slate-400">Review, audit and authorize requests to overwrite wrong or missing attendance timesheet entries in MongoDB</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{pendingRegularization.length} Pending Sheets</span>
            </div>

            {pendingRegularization.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1 opacity-80 mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Regularization in Sync</h4>
                <p className="text-xs text-slate-450 mt-1">All employee regularization override requests have been resolved.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingRegularization.map((req) => {
                  const emp = req.employee || {};
                  const name = emp.name || "Team Member";
                  const role = emp.position || "Employee";
                  return (
                    <div 
                      key={req._id} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl gap-6 hover:border-slate-200 dark:hover:border-slate-800 transition"
                    >
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-sm shrink-0 border border-violet-500/10">
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{name}</h4>
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                              Override Request
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic">
                            "Reason: {req.reason}"
                          </p>
                          <div className="flex gap-4 text-[10px] text-slate-400 font-bold items-center">
                            <span>Date: {new Date(req.attendanceDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-violet-500 font-extrabold flex items-center gap-1.5">
                              Change to: {req.requestedCheckIn} <ArrowRight className="w-3 h-3 text-slate-400 inline" /> {req.requestedCheckOut}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:items-center gap-3 shrink-0 self-end lg:self-center">
                        <button 
                          onClick={() => handleResolveRegularization(req._id, name, 'Rejected')}
                          className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl transition flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button 
                          onClick={() => handleResolveRegularization(req._id, name, 'Approved')}
                          className="px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition flex items-center gap-1 shadow-md shadow-violet-600/10"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve Override
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>

      {/* Compliance check Advisory banner */}
      <div className="p-5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-2xl space-y-2 flex items-start gap-3">
        <AlertCircle className="w-5.5 h-5.5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-violet-900 dark:text-violet-400 uppercase tracking-wider">Compliance Check & Sync</h4>
          <p className="text-xs text-violet-750 dark:text-violet-500 leading-relaxed mt-1">
            Approvals and leave decisions are updated dynamically across organizational roles. Decisions taken by either the Manager or HR are synchronized in real-time.
          </p>
        </div>
      </div>

    </div>
  );
}
