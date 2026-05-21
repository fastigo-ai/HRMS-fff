import React from 'react';
import { FileText, Plus } from 'lucide-react';
import PageHeader from '../../shared/components/PageHeader';

export default function Reports({ triggerToast }) {
  const reportTemplates = [
    { name: 'Attendance Compliance Audit', desc: 'Detailed employee punch-in histories and geofence verification charts.' },
    { name: 'Budget Optimization Ledger', desc: 'Salary department benchmarks and direct reports overhead.' },
    { name: 'Staff Diversity Status Report', desc: 'Demographics statistics, contractor distributions, and FTE counts.' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Corporate Compliance Reports" 
        description="Verify compliance scores, extract audit spreadsheets, and view financial overhead."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTemplates.map((rep, idx) => (
          <div 
            key={idx} 
            className="p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-start justify-between gap-4 transition hover:shadow-xs"
          >
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{rep.name}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{rep.desc}</p>
            </div>
            <button 
              onClick={() => triggerToast(`Export initialized for ${rep.name} in background`)}
              className="p-2 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-xl transition"
              title="Download PDF"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
