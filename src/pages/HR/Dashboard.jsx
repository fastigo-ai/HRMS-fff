import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Umbrella,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  IndianRupee,
  TrendingUp,
  Plus,
  HelpCircle,
  FileText,
  UserPlus,
  BookOpen,
  PieChart
} from 'lucide-react';
import { DatabaseService } from '../../services/api';

export default function HRDashboard({
  setCurrentTab,
  triggerToast
}) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getHRDashboardStats();
        setStatsData(data);
      } catch (err) {
        triggerToast('Failed to load database overview statistics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
          <div className="h-72 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'TOTAL EMPLOYEES', value: statsData.totalEmployees.toLocaleString(), change: '+2.4%', color: 'indigo' },
    { label: 'ACTIVE', value: statsData.activeToday.toLocaleString(), change: null, color: 'emerald', dot: true },
    { label: 'ON LEAVE TODAY', value: statsData.onLeaveToday, color: 'rose', icon: Umbrella },
    { label: 'PRESENT TODAY', value: statsData.presentToday, suffix: '96.4%', color: 'sky' },
    { label: 'PENDING LEAVES', value: statsData.pendingLeaves, color: 'amber', dot: true, dotColor: 'bg-indigo-650' },
    { label: 'OPEN POSITIONS', value: statsData.openPositions, color: 'indigo', icon: Briefcase },
    { label: 'MONTHLY PAYROLL', value: statsData.monthlyPayroll, color: 'emerald', icon: IndianRupee }
  ];

  const recentActivities = [
    { id: 1, action: 'Leave approved for Marcus Thorne', dept: 'Engineering', time: '2 mins ago', status: 'Completed', icon: CheckCircle, iconColor: 'text-indigo-650 bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 2, action: 'New hire onboarding: Elena Rodriguez', dept: 'Marketing', time: '1 hour ago', status: 'In Progress', icon: UserPlus, iconColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { id: 3, action: 'Payroll batch #882 generated', dept: 'Finance', time: '3 hours ago', status: 'Completed', icon: FileText, iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 4, action: 'Policy update pending review', dept: 'HR Legal', time: '5 hours ago', status: 'Pending', icon: AlertCircle, iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  ];

  const holidays = [
    { date: 'OCT 31', name: 'Halloween Mixer', desc: 'Internal Team Event' },
    { date: 'NOV 11', name: 'Veterans Day', desc: 'Public Holiday' },
    { date: 'NOV 23', name: 'Thanksgiving', desc: 'Public Holiday' }
  ];

  const svgWidth = 600;
  const svgHeight = 160;

  return (
    <div className="space-y-6">
      
      {/* Overview Heading details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Welcome back. Here's what's happening at WorkSphere today.</p>
        </div>
        
        {/* Date block */}
        <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 dark:text-slate-350 dark:bg-slate-950 dark:border-slate-800 rounded-xl shadow-sm">
          <span>📅 Monday, Oct 23, 2023</span>
        </div>
      </div>

      {/* Metrics Row (7 Small cards matching Screenshot 1 exactly) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-2 hover:border-indigo-100 dark:hover:border-indigo-950 transition">
              
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                  {stat.label}
                </span>
                {stat.dot && (
                  <span className={`w-2 h-2 rounded-full ${stat.dotColor || 'bg-emerald-500'}`}></span>
                )}
                {IconComponent && (
                  <IconComponent className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
                )}
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-base font-extrabold text-slate-800 dark:text-white">
                  {stat.value}
                </span>
                
                {stat.change && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20">
                    {stat.change}
                  </span>
                )}
                {stat.suffix && (
                  <span className="text-[9px] font-bold text-slate-455 text-slate-400">
                    {stat.suffix}
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Trends & Growth Graph Card (Left column, 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
          
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Attendance Trends & Growth</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Aggregated data across all departments (Last 6 months)</p>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                <span className="text-slate-600 dark:text-slate-455">Attendance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-200 inline-block"></span>
                <span className="text-slate-600 dark:text-slate-455">Growth</span>
              </div>
            </div>
          </div>

          {/* SVG line wave charts matching Screenshot 1 */}
          <div className="relative pt-6">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible"
            >
              <line x1="0" y1="120" x2={svgWidth} y2="120" stroke="#f1f5f9" className="dark:stroke-slate-900" strokeWidth="1" />
              <line x1="0" y1="70" x2={svgWidth} y2="70" stroke="#f1f5f9" className="dark:stroke-slate-900" strokeWidth="1" />
              <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#f1f5f9" className="dark:stroke-slate-900" strokeWidth="1" />

              <path 
                d="M 10 120 C 100 120, 150 70, 230 90 C 310 110, 395 30, 480 85 C 530 110, 560 60, 590 60 L 590 120 L 10 120 Z" 
                fill="url(#attendanceGrad)" 
                opacity="0.06"
              />

              <path 
                d="M 10 90 C 100 90, 150 70, 230 90 C 310 110, 395 70, 480 75 C 530 80, 560 110, 590 80" 
                fill="none" 
                stroke="#4f46e5" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              <path 
                d="M 10 70 C 110 70, 180 100, 260 80 C 340 60, 420 90, 500 80 C 540 75, 570 95, 590 70" 
                fill="none" 
                stroke="#c7d2fe" 
                strokeWidth="1.5" 
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1.5 pt-3">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>

        </div>

        {/* Quick Actions (Right column, 1/3) */}
        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-600/10 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-extrabold">Quick Actions</h3>
            <p className="text-[11px] text-indigo-150 leading-relaxed mt-1">Accelerate core administrative workflows instantly.</p>
          </div>

          <div className="space-y-3">
            
            <button 
              onClick={() => { triggerToast('Employee Wizard started.'); }}
              className="w-full flex items-center justify-between px-4 py-3 bg-indigo-700/60 hover:bg-indigo-700 rounded-2xl text-xs font-bold transition"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-4 h-4 text-indigo-300" />
                <span>Add New Employee</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-indigo-300" />
            </button>

            <button 
              onClick={() => triggerToast('Generating direct monthly payroll records')}
              className="w-full flex items-center justify-between px-4 py-3 bg-indigo-700/60 hover:bg-indigo-700 rounded-2xl text-xs font-bold transition"
            >
              <div className="flex items-center gap-2.5">
                <IndianRupee className="w-4 h-4 text-indigo-300" />
                <span>Generate Monthly Payroll</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-indigo-300" />
            </button>

            <button 
              onClick={() => triggerToast('Exporting quarterly payroll summary')}
              className="w-full flex items-center justify-between px-4 py-3 bg-indigo-700/60 hover:bg-indigo-700 rounded-2xl text-xs font-bold transition"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-300" />
                <span>Export Quarterly Report</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-indigo-300" />
            </button>

          </div>
        </div>

      </div>

      {/* Bottom Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activities (Left 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-900">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent Activities</h3>
            <button className="text-slate-400 hover:text-slate-600">•••</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-50 dark:border-slate-900">
                  <th className="pb-3 pr-4">Activity</th>
                  <th className="pb-3 px-4">Department</th>
                  <th className="pb-3 px-4">Time</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                {recentActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${act.iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-855 text-slate-850 dark:text-slate-200">
                              {act.action.split(':')[0]}
                              {act.action.includes(':') && (
                                <>:<span className="font-extrabold text-slate-900 dark:text-white">{act.action.split(':')[1]}</span></>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3.5 px-4 text-slate-500 font-bold">{act.dept}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-semibold">{act.time}</td>
                      
                      <td className="py-3.5 pl-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide inline-block ${
                          act.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' 
                            : act.status === 'Pending' 
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20' 
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-center border-t border-slate-50 dark:border-slate-900">
            <button 
              onClick={() => triggerToast('Activities database fully opened')}
              className="text-xs font-bold text-indigo-650 hover:text-indigo-700 transition"
            >
              View All Activities
            </button>
          </div>

        </div>

        {/* Right column: Holidays & Staffing Diversity */}
        <div className="space-y-6">
          
          {/* Upcoming Holidays */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Upcoming Holidays</h3>
              <button 
                onClick={() => triggerToast('Holidays calendar opened')}
                className="text-xs font-bold text-indigo-650 hover:text-indigo-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {holidays.map((h, i) => (
                <div key={i} className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-900">
                  <div className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-[9px] font-extrabold p-2 rounded-xl text-center w-12 shrink-0">
                    <span className="block leading-none">{h.date.split(' ')[0]}</span>
                    <span className="block text-xs font-extrabold leading-none mt-1">{h.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate">{h.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{h.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staffing Diversity Double Ring SVG Gauge */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 relative">
            
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Staffing Diversity</h3>
              
              <button 
                onClick={() => triggerToast('Diversity filters updated')}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="54" className="stroke-slate-100 dark:stroke-slate-900 fill-none" strokeWidth="10" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="54" 
                    className="stroke-indigo-600 fill-none transition-all" 
                    strokeWidth="10" 
                    strokeDasharray={2 * Math.PI * 54} 
                    strokeDashoffset={2 * Math.PI * 54 * (1 - 0.62)} 
                    strokeLinecap="round" 
                  />
                  <circle cx="72" cy="72" r="40" className="stroke-slate-100 dark:stroke-slate-900 fill-none" strokeWidth="6" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="40" 
                    className="stroke-sky-400 fill-none transition-all" 
                    strokeWidth="6" 
                    strokeDasharray={2 * Math.PI * 40} 
                    strokeDashoffset={2 * Math.PI * 40 * (1 - 0.40)} 
                    strokeLinecap="round" 
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-extrabold text-slate-800 dark:text-white">62%</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">Full Time</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-[10px] font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                <div className="leading-tight">
                  <span className="text-slate-400 block font-semibold">Full-time</span>
                  <span className="text-slate-700 dark:text-slate-350">774</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
                <div className="leading-tight">
                  <span className="text-slate-400 block font-semibold">Contract</span>
                  <span className="text-slate-700 dark:text-slate-350">474</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-200 inline-block"></span>
                <div className="leading-tight">
                  <span className="text-slate-400 block font-semibold">Remote</span>
                  <span className="text-slate-700 dark:text-slate-300">312</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-200 inline-block"></span>
                <div className="leading-tight">
                  <span className="text-slate-400 block font-semibold">On-site</span>
                  <span className="text-slate-700 dark:text-slate-300">936</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

  );
}
