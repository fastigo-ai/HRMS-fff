import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { Mail, Lock, Shield, ArrowRight, User, Users, Briefcase } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { triggerToast } = useUiStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Preset credentials to make evaluator onboarding seamless!
  const presets = [
    {
      role: 'standard_employee',
      name: 'Mallik',
      label: 'Employee Preset',
      email: 'mallik@gmail.com',
      password: 'password123',
      desc: 'Senior Developer',
      icon: User,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
    },
    {
      role: 'manager',
      name: 'David Miller',
      label: 'Manager Preset',
      email: 'david@Fastigo X.io',
      password: 'password123',
      desc: 'Engineering Lead',
      icon: Briefcase,
      color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50'
    },
    {
      role: 'hr_admin',
      name: 'Akhil',
      label: 'HR Admin Preset',
      email: 'akhil@gmail.com',
      password: 'Password@321',
      desc: 'HR Director',
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50'
    }
  ];

  const handlePresetClick = async (preset) => {
    setLoading(true);
    setEmail(preset.email);
    setPassword(preset.password);
    
    const result = await login(preset.email, preset.password);
    setLoading(false);
    
    if (result.success) {
      triggerToast(`Welcome back, ${preset.name}! Session synchronized.`);
      navigate(result.role === 'hr_admin' ? '/hr/dashboard' : result.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
    } else {
      triggerToast(result.error, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast('Please supply both email & password credentials', 'error');
      return;
    }
    
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      triggerToast('Authenticated successfully! Session active.');
      navigate(result.role === 'hr_admin' ? '/hr/dashboard' : result.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
    } else {
      triggerToast(result.error, 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden px-4">
      {/* Decorative Premium Mesh Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-550 bg-indigo-600/10 blur-[120px] dark:bg-indigo-500/5"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] dark:bg-violet-500/5"></div>

      <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 my-8">
        
        {/* Branding & Marketing Column */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-xl shadow-lg shadow-indigo-600/20">
              W
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Fastigo X</h1>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest">Enterprise HRMS & SaaS</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              One Unified Workspace. <br/>
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
                Limitless Capabilities.
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Fastigo X is an enterprise-grade HR SaaS platform organizing department hierarchies, geofenced tracking boundaries, payroll calculators, sprint workflows, and real-time approvals.
            </p>
          </div>

          {/* Quick Onboarding Presets */}
          <div className="space-y-3 pt-6">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Quick Evaluator Logins (One-Click Bypass)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {presets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    disabled={loading}
                    onClick={() => handlePresetClick(preset)}
                    className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.02] shadow-sm ${preset.color}`}
                  >
                    <Icon className="w-5 h-5 mb-2.5" />
                    <span className="text-xs font-black leading-tight block">{preset.label}</span>
                    <span className="text-[9px] opacity-75 font-medium block mt-0.5 truncate w-full">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auth Form Form Card Column */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="w-full max-w-[440px] bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Sign In</h3>
              <p className="text-xs text-slate-400">Supply your corporate credentials to access active panels</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="e.g. employee@Fastigo X.io"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/5 transition text-slate-800 dark:text-white"
                  />
                </div>
              </div>

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
                    placeholder="Enter security password"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/5 transition text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 group hover:scale-[1.01] shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Validating Token Parameters...' : 'Access Dashboard Session'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

           
          </div>
        </div>

      </div>
    </div>
  );
}
