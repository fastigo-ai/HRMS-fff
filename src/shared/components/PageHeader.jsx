import React from 'react';

export default function PageHeader({
  title,
  description,
  action, // Optional JSX for right-aligned items
  className = ''
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}>
      <div className="space-y-0.5">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="flex items-center gap-3 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
