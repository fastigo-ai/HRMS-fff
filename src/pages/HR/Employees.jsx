import React, { useState } from 'react';
import { Plus, Search, Filter, User, Briefcase, CreditCard, FileText, UploadCloud, X, CheckCircle2, Calendar, DollarSign, MapPin, Phone, Mail, Building, Download, Info } from 'lucide-react';
import { useHrStore } from '../../store/hrStore';
import { useUiStore } from '../../store/uiStore';
import DataTable from '../../shared/ui/DataTable';
import StatusBadge from '../../shared/ui/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';
import SearchBar from '../../shared/ui/SearchBar';
import Modal from '../../shared/ui/Modal';

export default function EmployeesPage() {
  const { hrEmployees, addEmployee } = useHrStore();
  const { triggerToast } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  // Tab control inside the Register Staff Member modal
  const [activeFormTab, setActiveFormTab] = useState('basic');
  
  // File upload state for mock loading indicators
  const [uploadingRelieving, setUploadingRelieving] = useState(false);
  const [uploadingSalary, setUploadingSalary] = useState(false);

  // Form State containing comprehensive employee parameters
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    dept: 'Engineering',
    email: '',
    location: 'HQ Austin',
    phone: '',
    address: '',
    skills: '',
    empId: '',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    gender: 'male',
    // Previous Employment details
    prevCompany: '',
    prevDesignation: '',
    prevDuration: '',
    prevCtc: '',
    prevRelievingDoc: null,
    // Salary Slip & Payroll details
    prevSalarySlip: null,
    bankName: '',
    accountNo: '',
    panNumber: '',
    ifscCode: '',
    joiningSalary: '',
  });

  const filtered = hrEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = filterDept === 'All' || emp.dept === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleRelievingUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingRelieving(true);
      setTimeout(() => {
        setUploadingRelieving(false);
        setNewEmp(prev => ({ ...prev, prevRelievingDoc: file.name }));
        triggerToast(`Relieving Letter "${file.name}" uploaded successfully!`);
      }, 1000);
    }
  };

  const handleSalaryUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingSalary(true);
      setTimeout(() => {
        setUploadingSalary(false);
        setNewEmp(prev => ({ ...prev, prevSalarySlip: file.name }));
        triggerToast(`Salary Slip "${file.name}" uploaded successfully!`);
      }, 1000);
    }
  };

  const removeRelievingDoc = () => {
    setNewEmp(prev => ({ ...prev, prevRelievingDoc: null }));
    triggerToast('Relieving document removed.');
  };

  const removeSalarySlip = () => {
    setNewEmp(prev => ({ ...prev, prevSalarySlip: null }));
    triggerToast('Salary slip removed.');
  };

  const columns = [
    {
      header: 'Employee Profile',
      field: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64&h=64'} alt={val} className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/10" />
          <div>
            <p className="font-bold text-slate-850 dark:text-white leading-tight">{val}</p>
            <p className="text-[10px] text-slate-400 font-medium">{row.email || 'no-email@worksphere.io'}</p>
          </div>
        </div>
      )
    },
    { header: 'Organizational Role', field: 'role', className: 'font-semibold text-slate-500' },
    { header: 'Department', field: 'dept', className: 'font-bold text-slate-650' },
    {
      header: 'Current Status',
      field: 'status',
      render: (val) => <StatusBadge status={val || 'Active'} />
    },
    { header: 'Assigned Hub', field: 'location', className: 'font-semibold text-slate-550' },
    {
      header: 'Actions',
      field: 'id',
      className: 'text-right',
      render: (id, row) => (
        <button 
          onClick={() => {
            setSelectedEmp(row);
            setIsDetailModalOpen(true);
          }}
          className="px-2.5 py-1 text-[10px] font-bold text-violet-650 hover:bg-violet-50 dark:hover:bg-slate-900 rounded-lg transition border border-violet-100 hover:border-violet-300 dark:border-slate-850"
        >
          Manage
        </button>
      )
    }
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.role || !newEmp.email) {
      triggerToast('Please supply name, role and contact email registers.', 'error');
      return;
    }
    
    // Automatically generate employee ID if not entered manually
    const finalEmpId = newEmp.empId || 'WS-' + Math.floor(10000 + Math.random() * 90000);
    
    const finalEmp = {
      ...newEmp,
      empId: finalEmpId,
      skills: newEmp.skills ? newEmp.skills.split(',') : ['HRMS Portal'],
      avatar: newEmp.gender === 'female' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64',
    };

    addEmployee(finalEmp, triggerToast);
    setIsModalOpen(false);
    
    // Reset form parameters
    setNewEmp({
      name: '', role: '', dept: 'Engineering', email: '', location: 'HQ Austin',
      phone: '', address: '', skills: '', empId: '', gender: 'male',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      prevCompany: '', prevDesignation: '', prevDuration: '', prevCtc: '',
      prevRelievingDoc: null, prevSalarySlip: null,
      bankName: '', accountNo: '', panNumber: '', ifscCode: '', joiningSalary: ''
    });
    setActiveFormTab('basic');
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employee Roster Registry" 
        description="Oversee and manage organizational positions, contact credentials, career documentation, and salaries."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition-all shadow-md shadow-violet-600/10 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Filter employee databases by name, role, email..." 
          className="flex-1"
        />
        
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-500"
          >
            <option value="All">All Sectors</option>
            <option value="Engineering">Engineering</option>
            <option value="Experience Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Executive Management">Management</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        emptyMessage="No employees found matching the filter query." 
      />

      {/* Register Staff Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Staff Member">
        <form onSubmit={handleAdd} className="space-y-4 text-xs font-semibold">
          
          {/* Form Tab Headers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveFormTab('basic')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeFormTab === 'basic'
                  ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('previous')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeFormTab === 'previous'
                  ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Career History
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('payroll')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeFormTab === 'payroll'
                  ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Bank & Files
            </button>
          </div>

          {/* TAB 1: BASIC INFORMATION */}
          {activeFormTab === 'basic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newEmp.name}
                    onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. Samuel Davis"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Gender (For Mock Profile)</label>
                  <select 
                    value={newEmp.gender}
                    onChange={e => setNewEmp({...newEmp, gender: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 focus:outline-hidden"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Corporate Title *</label>
                  <input 
                    type="text" 
                    required
                    value={newEmp.role}
                    onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. Lead Designer"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Vertical Department</label>
                  <select 
                    value={newEmp.dept}
                    onChange={e => setNewEmp({...newEmp, dept: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 focus:outline-hidden"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Experience Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Executive Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Work Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={newEmp.email}
                    onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="samuel.d@worksphere.io"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Phone Number</label>
                  <input 
                    type="text" 
                    value={newEmp.phone}
                    onChange={e => setNewEmp({...newEmp, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Staff ID (Auto-Generated if Empty)</label>
                  <input 
                    type="text" 
                    value={newEmp.empId}
                    onChange={e => setNewEmp({...newEmp, empId: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. WS-88402"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Hub Location</label>
                  <input 
                    type="text" 
                    value={newEmp.location}
                    onChange={e => setNewEmp({...newEmp, location: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500">Home Address</label>
                <input 
                  type="text" 
                  value={newEmp.address}
                  onChange={e => setNewEmp({...newEmp, address: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  placeholder="e.g. 422 Willow Lane, Austin, TX"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500">Skills (Comma-separated)</label>
                <input 
                  type="text" 
                  value={newEmp.skills}
                  onChange={e => setNewEmp({...newEmp, skills: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  placeholder="e.g. React, NodeJS, Figma"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PREVIOUS EMPLOYMENT DETAILS */}
          {activeFormTab === 'previous' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Previous Company</label>
                  <input 
                    type="text" 
                    value={newEmp.prevCompany}
                    onChange={e => setNewEmp({...newEmp, prevCompany: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. TechCorp Solutions"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Previous Designation</label>
                  <input 
                    type="text" 
                    value={newEmp.prevDesignation}
                    onChange={e => setNewEmp({...newEmp, prevDesignation: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. Mid Developer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Employment Duration</label>
                  <input 
                    type="text" 
                    value={newEmp.prevDuration}
                    onChange={e => setNewEmp({...newEmp, prevDuration: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. 2 Years 6 Months"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Last Drawn CTC</label>
                  <input 
                    type="text" 
                    value={newEmp.prevCtc}
                    onChange={e => setNewEmp({...newEmp, prevCtc: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. $80,000 / year"
                  />
                </div>
              </div>

              {/* Relieving Letter Drag-and-Drop */}
              <div className="pt-2">
                <label className="block mb-1 text-slate-500">Relieving Letter / Experience Certificate</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 transition-all text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[110px]">
                  {uploadingRelieving ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-slate-500 text-[10px]">Mock uploading documentation...</span>
                    </div>
                  ) : newEmp.prevRelievingDoc ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 animate-bounce" />
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[200px]">{newEmp.prevRelievingDoc}</div>
                      <button 
                        type="button" 
                        onClick={removeRelievingDoc}
                        className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 px-2 py-0.5 rounded-lg transition"
                      >
                        <X className="w-2.5 h-2.5" /> Remove Letter
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-1.5" />
                      <div className="text-slate-500 text-[10px] font-semibold">Drag & drop or <span className="text-violet-600 underline">browse</span> for Experience Certificate</div>
                      <input 
                        type="file" 
                        onChange={handleRelievingUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYROLL DETAILS & SALARY SLIP */}
          {activeFormTab === 'payroll' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Offered Annual Salary</label>
                  <input 
                    type="text" 
                    value={newEmp.joiningSalary}
                    onChange={e => setNewEmp({...newEmp, joiningSalary: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. $95,000 / year"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Bank Partner Name</label>
                  <input 
                    type="text" 
                    value={newEmp.bankName}
                    onChange={e => setNewEmp({...newEmp, bankName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. JPMorgan Chase & Co."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block mb-1 text-slate-500">Bank Account Number</label>
                  <input 
                    type="text" 
                    value={newEmp.accountNo}
                    onChange={e => setNewEmp({...newEmp, accountNo: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. 120485901192"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">IFSC / Routing</label>
                  <input 
                    type="text" 
                    value={newEmp.ifscCode}
                    onChange={e => setNewEmp({...newEmp, ifscCode: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="CHAS0001204"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-500">Permanent Tax ID (PAN)</label>
                <input 
                  type="text" 
                  value={newEmp.panNumber}
                  onChange={e => setNewEmp({...newEmp, panNumber: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  placeholder="e.g. BBBPJ1024D"
                />
              </div>

              {/* Salary Slip Drag-and-Drop */}
              <div className="pt-2">
                <label className="block mb-1 text-slate-500">Previous Company's Salary Slip</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 transition-all text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[110px]">
                  {uploadingSalary ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-semibold text-slate-500 text-[10px]">Mock uploading payroll slips...</span>
                    </div>
                  ) : newEmp.prevSalarySlip ? (
                    <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 animate-bounce" />
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[200px]">{newEmp.prevSalarySlip}</div>
                      <button 
                        type="button" 
                        onClick={removeSalarySlip}
                        className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 px-2 py-0.5 rounded-lg transition"
                      >
                        <X className="w-2.5 h-2.5" /> Remove Slip
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-1.5" />
                      <div className="text-slate-500 text-[10px] font-semibold">Drag & drop or <span className="text-violet-600 underline">browse</span> for previous Salary Slip</div>
                      <input 
                        type="file" 
                        onChange={handleSalaryUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Action Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-900 mt-2">
            <div>
              {/* Tab Navigation Helpers */}
              {activeFormTab === 'previous' && (
                <button
                  type="button"
                  onClick={() => setActiveFormTab('basic')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 text-[10px] font-extrabold text-slate-500"
                >
                  ← Back to Profile
                </button>
              )}
              {activeFormTab === 'payroll' && (
                <button
                  type="button"
                  onClick={() => setActiveFormTab('previous')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 text-[10px] font-extrabold text-slate-500"
                >
                  ← Back to Career
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              
              {activeFormTab === 'basic' && (
                <button 
                  type="button" 
                  onClick={() => {
                    if (!newEmp.name || !newEmp.role || !newEmp.email) {
                      triggerToast('Please supply name, role and email values first.', 'error');
                      return;
                    }
                    setActiveFormTab('previous');
                  }}
                  className="px-4 py-2 bg-violet-650 text-white rounded-xl font-bold shadow-md shadow-violet-550/10"
                >
                  Next: Career →
                </button>
              )}

              {activeFormTab === 'previous' && (
                <button 
                  type="button" 
                  onClick={() => setActiveFormTab('payroll')}
                  className="px-4 py-2 bg-violet-650 text-white rounded-xl font-bold shadow-md shadow-violet-550/10"
                >
                  Next: Payroll →
                </button>
              )}

              {activeFormTab === 'payroll' && (
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl shadow-md shadow-violet-600/10 font-bold"
                >
                  Confirm Member
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Employee Details Dossier Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Employee Full Dossier">
        {selectedEmp && (
          <div className="space-y-5 text-xs text-slate-600 dark:text-slate-350">
            {/* Dossier Header */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <img src={selectedEmp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64&h=64'} alt={selectedEmp.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-violet-500/20" />
              <div>
                <h3 className="text-base font-extrabold text-slate-850 dark:text-white leading-tight">{selectedEmp.name}</h3>
                <p className="text-xs font-bold text-violet-600">{selectedEmp.role}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400">
                  <span className="bg-slate-200/50 dark:bg-slate-850 px-2 py-0.5 rounded-md">{selectedEmp.dept || selectedEmp.department}</span>
                  <span>•</span>
                  <span>ID: {selectedEmp.empId || 'WS-PENDING'}</span>
                  <span>•</span>
                  <StatusBadge status={selectedEmp.status || 'Active'} />
                </div>
              </div>
            </div>

            {/* Dossier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Card */}
              <div className="space-y-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                  <User className="w-3.5 h-3.5" /> Basic Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Email:</span> {selectedEmp.email}</div>
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Phone:</span> {selectedEmp.phone || '+1 (555) 302-8841'}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Location:</span> {selectedEmp.location || 'HQ Austin'}</div>
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Join Date:</span> {selectedEmp.joinDate || 'Oct 12, 2021'}</div>
                  <div className="flex items-start gap-2"><Building className="w-3.5 h-3.5 text-slate-400 mt-0.5" /> <div><span className="font-bold">Address:</span> {selectedEmp.address || '882 Park Boulevard, San Francisco, CA'}</div></div>
                  {selectedEmp.skills && (
                    <div className="pt-1">
                      <span className="font-bold block mb-1">Key Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(selectedEmp.skills) ? selectedEmp.skills : selectedEmp.skills.split(',')).map((sk, idx) => (
                          <span key={idx} className="bg-violet-50 dark:bg-violet-950/40 text-violet-600 px-2 py-0.5 rounded-md font-bold text-[10px]">{sk.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Career & Documents Card */}
              <div className="space-y-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Previous Job History
                </h4>
                <div className="space-y-2">
                  <div><span className="font-bold text-slate-500">Company:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedEmp.prevCompany || 'GlobalTech Solutions Inc.'}</span></div>
                  <div><span className="font-bold text-slate-500">Designation:</span> {selectedEmp.prevDesignation || 'Software Engineer II'}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-bold text-slate-500">Duration:</span> {selectedEmp.prevDuration || '2 Years 4 Months'}</div>
                    <div><span className="font-bold text-slate-500">Last CTC:</span> {selectedEmp.prevCtc || '$82,000 / year'}</div>
                  </div>
                  
                  <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                      <span className="font-bold truncate text-[10px]">{selectedEmp.prevRelievingDoc || 'experience_certificate_signed.pdf'}</span>
                    </div>
                    <button 
                      onClick={() => triggerToast(`Downloading Experience Letter for ${selectedEmp.name}...`)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-md text-slate-550 transition shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll & Financial Card */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Payroll, Bank & Financial Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Offered Annual Salary:</span>
                  <span className="font-extrabold text-slate-850 dark:text-white">{selectedEmp.joiningSalary || '$95,000 / year'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Bank Partner Name:</span>
                  <span className="font-bold text-slate-850 dark:text-white">{selectedEmp.bankDetails?.bankName || selectedEmp.bankName || 'JPMorgan Chase & Co.'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Account Routing No:</span>
                  <span className="font-mono text-slate-850 dark:text-white">{selectedEmp.bankDetails?.accountNo || selectedEmp.accountNo || '•••• •••• 9840'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Permanent Tax ID (PAN):</span>
                  <span className="font-mono text-slate-850 dark:text-white">{selectedEmp.bankDetails?.panNumber || selectedEmp.panNumber || 'BBBPJ1024D'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-900">
                  <span className="font-bold text-slate-500">IFSC/Routing Code:</span>
                  <span className="font-mono text-slate-850 dark:text-white">{selectedEmp.bankDetails?.ifscCode || selectedEmp.ifscCode || 'CHAS0001204'}</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800 w-full">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-bold truncate text-[10px]">{selectedEmp.prevSalarySlip || 'salary_slip_last_drawn.pdf'}</span>
                </div>
                <button 
                  onClick={() => triggerToast(`Downloading Salary Slip for ${selectedEmp.name}...`)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-md text-slate-550 transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dossier Footer buttons */}
            <div className="flex justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

