import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const getBadgeColors = () => {
    const s = String(status).toLowerCase();
    
    // Active, Online, Approved, Completed, Healthy, Optimal
    if (['active', 'online', 'approved', 'completed', 'healthy', 'optimal', 'success'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
    }
    
    // Pending, WFH, Work From Home, In Progress, Active Development
    if (['pending', 'wfh', 'work from home', 'in progress', 'active', 'medium', 'review', 'qa', 'active development'].includes(s)) {
      return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
    }

    // Delayed, Rejected, Suspended, Off Leave, Overloaded, Alert, High, At Risk
    if (['rejected', 'delayed', 'off leave', 'suspended', 'overloaded', 'high', 'at risk', 'error', 'fail'].includes(s)) {
      return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40';
    }

    // Normal, Regular, Inactive, Future, Default
    return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-bold rounded-lg ${getBadgeColors()} ${className}`}>
      {status}
    </span>
  );
}
