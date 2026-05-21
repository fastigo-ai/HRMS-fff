import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/api';
import {
  Users,
  AlertTriangle,
  Sliders,
  CheckCircle,
  HelpCircle,
  BarChart,
  UserPlus
} from 'lucide-react';

export default function PMTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const directTeam = await DatabaseService.getManagerTeam();
        setTeam(directTeam);
      } catch (err) {
        console.error('Failed to load direct report models:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, []);

  const handleAllocationChange = async (empId, newAlloc) => {
    setUpdatingId(empId);
    try {
      const updated = await DatabaseService.reallocateResource(empId, newAlloc);
      setTeam(updated);
    } catch (err) {
      console.error('Reallocation transaction failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getCapacityStatus = (val) => {
    if (val < 50) return { label: 'Under-utilized', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40' };
    if (val <= 85) return { label: 'Optimal Alloc', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40' };
    return { label: 'Overloaded', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40' };
  };

  const getAverageUtilization = () => {
    if (team.length === 0) return 0;
    return Math.round(team.reduce((acc, curr) => acc + curr.allocation, 0) / team.length);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  const averageUtil = getAverageUtilization();
  const overloadedCount = team.filter(m => m.allocation > 85).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Direct Report List */}
      <div className="lg:col-span-2 space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Team Allocations</h3>
            <p className="text-xs text-slate-400">Balance direct report bandwidth and assign focus</p>
          </div>
          <button className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-violet-600/10">
            <UserPlus className="w-4 h-4" /> Request FTE Support
          </button>
        </div>

        <div className="space-y-4">
          {team.map((member) => {
            const cap = getCapacityStatus(member.allocation);
            return (
              <div key={member.id} className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-6 relative overflow-hidden">
                {updatingId === member.id && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 z-10 flex items-center justify-center backdrop-blur-xs">
                    <span className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Bio details */}
                  <div className="flex gap-4">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-12 h-12 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-850"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{member.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg ${cap.color}`}>
                          {cap.label}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-violet-500 mt-1">{member.role} • {member.activeProject}</p>
                    </div>
                  </div>

                  {/* Right Completion KPI */}
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Sprint Completion Rate</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-350">{member.completionRate}% Done</span>
                  </div>

                </div>

                {/* Range Slider for reallocating developer focus */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-900">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Sliders className="w-4 h-4 text-violet-500" /> Allocation Target</span>
                    <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">{member.allocation}% Bandwidth</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={member.allocation} 
                    onChange={(e) => handleAllocationChange(member.id, e.target.value)}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600 focus:outline-none"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>10% (Bench)</span>
                    <span>50% (Part-time)</span>
                    <span>100% (Maximum Cap)</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {member.skills.map((skill, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Sidebar Analytics */}
      <div className="space-y-6">
        
        {/* Overall Utilization Card */}
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bandwidth Summary</h3>
            <p className="text-xs text-slate-400">Direct reports allocation indices</p>
          </div>

          {/* Utilization Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Avg. Team Utilization</span>
              <span className="text-violet-600 dark:text-violet-400">{averageUtil}%</span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${averageUtil}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-900">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-center border border-slate-100 dark:border-slate-900">
              <span className="text-xs text-slate-400 block mb-1">Direct Reports</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{team.length}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-center border border-slate-100 dark:border-slate-900">
              <span className="text-xs text-slate-400 block mb-1">Overloaded</span>
              <span className="text-lg font-extrabold text-rose-500">{overloadedCount}</span>
            </div>
          </div>
        </div>

        {/* Warning Indicator Alert Card */}
        {overloadedCount > 0 && (
          <div className="p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl space-y-3 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-rose-800 dark:text-rose-400 leading-none">Overload Warning</h4>
              <p className="text-xs text-rose-650 dark:text-rose-500/80 mt-2 leading-relaxed">
                {overloadedCount} team {overloadedCount === 1 ? 'member is' : 'members are'} assigned above **85% capacity**. Under-allocations in other roles could be rebalanced.
              </p>
            </div>
          </div>
        )}

        {/* Help Tip card */}
        <div className="p-5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-2xl space-y-3">
          <HelpCircle className="w-5 h-5 text-violet-500" />
          <h4 className="text-xs font-bold text-violet-950 dark:text-violet-400 uppercase tracking-wider">Hiring Advisory</h4>
          <p className="text-xs text-violet-750 dark:text-violet-500 leading-relaxed">
            Maintaining a **70-80% utilization rate** yields optimal velocity while preventing engineering burnouts. Adjust sliders to allocate part-time focus.
          </p>
        </div>

      </div>

    </div>
  );
}
