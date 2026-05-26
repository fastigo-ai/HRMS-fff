import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Code,
  Palette,
  TrendingUp,
  HeartHandshake,
  Building,
  Plus,
  Filter,
  CheckCircle,
  HelpCircle,
  X,
  User,
  Mail,
  MapPin,
  Coins
} from 'lucide-react';
import { DatabaseService } from '../../services/api';
import { useHrStore } from '../../store/hrStore';

export default function HRDepartments({
  triggerToast
}) {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);

  const { hrEmployees } = useHrStore();

  const getDeptEmployees = (deptName) => {
    return hrEmployees.filter(emp => {
      const dName = deptName.toLowerCase();
      const eDept = emp.dept.toLowerCase();
      
      if (dName.includes('engineering') && eDept.includes('engineering')) return true;
      if (dName.includes('design') && eDept.includes('design')) return true;
      if (dName.includes('marketing') && eDept.includes('marketing')) return true;
      if (dName.includes('success') && eDept.includes('success')) return true;
      
      return dName.includes(eDept) || eDept.includes(dName);
    });
  };

  // Fetch departments data asynchronously
  useEffect(() => {
    const loadDepts = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getHRDepartments();
        setDepts(data);
      } catch (err) {
        triggerToast('Failed to load corporate departments matrix.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadDepts();
  }, []);

  const handleCreateDepartment = async () => {
    const name = prompt("Enter new department name:");
    if (!name) return;
    const desc = prompt("Enter brief department description:", "High efficiency operations vertical.");
    if (!desc) return;
    const leader = prompt("Enter department lead / director name:", "Sarah Jenkins");
    if (!leader) return;

    const newDept = {
      name,
      desc,
      leader,
      leaderTitle: 'Department Director',
      headcount: 1,
      budget: '$250K / yr',
      hiringStatus: '1 Opening',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=64&h=64',
      accentColor: 'border-l-indigo-600',
      barColor: 'bg-indigo-600'
    };

    try {
      const updated = await DatabaseService.addDepartment(newDept);
      setDepts(updated);
      triggerToast(`Department ${name} registered in corporate matrix successfully!`);
    } catch (err) {
      triggerToast('Error saving new department blueprint.', 'error');
    }
  };

  const getDeptIcon = (name) => {
    if (name.includes('Eng')) return Code;
    if (name.includes('Design')) return Palette;
    if (name.includes('Growth')) return TrendingUp;
    if (name.includes('Success')) return HeartHandshake;
    return Building;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'TOTAL DEPTS', value: `${depts.length}`, change: '+2 this quarter', color: 'indigo' },
    { label: 'AVG. EFFICIENCY', value: '94%', change: '↑ 3%', color: 'emerald' },
    { label: 'BUDGET UTIL.', value: '82%', change: 'On target', color: 'indigo' },
    { label: 'OPEN ROLES', value: '28', change: 'Active hiring', color: 'amber' }
  ];

  return (
    <div className="space-y-6 flex flex-col justify-between min-h-[calc(100vh-140px)]">
      
      <div className="space-y-6">
        
        {/* Title Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Departments</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Manage organizational structures and team efficiency.</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => triggerToast('Applying filters')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button 
              onClick={handleCreateDepartment}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
            >
              <Plus className="w-4 h-4" />
              Create Department
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{stat.label}</span>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-850 dark:text-white">{stat.value}</span>
                <span className={`text-[9px] font-extrabold ${stat.change.includes('↑') || stat.change.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Departments Grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {depts.map((d, i) => {
            const DeptIcon = getDeptIcon(d.name);
            return (
              <div 
                key={d.id || i} 
                onClick={() => setSelectedDept(d)}
                className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer group"
              >
                
                {/* Department Icon & Details */}
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400 shadow-sm">
                    <DeptIcon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{d.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">{d.desc || 'Active corporate organizational unit.'}</p>
                  </div>
                </div>

                {/* Manager detail */}
                <div className="flex items-center justify-between py-3 border-y border-slate-50 dark:border-slate-900">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={d.avatar} alt={d.leader} className="w-8 h-8 rounded-full object-cover" />
                    <div className="leading-tight truncate">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{d.leader}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block truncate">{d.leaderTitle || 'Manager'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white block">{d.headcount || d.count}</span>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Employees</span>
                  </div>
                </div>

                {/* Mini graphical bar chart matching Screenshot 2 */}
                <div className="flex items-end justify-between pt-2">
                  <div className="flex items-end gap-1">
                    <div className={`w-1.5 h-6 rounded-full ${d.barColor || 'bg-indigo-600'} opacity-40`}></div>
                    <div className={`w-1.5 h-8 rounded-full ${d.barColor || 'bg-indigo-600'} opacity-60`}></div>
                    <div className={`w-1.5 h-10 rounded-full ${d.barColor || 'bg-indigo-600'} opacity-80`}></div>
                    <div className={`w-1.5 h-12 rounded-full ${d.barColor || 'bg-indigo-600'}`}></div>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] font-bold text-slate-400 block tracking-widest">EFFICIENCY</span>
                    <span className="text-xs font-extrabold block text-indigo-650 dark:text-indigo-400">
                      {d.efficiency || 95}%
                    </span>
                  </div>
                </div>

              </div>
            );
          })}

          {/* Add Department dashed card */}
          <button 
            onClick={handleCreateDepartment}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-600 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group min-h-[290px] transition-colors w-full"
          >
            <div className="p-3 bg-slate-50 dark:bg-slate-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 rounded-full transition-colors">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Add Department</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed mt-1">Start defining a new organizational vertical</p>
            </div>
          </button>

        </div>

      </div>

      {/* Department Details Drawer */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 border-l border-slate-150 dark:border-slate-850 shadow-2xl p-6 flex flex-col h-full animate-in slide-in-from-right duration-250">
            
            {/* Header section */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-900">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg border border-indigo-100/40">
                    Department Blueprint
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-100/40">
                    {selectedDept.efficiency || 95}% Efficiency
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-relaxed">
                  {selectedDept.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                  {selectedDept.desc || 'Active corporate organizational unit.'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDept(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              
              {/* Leader & Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Department Lead</span>
                  <span className="text-xs font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-500" />
                    {selectedDept.leader}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Annual Budget</span>
                  <span className="text-xs font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    {selectedDept.budget || '₹1.0Cr / yr'}
                  </span>
                </div>
              </div>

              {/* Roster / Employee list */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Department Employees</span>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100/40">
                    {getDeptEmployees(selectedDept.name).length} assigned
                  </span>
                </h4>
                
                <div className="space-y-3">
                  {getDeptEmployees(selectedDept.name).length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <User className="w-8 h-8 text-slate-400 stroke-1.5 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold text-slate-500">No employees currently assigned in roster</p>
                    </div>
                  ) : (
                    getDeptEmployees(selectedDept.name).map((emp) => (
                      <div key={emp.id} className="p-3.5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xs flex items-center justify-between hover:shadow-sm transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/10" />
                          <div className="leading-tight min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block truncate">{emp.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <span className="text-[9px] text-slate-400 font-semibold block flex items-center gap-0.5 justify-end">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {emp.location}
                            </span>
                            <span className="text-[9px] text-slate-400 font-semibold block flex items-center gap-0.5 justify-end">
                              <Mail className="w-3.5 h-3.5 text-indigo-400" /> {emp.email}
                            </span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            emp.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border border-amber-100'
                          }`}>
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Footer details */}
      <footer className="pt-8 pb-4 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-semibold gap-3">
        <span>© 2024 WorkSphere Cloud. All rights reserved.</span>
        <div className="flex gap-4">
          <button onClick={() => triggerToast('Status: Healthy')} className="hover:text-indigo-600">System Status</button>
          <button onClick={() => triggerToast('Privacy Policies')} className="hover:text-indigo-600">Privacy Policy</button>
        </div>
      </footer>

    </div>
  );
}
