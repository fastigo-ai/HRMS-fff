import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from './router';
import { useUiStore } from '../store/uiStore';

export default function AppProviders() {
  const { initTheme, toast } = useUiStore();

  // Sync color preferences once
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <>
      <RouterProvider router={appRouter} />
      
      {/* Dynamic Global Toast Overlay */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white dark:bg-white dark:text-slate-950 border border-slate-800 dark:border-slate-100 rounded-2xl shadow-xl text-xs font-black animate-scale-up uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping"></span>
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}
