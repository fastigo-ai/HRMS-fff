import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { Mail, Lock, Shield, User, Briefcase, Phone, MapPin, Award, CreditCard, Calendar, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const { triggerToast } = useUiStore();

  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('standard_employee');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [empId, setEmpId] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  
  // Bank Details State
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const roles = [
    {
      id: 'standard_employee',
      title: 'Employee',
      desc: 'SaaS Dev & Trackers',
      icon: User,
      selectedColor: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
      color: 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500'
    },
    {
      id: 'manager',
      title: 'Project Lead',
      desc: 'Sprints & Allocations',
      icon: Briefcase,
      selectedColor: 'border-violet-500 ring-2 ring-violet-500/10 bg-violet-500/5 text-violet-600 dark:text-violet-400',
      color: 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500'
    },
    {
      id: 'hr_admin',
      title: 'HR Director',
      desc: 'Staff Directories & Leaves',
      icon: Shield,
      selectedColor: 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400',
      color: 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name || !email || !password || !position || !department || !empId || !joinDate || !phone || !address || !skillsInput || !bankName || !accountNo || !panNumber || !ifscCode) {
      triggerToast('All profile and banking fields are mandatory for corporate registration!', 'error');
      return;
    }

    setLoading(true);

    // Format skills comma separated input into array
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    const signupPayload = {
      name,
      email,
      password,
      role,
      position,
      department,
      empId,
      joinDate: new Date(joinDate).toISOString(),
      phone,
      address,
      skills,
      bankDetails: {
        bankName,
        accountNo,
        panNumber,
        ifscCode
      }
    };

    const result = await signup(signupPayload);
    setLoading(false);

    if (result.success) {
      triggerToast(`Account created successfully! Onboarded as ${role === 'hr_admin' ? 'HR Specialist' : role === 'manager' ? 'Scrum Lead' : 'Engineer'}.`);
      navigate(role === 'hr_admin' ? '/hr/dashboard' : role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
    } else {
      triggerToast(result.error || 'Registration failed', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden px-4 py-12">
      {/* Background Meshes */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] dark:bg-violet-500/5"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] dark:bg-indigo-500/5"></div>

      <div className="w-full max-w-[1000px] bg-white dark:bg-slate-950 p-8 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl relative z-10">
        
        {/* Logo and Headings */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-md shadow-indigo-600/20 mb-1">
            W
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Register Corporate Profile</h3>
          <p className="text-xs text-slate-400">Complete all required sections below to finalize your enterprise onboarding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* COLUMN 1: Credentials & Employment */}
            <div className="space-y-5">
              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2">
                1. Credentials & Role
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      disabled={loading}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      disabled={loading}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hr@Fastigo X.io"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Security Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      disabled={loading}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password123"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Corporate Role</label>
                  <div className="grid grid-cols-3 gap-1">
                    {roles.map((r) => {
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          disabled={loading}
                          onClick={() => setRole(r.id)}
                          className={`py-2 border rounded-xl text-center transition-all ${
                            isSelected ? r.selectedColor : `${r.color} dark:bg-slate-900 hover:bg-slate-50`
                          }`}
                        >
                          <span className="text-[9px] font-extrabold block">{r.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pt-3 pb-2">
                2. Employment Details
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Designated Position</label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={position}
                      disabled={loading}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. HR Director"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Department</label>
                  <div className="relative">
                    <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={department}
                      disabled={loading}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. People Operations"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Employee ID</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={empId}
                      disabled={loading}
                      onChange={(e) => setEmpId(e.target.value)}
                      placeholder="e.g. WS-00101"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Join Date</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={joinDate}
                      disabled={loading}
                      onChange={(e) => setJoinDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Contact, Skills & Banking */}
            <div className="space-y-5">
              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pb-2">
                3. Contact & Competencies
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      disabled={loading}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 102-3948"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Address Details</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={address}
                      disabled={loading}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 882 Park Boulevard, CA"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Skills (Comma-separated)</label>
                <div className="relative">
                  <Award className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={skillsInput}
                    disabled={loading}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. Compliance, Talent Acquisition, Culture"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 pt-3 pb-2">
                4. Bank Details & Payroll Routing
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Bank name</label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={bankName}
                      disabled={loading}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="JPMorgan Chase"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Account number</label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={accountNo}
                      disabled={loading}
                      onChange={(e) => setAccountNo(e.target.value)}
                      placeholder="e.g. 110248029082"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">PAN Number</label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={panNumber}
                      disabled={loading}
                      onChange={(e) => setPanNumber(e.target.value)}
                      placeholder="e.g. BBBPJ1024D"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">IFSC / Routing Code</label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      disabled={loading}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="e.g. CHAS0001204"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/5 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Submit button */}
          <div className="pt-4 flex flex-col items-center justify-center space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[380px] py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 group hover:scale-[1.01] shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Onboarding Corporate User Profile...' : 'Complete Registration & Access Workspace'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <span className="text-[11px] text-slate-400 block text-center">
              Already have an active workspace account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Sign In Here
              </Link>
            </span>
          </div>

        </form>
      </div>
    </div>
  );
}
