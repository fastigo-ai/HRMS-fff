import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/api';
import {
  Layers,
  Users,
  Clock,
  Flame,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function PMDashboard({ setCurrentTab }) {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await DatabaseService.getManagerDashboardStats();
        setStats(dashboardStats);
        const managedProjects = await DatabaseService.getManagerProjects();
        setProjects(managedProjects);
        const directTeam = await DatabaseService.getManagerTeam();
        setTeam(directTeam);
      } catch (err) {
        console.error('Failed to load PM dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
          <div className="h-60 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 4-Card Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Projects */}
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Active Projects</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.activeProjects}</h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg mt-2 inline-flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Healthy
            </span>
          </div>
          <div className="p-3.5 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Team Utilization */}
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Team Utilization</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.teamUtilization}%</h3>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg mt-2 inline-flex">
              Optimal Cap.
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Pending Timesheets</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.pendingApprovals}</h3>
            <button 
              onClick={() => setCurrentTab('pm-approvals')}
              className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg mt-2 inline-flex items-center gap-0.5 hover:bg-rose-100 transition"
            >
              Action Required <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Sprint Velocity */}
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-1">Sprint Progress</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.sprintProgress}%</h3>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg mt-2 inline-flex items-center gap-0.5">
              4 Days Left
            </span>
          </div>
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Dynamic Sprint Velocity Spline Chart */}
      <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Sprint Velocity</h3>
            <p className="text-xs text-slate-400">Current progress velocity vs. target milestones</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-violet-500">
              <span className="w-2.5 h-2.5 bg-violet-500 rounded-full"></span> Completed Points
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 dark:text-slate-700">
              <span className="w-2.5 h-2.5 bg-slate-350 dark:bg-slate-750 rounded-full"></span> Sprint Target
            </span>
          </div>
        </div>

        <div className="relative w-full h-64">
          <svg className="w-full h-full" viewBox="0 0 1000 250" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="6" className="dark:stroke-slate-900" />
            <line x1="0" y1="125" x2="1000" y2="125" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="6" className="dark:stroke-slate-900" />
            <line x1="0" y1="200" x2="1000" y2="200" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="6" className="dark:stroke-slate-900" />

            {/* Target line */}
            <line x1="0" y1="200" x2="1000" y2="40" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4 4" className="dark:stroke-slate-800" />

            {/* Shaded Area */}
            <path 
              d="M 0 200 C 150 190, 250 140, 400 130 C 550 120, 650 70, 800 65 C 900 62, 1000 60, 1000 60 L 1000 250 L 0 250 Z" 
              fill="url(#chartGlow)"
            />

            {/* Spline Wave */}
            <path 
              d="M 0 200 C 150 190, 250 140, 400 130 C 550 120, 650 70, 800 65 C 900 62, 1000 60, 1000 60" 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="4" 
              strokeLinecap="round" 
            />

            {/* Bullet Markers */}
            <circle cx="400" cy="130" r="6" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-950" />
            <circle cx="800" cy="65" r="6" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" className="dark:stroke-slate-950" />
          </svg>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
            <span>Sprint Start</span>
            <span>Day 3</span>
            <span>Day 6</span>
            <span>Day 9</span>
            <span>Sprint End</span>
          </div>
        </div>
      </div>

      {/* Bottom split: Team Status & Project Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Team Availability Status */}
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Team Member Status</h3>
              <p className="text-xs text-slate-400">Direct reports availability beacon</p>
            </div>
            <button 
              onClick={() => setCurrentTab('pm-team')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              Manage Allocation
            </button>
          </div>

          <div className="space-y-4">
            {team.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-950 ${
                      member.status === 'Active' ? 'bg-emerald-500' :
                      member.status === 'WFH' ? 'bg-amber-500' : 'bg-slate-400'
                    }`}></span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{member.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">{member.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">{member.allocation}% Alloc.</span>
                  <span className="text-[10px] text-violet-500 font-bold block mt-1">{member.activeProject}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Health Ledger */}
        <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Managed Projects Health</h3>
              <p className="text-xs text-slate-400">Budget, progress and execution status</p>
            </div>
            <button 
              onClick={() => setCurrentTab('pm-milestones')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              View Roadmap
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{project.name}</h4>
                    <span className="text-[10px] text-slate-400">{project.dept} • {project.teamSize} Headcount</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                    project.health === 'Healthy' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' :
                    project.health === 'Completed' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' :
                    'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                  }`}>
                    {project.health}
                  </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.health === 'Healthy' ? 'bg-emerald-500' :
                        project.health === 'Completed' ? 'bg-indigo-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
