import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-2 py-4 border-t border-slate-100 dark:border-slate-850 mt-4 ${className}`}>
      <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider">
        Page {currentPage} of {totalPages}
      </span>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 dark:text-slate-450 transition"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 disabled:hover:bg-transparent text-slate-500 dark:text-slate-450 transition"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
