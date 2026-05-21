import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/api';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function PMApprovals() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimesheets = async () => {
      try {
        const pmTimesheets = await DatabaseService.getManagerTimesheets();
        setTimesheets(pmTimesheets);
      } catch (err) {
        console.error('Failed to load pending timesheets:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTimesheets();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      const updated = await DatabaseService.resolveTimesheet(id, newStatus);
      setTimesheets(updated);
    } catch (err) {
      console.error('Failed to update timesheet log status:', err);
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

  return (
    <div className="space-y-6">
      
      {/* 3-Card Header row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Pending Approvals</span>
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
            <span className="text-xs font-semibold text-slate-400 block mb-1">Average Completion</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">94%</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Ledger */}
      <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Timesheet Approval Ledger</h3>
            <p className="text-xs text-slate-400">Review, audit and confirm timecards submitted by direct reports</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{pendingSheets.length} Pending Sheets</span>
        </div>

        {pendingSheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 text-emerald-500 stroke-1 opacity-80 mb-3" />
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
                
                {/* Details Bio */}
                <div className="flex gap-4 flex-1">
                  <div className="p-3 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-2xl h-fit shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{sheet.name}</h4>
                      <span className="text-[10px] text-slate-500 bg-slate-150 dark:bg-slate-900 px-2 py-0.5 rounded-lg">
                        {sheet.project}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {sheet.details}
                    </p>
                    <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                      <span>Period: {sheet.period}</span>
                      <span>•</span>
                      <span className="text-violet-500">Logged Time: {sheet.hours} Hours</span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex sm:items-center gap-3 shrink-0 self-end lg:self-center">
                  <button 
                    onClick={() => handleAction(sheet.id, 'Rejected')}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 rounded-xl transition flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction(sheet.id, 'Approved')}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition flex items-center gap-1 shadow-md shadow-violet-600/10"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Timecard
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* HR smart advisory warning banner */}
      <div className="p-5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-2xl space-y-2 flex items-start gap-3">
        <AlertCircle className="w-5.5 h-5.5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-violet-900 dark:text-violet-400 uppercase tracking-wider">Timesheet Compliance Check</h4>
          <p className="text-xs text-violet-750 dark:text-violet-500 leading-relaxed mt-1">
            Timesheet submissions are audited against clocked presence logs automatically. Manual override is restricted to direct line-managers.
          </p>
        </div>
      </div>

    </div>
  );
}
