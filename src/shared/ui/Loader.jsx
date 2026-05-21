import React from 'react';

export default function Loader({ 
  fullscreen = false, 
  size = 'md', // 'sm' | 'md' | 'lg'
  text = 'Syncing system configurations...' 
}) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 border-2';
      case 'lg': return 'w-12 h-12 border-4';
      default: return 'w-9 h-9 border-3';
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 animate-fade-in text-center">
      <span className={`rounded-full border-violet-600 border-t-transparent animate-spin ${getSizeClass()}`}></span>
      {text && (
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
          {text}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-900 bg-opacity-90 dark:bg-opacity-90">
        {content}
      </div>
    );
  }

  return content;
}
