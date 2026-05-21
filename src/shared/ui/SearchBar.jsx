import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by name, role, department, or keyword...',
  className = ''
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition"
        placeholder={placeholder}
      />
    </div>
  );
}
