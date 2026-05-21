import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { Mail, Lock, Shield, User, Users, Briefcase, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const { triggerToast } = useUiStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('standard_employee'); // Default selected role
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'standard_employee',
      title: 'Employee',
      desc: 'SaaS Dev & Trackers',
      icon: User,
      color: 'border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5',
      selectedColor: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'manager',
      title: 'Project Lead',
      desc: 'Sprints & Allocations',
      icon: Briefcase,
      color: 'border-violet-500/20 bg-violet-50/10 dark:bg-violet-950/5',
      selectedColor: 'border-violet-500 ring-2 ring-violet-500/10 bg-violet-500/5 text-violet-600 dark:text-violet-400'
    },
    {
      id: 'hr_admin',
      title: 'HR Director',
      desc: 'Staff Directories & Leaves',
      icon: Shield,
      color: 'border-indigo-500/20 bg-indigo-50/10 dark:bg-indigo-950/5',
      selectedColor: 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      triggerToast('All credentials fields are mandatory', 'error');
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password, role);
    setLoading(false);

    if (result.success) {
      triggerToast(`Account created successfully! Onboarded as ${role === 'hr_admin' ? 'HR Specialist' : role === 'manager' ? 'Scrum Lead' : 'Engineer'}.`);
      navigate(role === 'hr_admin' ? '/hr/dashboard' : role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
    } else {
      triggerToast(result.error, 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden px-4">
      {/* Background Meshes */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] dark:bg-violet-500/5"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-500/5"></div>

      <div className="w-full max-w-[500px] bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl relative z-10 my-8">
        
        {/* Logo and Headings */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-md shadow-indigo-600/20 mb-2">
            W
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">Create Corporate Profile</h3>
          <p className="text-xs text-slate-400">Join the corporate workspace with an isolated role dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                disabled={loading}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/5 transition text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.j@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/5 transition text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Role selector cards */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Select Corporate Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={loading}
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected ? r.selectedColor : `${r.color} text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50`
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 mb-1.5" />
                    <span className="text-[10px] font-bold block">{r.title}</span>
                    <span className="text-[8px] opacity-75 font-medium hidden sm:block truncate w-full mt-0.5">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (minimum 6 characters)"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/5 transition text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 group hover:scale-[1.01] shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Initializing Corporate Profile...' : 'Create Account & Login'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="text-center pt-4">
          <span className="text-[11px] text-slate-400 block">
            Already have an active workspace account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Sign In Here
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
