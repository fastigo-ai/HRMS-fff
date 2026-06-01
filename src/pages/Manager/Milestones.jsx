import React from 'react';
import {
  Milestone,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function PMMilestones() {
  
  const roadmapData = [
    {
      id: 'r1',
      project: 'Fastigo X Core Refactor',
      dept: 'Engineering',
      phases: [
        { name: 'Database API Migration', status: 'Completed', date: 'Oct 10', duration: 'w-1/4 bg-emerald-500' },
        { name: 'Route Desegregation', status: 'Active', date: 'Oct 30', duration: 'w-1/3 bg-violet-600' },
        { name: 'PM Panel Integration', status: 'Active', date: 'Nov 12', duration: 'w-1/4 bg-violet-600' },
        { name: 'Vite Production Vault Lock', status: 'Future', date: 'Dec 15', duration: 'w-1/5 bg-slate-200 dark:bg-slate-800' }
      ]
    },
    {
      id: 'r2',
      project: 'AI Recruitment Integration',
      dept: 'Product Engineering',
      phases: [
        { name: 'Model Token Handshake', status: 'Completed', date: 'Sep 24', duration: 'w-1/4 bg-emerald-500' },
        { name: 'Kanban Stage Synchronization', status: 'Completed', date: 'Oct 15', duration: 'w-1/4 bg-emerald-500' },
        { name: 'Sourcing Channels API Sync', status: 'Delayed', date: 'Dec 01', duration: 'w-1/3 bg-amber-500' }
      ]
    },
    {
      id: 'r3',
      project: 'Global Payroll Vault',
      dept: 'Security & Compliance',
      phases: [
        { name: 'Cryptographic Salt Specs', status: 'Completed', date: 'Oct 05', duration: 'w-1/3 bg-emerald-500' },
        { name: 'Tax Withholding Cache', status: 'Active', date: 'Nov 20', duration: 'w-1/3 bg-violet-600' },
        { name: 'Vault Security Handshake', status: 'Future', date: 'Jan 10', duration: 'w-1/3 bg-slate-200 dark:bg-slate-800' }
      ]
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-100 dark:border-emerald-900/40';
      case 'Active': return 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 border-violet-100 dark:border-violet-900/40';
      case 'Delayed': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-100 dark:border-rose-900/40';
      default: return 'bg-slate-100 dark:bg-slate-900 text-slate-450 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Milestone Gantt Roadmap</h3>
          <p className="text-xs text-slate-400">Quarterly project phase allocations and critical path markers</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 text-xs font-bold rounded-xl border border-violet-100 dark:border-violet-900/40">
          <TrendingUp className="w-4 h-4" /> 8 Phases On Track
        </div>
      </div>

      {/* Gantt Timeline Board */}
      <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-8">
        
        {/* Timeline Header Quarters */}
        <div className="grid grid-cols-4 text-center border-b border-slate-100 dark:border-slate-900 pb-3 text-xs font-bold text-slate-400">
          <span>Phase 1 (Kickoff)</span>
          <span>Phase 2 (Development)</span>
          <span>Phase 3 (Testing & QA)</span>
          <span>Phase 4 (Deployment)</span>
        </div>

        {/* Project Roadmaps */}
        <div className="space-y-8">
          {roadmapData.map((road) => (
            <div key={road.id} className="space-y-4">
              
              {/* Project Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{road.project}</h4>
                  <span className="text-[10px] text-slate-400">{road.dept}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-violet-500" /> Sprints 12-16
                  </span>
                </div>
              </div>

              {/* Gantt Horizontal Bars */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl">
                
                {/* Horizontal tracks */}
                <div className="flex items-center gap-1 w-full h-8 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-slate-200 dark:border-slate-900">
                  {road.phases.map((phase, idx) => (
                    <div 
                      key={idx} 
                      className={`h-full rounded-lg ${phase.duration} opacity-90 transition-all duration-300 relative group cursor-pointer`}
                      title={`${phase.name}: ${phase.status} (${phase.date})`}
                    >
                      {/* Pulse indicators on active blocks */}
                      {phase.status === 'Active' && (
                        <span className="absolute right-1 top-1 w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend list of milestones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                  {road.phases.map((phase, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl space-y-1.5 hover:shadow-xs transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-lg ${getStatusBadge(phase.status)}`}>
                          {phase.status}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" /> {phase.date}
                        </span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                        {phase.name}
                      </h5>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Gantt advisory note */}
      <div className="p-5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5.5 h-5.5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-violet-900 dark:text-violet-400 uppercase tracking-wider">Critical Path Alert</h4>
          <p className="text-xs text-violet-750 dark:text-violet-500 leading-relaxed mt-1">
            The **AI Recruitment Integration** phase is currently delayed due to Sourcing Channel API handshakes. Resources can be reallocated using the Team slider view.
          </p>
        </div>
      </div>

    </div>
  );
}
