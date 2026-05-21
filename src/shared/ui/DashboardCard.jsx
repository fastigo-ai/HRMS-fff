import React from 'react';

export default function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  className = ''
}) {
  const getTrendStyles = () => {
    switch (trendType) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'negative':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400';
      default:
        return 'text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400';
    }
  };

  return (
    <div className={`glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${className}`}>
      <div className="space-y-1.5 flex-1 min-w-0">
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
          {title}
        </span>
        <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
          {value}
        </h4>
        {description && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex flex-col items-end gap-2 shrink-0">
        {Icon && (
          <div className="p-3 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl">
            <Icon className="w-5 h-5" />
          </div>
        )}
        {trend && (
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-transparent ${getTrendStyles()}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
