import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No active entries recorded',
  description = 'Your database is currently clear. Add a new item or filter search criteria to view records.',
  icon: Icon = Inbox,
  actionText,
  onActionClick
}) {
  return (
    <div className="glass-panel p-8 bg-white dark:bg-slate-950/65 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-xs text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-6 animate-fade-in">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
        <Icon className="w-8 h-8" />
      </div>
      
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          {title}
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/10 hover:shadow-lg transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
