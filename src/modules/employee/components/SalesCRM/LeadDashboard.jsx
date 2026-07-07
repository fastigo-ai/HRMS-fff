import React from 'react';
import { TrendingUp, Target, Users, AlertCircle, PhoneCall, BarChart2 } from 'lucide-react';

export default function LeadDashboard({ metrics, followUpsToday, analytics }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: metrics.total, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/40' },
          { label: 'New Leads', value: metrics.new, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
          { label: 'Lead Velocity (30d)', value: `${analytics?.velocity || 0}/day`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
          { label: 'Avg Conversion', value: `${analytics?.avgConversionTimeDays || 0}d`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-md transition">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{m.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
              <m.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conversion Rate Trend</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">Avg {metrics.conversionRate}%</span>
          </div>
          <div className="relative w-full h-48">
            {/* Mock Chart */}
            <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <path d="M 0 180 C 200 150, 400 190, 600 100 C 800 50, 900 80, 1000 40 L 1000 200 L 0 200 Z" fill="#4f46e5" fillOpacity="0.1" />
              <path d="M 0 180 C 200 150, 400 190, 600 100 C 800 50, 900 80, 1000 40" fill="none" stroke="#4f46e5" strokeWidth="4" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <PhoneCall className="w-4 h-4 text-amber-500" /> Today's Follow-ups
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {followUpsToday.length > 0 ? followUpsToday.map((task, idx) => (
              <div key={idx} className="flex gap-3 items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{task.clientName}</h4>
                  <p className="text-[10px] text-slate-400">{task.time}</p>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">No follow-ups today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
