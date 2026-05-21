import React from 'react';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  emptyMessage = 'No matching data records found.',
  loading = false,
  className = ''
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <span className="w-9 h-9 rounded-full border-3 border-violet-600 border-t-transparent animate-spin"></span>
        <span className="text-xs font-bold text-slate-400">Syncing database registers...</span>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto w-full border border-slate-100 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-950/65 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-550 uppercase tracking-widest text-[9px] font-extrabold select-none">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-5 py-4 ${col.className || ''}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-xs font-medium text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors text-xs text-slate-700 dark:text-slate-200 ${
                  onRowClick ? 'hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer' : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/20'
                }`}
              >
                {columns.map((col, idx) => {
                  const cellValue = row[col.field];
                  return (
                    <td key={idx} className={`px-5 py-3.5 align-middle ${col.className || ''}`}>
                      {col.render ? col.render(cellValue, row) : cellValue}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
