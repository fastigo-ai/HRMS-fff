import React, { useState, useEffect } from 'react';
import { 
  Plus, Filter, User, Briefcase, CreditCard, FileText, UploadCloud, X, CheckCircle2, 
  Calendar, MapPin, Phone, Mail, Building, Download, Send, Megaphone, Printer, 
  ClipboardCheck, ArrowRight, Trash2, ShieldCheck, UserCheck, TrendingUp, Tag,
  Copy, Sparkles, RefreshCw
} from 'lucide-react';
import { useHrStore } from '../../store/hrStore';
import { useUiStore } from '../../store/uiStore';
import DataTable from '../../shared/ui/DataTable';
import StatusBadge from '../../shared/ui/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';
import SearchBar from '../../shared/ui/SearchBar';
import Modal from '../../shared/ui/Modal';
import { hrService } from '../../services/hrService';

export default function EmployeesPage() {
  const { hrEmployees, addEmployee, editEmployee, deleteEmployee, fetchHREmployees } = useHrStore();
  const { triggerToast } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState(null);

  // New master tabs
  const [activeMainTab, setActiveMainTab] = useState('roster');

  // Onboarding System
  const [onboardings, setOnboardings] = useState([]);
  const [onboardingsLoading, setOnboardingsLoading] = useState(false);

  // Separation System
  const [resignations, setResignations] = useState([]);
  const [resignationsLoading, setResignationsLoading] = useState(false);
  const [resignationToResolve, setResignationToResolve] = useState(null);
  const [resolveResForm, setResolveResForm] = useState({ status: 'Approved', lastWorkingDay: '' });

  // Career transfers / promotions
  const [careerHistory, setCareerHistory] = useState([]);
  const [careerHistoryLoading, setCareerHistoryLoading] = useState(false);
  const [isCareerWizardOpen, setIsCareerWizardOpen] = useState(false);
  const [careerForm, setCareerForm] = useState({
    type: 'Transfer',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: '',
    newDept: 'Engineering',
    newPosition: '',
    newSalary: ''
  });
  const [applyingCareer, setApplyingCareer] = useState(false);

  // Document Center
  const [docSelectedEmpId, setDocSelectedEmpId] = useState('');
  const [docType, setDocType] = useState('offer');
  const [docCandidateName, setDocCandidateName] = useState('');
  const [docCandidateEmail, setDocCandidateEmail] = useState('');
  const [docCustomSalary, setDocCustomSalary] = useState('');
  const [docCustomPosition, setDocCustomPosition] = useState('');
  const [docCustomDepartment, setDocCustomDepartment] = useState('Engineering');
  const [docExitDate, setDocExitDate] = useState('');
  const [compiledDocHtml, setCompiledDocHtml] = useState('');
  const [compilingDoc, setCompilingDoc] = useState(false);

  React.useEffect(() => {
    fetchHREmployees();
  }, [fetchHREmployees]);

  useEffect(() => {
    if (activeMainTab === 'onboarding') {
      loadOnboardings();
    } else if (activeMainTab === 'separation') {
      loadResignations();
    }
  }, [activeMainTab]);

  const loadOnboardings = async () => {
    try {
      setOnboardingsLoading(true);
      const data = await hrService.getOnboardingsAll();
      setOnboardings(data);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load onboarding checklists.', 'error');
    } finally {
      setOnboardingsLoading(false);
    }
  };

  const loadResignations = async () => {
    try {
      setResignationsLoading(true);
      const data = await hrService.getResignationsAll();
      setResignations(data);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load resignations database.', 'error');
    } finally {
      setResignationsLoading(false);
    }
  };

  const handleVerifyOnboardingTask = async (onboardingId, taskKey, verifiedByHR, completed) => {
    try {
      await hrService.verifyOnboardingTask(onboardingId, { taskKey, verifiedByHR, completed });
      triggerToast('Onboarding checklist updated successfully!');
      loadOnboardings();
    } catch (err) {
      triggerToast(err.message || 'Failed to verify onboarding task', 'error');
    }
  };

  const handleResolveResignationSubmit = async (e) => {
    e.preventDefault();
    if (!resignationToResolve) return;
    try {
      await hrService.resolveResignation(resignationToResolve._id, {
        status: resolveResForm.status,
        lastWorkingDay: resolveResForm.lastWorkingDay
      });
      triggerToast(`Resignation status resolved to ${resolveResForm.status}!`);
      setResignationToResolve(null);
      loadResignations();
      fetchHREmployees();
    } catch (err) {
      triggerToast(err.message || 'Failed to resolve resignation status', 'error');
    }
  };

  const handleUpdateClearanceStatus = async (resignationId, field, val) => {
    try {
      await hrService.updateClearance(resignationId, { field, val });
      triggerToast('Separation clearance step updated!');
      loadResignations();
    } catch (err) {
      triggerToast(err.message || 'Failed to update clearance status', 'error');
    }
  };

  const handleToggleOffboardingTask = async (resignationId, taskIndex, taskCompleted, taskVerified) => {
    try {
      await hrService.updateClearance(resignationId, { taskIndex, taskCompleted, taskVerified });
      triggerToast('Offboarding task verification toggled!');
      loadResignations();
    } catch (err) {
      triggerToast(err.message || 'Failed to update offboarding task', 'error');
    }
  };

  useEffect(() => {
    if (selectedEmp && isDetailModalOpen) {
      loadCareerHistory(selectedEmp.id);
    }
  }, [selectedEmp, isDetailModalOpen]);

  const loadCareerHistory = async (empId) => {
    try {
      setCareerHistoryLoading(true);
      const data = await hrService.getCareerHistory(empId);
      setCareerHistory(data);
    } catch (err) {
      console.error("Failed to load career progression timeline:", err);
    } finally {
      setCareerHistoryLoading(false);
    }
  };

  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setApplyingCareer(true);
    try {
      const payload = {
        employeeId: selectedEmp.id,
        type: careerForm.type,
        effectiveDate: careerForm.effectiveDate,
        notes: careerForm.notes,
        newDepartment: careerForm.newDept,
        newPosition: careerForm.newPosition,
        newSalary: Number(careerForm.newSalary)
      };
      await hrService.promoteOrTransferEmployee(payload);
      triggerToast(`${careerForm.type} action successfully finalized in database!`);
      setIsCareerWizardOpen(false);
      loadCareerHistory(selectedEmp.id);
      fetchHREmployees();
      
      // Live sync detail dossier views
      setSelectedEmp(prev => ({
        ...prev,
        dept: careerForm.newDept,
        role: careerForm.newPosition,
        joiningSalary: careerForm.newSalary
      }));
    } catch (err) {
      triggerToast(err.message || 'Failed to apply career change', 'error');
    } finally {
      setApplyingCareer(false);
    }
  };

  const handleCompileLetter = async (e) => {
    e.preventDefault();
    setCompilingDoc(true);
    try {
      const payload = {
        employeeId: docSelectedEmpId || undefined,
        type: docType,
        candidateName: docCandidateName || undefined,
        candidateEmail: docCandidateEmail || undefined,
        customSalary: docCustomSalary ? Number(docCustomSalary) : undefined,
        customPosition: docCustomPosition || undefined,
        customDepartment: docCustomDepartment || undefined,
        exitDate: docExitDate || undefined
      };
      const html = await hrService.compileLetter(payload);
      setCompiledDocHtml(html);
      triggerToast('Letter compiled with dynamic variables!');
    } catch (err) {
      triggerToast(err.message || 'Failed to compile letter', 'error');
    } finally {
      setCompilingDoc(false);
    }
  };
  
  // Tab control inside the Register Staff Member modal
  const [activeFormTab, setActiveFormTab] = useState('basic');
  
  // File upload state for mock loading indicators
  const [uploadingRelieving, setUploadingRelieving] = useState(false);
  const [uploadingSalary, setUploadingSalary] = useState(false);

  // Form State containing comprehensive employee parameters
  const [newEmp, setNewEmp] = useState({
    name: '',
    role: '',
    systemRole: 'standard_employee',
    dept: 'Engineering',
    email: '',
    password: '',
    location: 'HQ Austin',
    phone: '',
    address: '',
    skills: '',
    empId: '',
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    gender: 'male',
    prevCompany: '',
    prevDesignation: '',
    prevDuration: '',
    prevCtc: '',
    prevRelievingDoc: null,
    prevSalarySlip: null,
    bankName: '',
    accountNo: '',
    panNumber: '',
    ifscCode: '',
    joiningSalary: '',
    aadhaarNumber: '',
    aadhaarCardDoc: null,
    panCardDoc: null,
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
      setNewEmp(prev => ({ ...prev, prevRelievingDoc: file }));
      triggerToast(`Relieving Letter "${file.name}" selected!`);
    }
  };

  const handleSalaryUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEmp(prev => ({ ...prev, prevSalarySlip: file }));
      triggerToast(`Salary Slip "${file.name}" selected!`);
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

  const handleAadhaarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEmp(prev => ({ ...prev, aadhaarCardDoc: file }));
      triggerToast(`Aadhaar Card document "${file.name}" selected!`);
    }
  };

  const handlePanCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewEmp(prev => ({ ...prev, panCardDoc: file }));
      triggerToast(`PAN Card document "${file.name}" selected!`);
    }
  };

  const removeAadhaarDoc = () => {
    setNewEmp(prev => ({ ...prev, aadhaarCardDoc: null }));
    triggerToast('Aadhaar document removed.');
  };

  const removePanCardDoc = () => {
    setNewEmp(prev => ({ ...prev, panCardDoc: null }));
    triggerToast('PAN document removed.');
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
            <p className="text-[10px] text-slate-400 font-medium">{row.email || 'no-email@Fastigo X.io'}</p>
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
      className: 'text-right w-[200px]',
      render: (id, row) => (
        <div className="flex justify-end gap-1.5">
          <button 
            onClick={() => {
              setSelectedEmp(row);
              setIsDetailModalOpen(true);
            }}
            className="px-2 py-1 text-[10px] font-bold text-violet-650 hover:bg-violet-50 dark:hover:bg-slate-900 rounded-lg transition border border-violet-100 hover:border-violet-300 dark:border-slate-850"
          >
            Manage
          </button>
          <button 
            onClick={() => {
              setSelectedEmp(row);
              setNewEmp({
                name: row.name,
                role: row.role,
                systemRole: row.systemRole || 'standard_employee',
                dept: row.dept || row.department || 'Engineering',
                email: row.email,
                password: '',
                location: row.location || 'HQ Austin',
                phone: row.phone || '',
                address: row.address || '',
                skills: Array.isArray(row.skills) ? row.skills.join(', ') : (row.skills || ''),
                empId: row.empId || '',
                gender: row.avatar?.includes('photo-1534528741775-53994a69daeb') ? 'female' : 'male',
                prevCompany: row.prevCompany || '',
                prevDesignation: row.prevDesignation || '',
                prevDuration: row.prevDuration || '',
                prevCtc: row.prevCtc || '',
                prevRelievingDoc: row.prevRelievingDoc || null,
                prevSalarySlip: row.prevSalarySlip || null,
                bankName: row.bankDetails?.bankName || row.bankName || '',
                accountNo: row.bankDetails?.accountNo || row.accountNo || '',
                panNumber: row.panNumber || row.bankDetails?.panNumber || '',
                ifscCode: row.bankDetails?.ifscCode || row.ifscCode || '',
                joiningSalary: row.joiningSalary || '',
                aadhaarNumber: row.aadhaarNumber || '',
                aadhaarCardDoc: row.aadhaarCardDoc || null,
                panCardDoc: row.panCardDoc || null,
              });
              setIsEditMode(true);
              setIsModalOpen(true);
            }}
            className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition border border-slate-200 hover:border-slate-300 dark:border-slate-800"
          >
            Edit
          </button>
          <button 
            onClick={() => {
              setEmpToDelete(row);
              setIsDeleteConfirmOpen(true);
            }}
            className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition border border-rose-100 hover:border-rose-300 dark:border-rose-950"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const handleGenerateEmail = () => {
    if (!newEmp.name.trim()) {
      triggerToast("Please enter the employee's name first!", "error");
      return;
    }
    const cleanName = newEmp.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '') // remove special chars
      .replace(/\s+/g, '.'); // replace spaces with dots
    const generatedEmail = `${cleanName}@Fastigo X.io`;
    setNewEmp(prev => ({ ...prev, email: generatedEmail }));
    triggerToast(`Email ID "${generatedEmail}" generated successfully!`);
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$*";
    let generatedPass = "";
    for (let i = 0; i < 10; i++) {
      generatedPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewEmp(prev => ({ ...prev, password: generatedPass }));
    triggerToast("Secure password generated successfully!");
  };

  const handleCopyCredentials = () => {
    if (!newEmp.email || !newEmp.password) {
      triggerToast("Generate email and password first!", "error");
      return;
    }
    const text = `Welcome ${newEmp.name || 'to the team'}!\nHere are your corporate login credentials:\nWork Email: ${newEmp.email}\nTemporary Password: ${newEmp.password}\n\nPlease login and change your password in Settings.`;
    navigator.clipboard.writeText(text);
    triggerToast("Onboarding credentials copied to clipboard!");
  };

  const handleSubmit = (e) => {
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
      skills: newEmp.skills ? (Array.isArray(newEmp.skills) ? newEmp.skills : newEmp.skills.split(',').map(s => s.trim())) : ['HRMS Portal'],
      avatar: newEmp.gender === 'female' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64',
    };

    if (isEditMode && selectedEmp) {
      editEmployee(selectedEmp.id, finalEmp, triggerToast);
    } else {
      addEmployee(finalEmp, triggerToast);
    }
    setIsModalOpen(false);
    
    // Reset form parameters
    setNewEmp({
      name: '', role: '', systemRole: 'standard_employee', dept: 'Engineering', email: '', password: '', location: 'HQ Austin',
      phone: '', address: '', skills: '', empId: '', gender: 'male',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      prevCompany: '', prevDesignation: '', prevDuration: '', prevCtc: '',
      prevRelievingDoc: null, prevSalarySlip: null,
      bankName: '', accountNo: '', panNumber: '', ifscCode: '', joiningSalary: '',
      aadhaarNumber: '', aadhaarCardDoc: null, panCardDoc: null
    });
    setActiveFormTab('basic');
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <PageHeader 
        title="Workforce & Operations Management" 
        description="Oversee employee rosters, onboarding progress checklists, separation clearances, dynamic career career paths, and corporate document generation."
      />

      {/* Roster & HR Sub-Tabs Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px gap-6 flex-wrap">
        <button
          onClick={() => setActiveMainTab('roster')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeMainTab === 'roster' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          Active Employee Roster
          {activeMainTab === 'roster' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveMainTab('onboarding')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeMainTab === 'onboarding' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Onboarding Pipeline
          {activeMainTab === 'onboarding' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveMainTab('separation')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeMainTab === 'separation' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <X className="w-3.5 h-3.5" />
          Separation & Clearance
          {activeMainTab === 'separation' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveMainTab('documents')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeMainTab === 'documents' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Document Center
          {activeMainTab === 'documents' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {activeMainTab === 'roster' && (
        <div className="space-y-6 animate-transition">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex-1 w-full max-w-xl">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Filter employee databases by name, role, email..." 
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  value={filterDept} 
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-500"
                >
                  <option value="All">All Sectors</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Experience Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Executive Management">Management</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setIsEditMode(false);
                  setNewEmp({
                    name: '', role: '', systemRole: 'standard_employee', dept: 'Engineering', email: '', password: '', location: 'HQ Austin',
                    phone: '', address: '', skills: '', empId: '', gender: 'male',
                    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    prevCompany: '', prevDesignation: '', prevDuration: '', prevCtc: '',
                    prevRelievingDoc: null, prevSalarySlip: null,
                    bankName: '', accountNo: '', panNumber: '', ifscCode: '', joiningSalary: '',
                    aadhaarNumber: '', aadhaarCardDoc: null, panCardDoc: null
                  });
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition-all shadow-md shadow-violet-600/10 hover:shadow-lg w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                Add Staff Member
              </button>
            </div>
          </div>

          <DataTable 
            columns={columns} 
            data={filtered} 
            emptyMessage="No employees found matching the filter query." 
          />
        </div>
      )}

      {/* TAB 2: ONBOARDING PIPELINE */}
      {activeMainTab === 'onboarding' && (
        <div className="space-y-6 animate-transition">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Onboarding Pipelines</h3>
            <p className="text-xs text-slate-400">Track dynamic onboarding checklist progress for new hires and verify pending tasks.</p>
          </div>

          {onboardingsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : onboardings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {onboardings.map((onb) => {
                const completedCount = onb.tasks.filter(t => t.completed).length;
                const verifiedCount = onb.tasks.filter(t => t.verifiedByHR).length;
                const pct = Math.round((completedCount / onb.tasks.length) * 100);
                const empName = onb.employee ? onb.employee.name : "Unknown Employee";
                const empRole = onb.employee ? onb.employee.position : "N/A";
                const empDept = onb.employee ? onb.employee.department : "N/A";

                return (
                  <div key={onb._id} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-850 dark:text-white">{empName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{empRole} ({empDept})</p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex-1 sm:w-40">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                            <span>Checklist Completed</span>
                            <span className="text-indigo-600">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          pct === 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {completedCount === onb.tasks.length ? 'Ready for Audit' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {onb.tasks.map((task) => (
                        <div key={task.taskKey} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 dark:text-white">{task.label}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold ${task.completed ? 'text-indigo-500' : 'text-slate-400'}`}>
                                {task.completed ? '✓ Employee Completed' : '○ Awaiting Employee'}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center">
                            {task.verifiedByHR ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyOnboardingTask(onb._id, task.taskKey, true, true)}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition"
                              >
                                Verify Task
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
              <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">No active onboarding lists</h4>
              <p className="text-xs text-slate-400">No new employees are currently scheduled for onboarding workflows.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEPARATION & CLEARANCE */}
      {activeMainTab === 'separation' && (
        <div className="space-y-6 animate-transition">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Employee Resignations & Offboarding Clearances</h3>
            <p className="text-xs text-slate-400">Review separation applications, resolve proposed last working days, and manage clearance approvals.</p>
          </div>

          {resignationsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : resignations.length > 0 ? (
            <div className="space-y-6">
              {resignations.map((res) => {
                const emp = res.employee || {};
                const name = emp.name || "Separating Employee";
                const role = emp.position || "N/A";
                const dept = emp.department || "N/A";
                const isPending = res.status === 'Pending';

                return (
                  <div key={res._id} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                    {/* Header Block */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-900">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-extrabold text-slate-855 dark:text-white leading-tight">{name}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            res.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            res.status === 'Completed' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                            res.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {res.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-450 mt-1">{role} ({dept}) • Filed on {new Date(res.resignationDate).toLocaleDateString()}</p>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="text-right">
                          <div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 leading-none">Last Working Day</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white mt-1">
                            {new Date(res.lastWorkingDay).toLocaleDateString()}
                          </div>
                        </div>

                        {isPending && (
                          <button
                            onClick={() => {
                              setResignationToResolve(res);
                              setResolveResForm({ status: 'Approved', lastWorkingDay: res.lastWorkingDay.split('T')[0] });
                            }}
                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                          >
                            Resolve Case
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Resignation Note */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-1">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Separation Statement:</div>
                      <p className="text-xs text-slate-650 dark:text-slate-355 italic">"{res.reason}"</p>
                    </div>

                    {/* Clearance Gateways Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* IT Gateway */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-slate-805 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            IT Clearance Gate
                          </h5>
                          <p className="text-[10px] text-slate-400">Assets handover & credentials deactivation</p>
                        </div>

                        <select
                          value={res.clearanceIT}
                          onChange={(e) => handleUpdateClearanceStatus(res._id, 'clearanceIT', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 dark:bg-slate-955 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-700 dark:text-slate-350"
                        >
                          <option value="Pending">🕒 Pending</option>
                          <option value="Cleared">✓ Cleared</option>
                          <option value="Rejected">✗ Rejected</option>
                        </select>
                      </div>

                      {/* Finance Gateway */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-2xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-slate-805 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            Finance Clearance Gate
                          </h5>
                          <p className="text-[10px] text-slate-400">Expense settlements & final dues</p>
                        </div>

                        <select
                          value={res.clearanceFinance}
                          onChange={(e) => handleUpdateClearanceStatus(res._id, 'clearanceFinance', e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 dark:bg-slate-955 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-700 dark:text-slate-350"
                        >
                          <option value="Pending">🕒 Pending</option>
                          <option value="Cleared">✓ Cleared</option>
                          <option value="Rejected">✗ Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Offboarding Tasks Audit */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">HR Offboarding Checklist Audit</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {res.offboardingTasks.map((task, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => handleToggleOffboardingTask(res._id, idx, !task.completed, task.verifiedByHR)}
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                  task.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-350 dark:border-slate-700'
                                }`}
                              >
                                {task.completed && '✓'}
                              </button>
                              <span className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {task.taskName}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleOffboardingTask(res._id, idx, task.completed, !task.verifiedByHR)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                                task.verifiedByHR 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 hover:bg-indigo-50 hover:text-indigo-655'
                              }`}
                            >
                              {task.verifiedByHR ? 'Verified' : 'Verify'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Finalize Separation Button */}
                    {!isPending && res.status !== 'Completed' && (
                      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-900">
                        <button
                          onClick={() => {
                            if (res.clearanceIT !== 'Cleared' || res.clearanceFinance !== 'Cleared') {
                              triggerToast('All asset & accounts clearances must be resolved first!', 'warning');
                              return;
                            }
                            setResignationToResolve(res);
                            setResolveResForm({ status: 'Completed', lastWorkingDay: res.lastWorkingDay.split('T')[0] });
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                        >
                          Complete Exit & Issue Experience Letter
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-950 p-12 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-805 dark:text-white">No separation files</h4>
              <p className="text-xs text-slate-400">There are no pending or active resignation offboardings in the system.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DOCUMENT GENERATION CENTER */}
      {activeMainTab === 'documents' && (
        <div className="space-y-6 animate-transition">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Dynamic Document Generation Center</h3>
            <p className="text-xs text-slate-400">Compile official corporate contracts, offer letters, and experience certificates using dynamic template variables.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Letter Configuration Wizard Form (1/3) */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Letter Parameters</h4>
              
              <form onSubmit={handleCompileLetter} className="space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-350">
                <div>
                  <label className="block mb-1 text-[10px] text-slate-400">TEMPLATE TYPE</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden"
                  >
                    <option value="offer">Offer Letter Contract</option>
                    <option value="appointment">Official Appointment Contract</option>
                    <option value="experience">Relieving & Experience Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-[10px] text-slate-400">SELECT EMPLOYEE (From Roster)</label>
                  <select
                    value={docSelectedEmpId}
                    onChange={(e) => {
                      setDocSelectedEmpId(e.target.value);
                      const emp = hrEmployees.find(u => u.id === e.target.value);
                      if (emp) {
                        setDocCandidateName(emp.name);
                        setDocCandidateEmail(emp.email || '');
                        setDocCustomPosition(emp.role || emp.position || '');
                        setDocCustomDepartment(emp.dept || emp.department || 'Engineering');
                        setDocCustomSalary(emp.joiningSalary || '');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden"
                  >
                    <option value="">-- Choose Roster Employee (Or Custom below) --</option>
                    {hrEmployees.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role || u.position || 'Employee'})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-900 space-y-3">
                  <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">VARIABLE OVERRIDES</div>
                  
                  <div>
                    <label className="block mb-1 text-[9px]">FULL NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rodriguez"
                      value={docCandidateName}
                      onChange={(e) => setDocCandidateName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-805 dark:text-white"
                    />
                  </div>

                  {docType === 'offer' && (
                    <div>
                      <label className="block mb-1 text-[9px]">CANDIDATE EMAIL</label>
                      <input
                        type="email"
                        placeholder="elena.r@gmail.com"
                        value={docCandidateEmail}
                        onChange={(e) => setDocCandidateEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-805 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-[9px]">POSITION</label>
                      <input
                        type="text"
                        placeholder="Frontend Architect"
                        value={docCustomPosition}
                        onChange={(e) => setDocCustomPosition(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-805 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[9px]">SECTOR/DEPT</label>
                      <input
                        type="text"
                        placeholder="Engineering"
                        value={docCustomDepartment}
                        onChange={(e) => setDocCustomDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-805 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-[9px]">CTC SALARY (INR)</label>
                    <input
                      type="number"
                      placeholder="950000"
                      value={docCustomSalary}
                      onChange={(e) => setDocCustomSalary(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-805 dark:text-white"
                    />
                  </div>

                  {docType === 'experience' && (
                    <div>
                      <label className="block mb-1 text-[9px]">EXIT DATE</label>
                      <input
                        type="date"
                        value={docExitDate}
                        onChange={(e) => setDocExitDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={compilingDoc}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-xl transition shadow-sm"
                >
                  {compilingDoc ? 'Compiling Parameters...' : 'Generate Dynamic Document'}
                </button>
              </form>
            </div>

            {/* Letter Preview & Editable Editor Container (2/3) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[450px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Official Document Preview & Edit Hub</h4>
                  {compiledDocHtml && (
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Official PDF
                    </button>
                  )}
                </div>

                {compiledDocHtml ? (
                  <div className="p-2 border border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/65 px-2.5 py-1 border border-indigo-150 dark:border-indigo-900/50 rounded-lg">
                      ✍️ Live Editable Template
                    </div>
                    {/* Interactive Editor wizard rendered with Official corp stamp & digital print option */}
                    <div 
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className="bg-white dark:bg-slate-950 p-8 rounded-xl min-h-[500px] text-xs font-medium text-slate-800 dark:text-slate-350 leading-relaxed border border-slate-150 dark:border-slate-900 shadow-inner overflow-y-auto focus:outline-none"
                      style={{ fontFamily: 'Georgia, serif' }}
                      dangerouslySetInnerHTML={{ __html: compiledDocHtml }}
                    />
                  </div>
                ) : (
                  <div className="p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 py-24">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                    <h4 className="text-sm font-semibold text-slate-850 dark:text-white">Contract generation hub is ready</h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      Select a template, fill the dynamic variables or select an employee from roster, and generate a live-editable official document instantly.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Detail Dossier Modal Timeline addition */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Employee Full Dossier">
        {selectedEmp && (
          <div className="space-y-5 text-xs text-slate-600 dark:text-slate-355 bg-white dark:bg-slate-950 rounded-xl">
            {/* Dossier Header */}
            <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap">
              <div className="flex items-center gap-3.5">
                <img src={selectedEmp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64&h=64'} alt={selectedEmp.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-violet-500/20" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-855 dark:text-white leading-tight">{selectedEmp.name}</h3>
                  <p className="text-xs font-bold text-violet-650 mt-0.5">{selectedEmp.role}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400">
                    <span className="bg-slate-200/50 dark:bg-slate-850 px-2 py-0.5 rounded-md">{selectedEmp.dept || selectedEmp.department}</span>
                    <span>•</span>
                    <span>ID: {selectedEmp.empId || 'WS-PENDING'}</span>
                    <span>•</span>
                    <StatusBadge status={selectedEmp.status || 'Active'} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCareerForm({
                    type: 'Transfer',
                    effectiveDate: new Date().toISOString().split('T')[0],
                    notes: '',
                    newDept: selectedEmp.dept || selectedEmp.department || 'Engineering',
                    newPosition: selectedEmp.role || selectedEmp.position || '',
                    newSalary: selectedEmp.joiningSalary || ''
                  });
                  setIsCareerWizardOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-md shadow-indigo-650/15 text-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Transfer or Promote
              </button>
            </div>

            {/* Dossier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Card */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                  <User className="w-3.5 h-3.5" /> Basic Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Email:</span> {selectedEmp.email}</div>
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Phone:</span> {selectedEmp.phone || 'N/A'}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Location:</span> {selectedEmp.location || 'N/A'}</div>
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> <span className="font-bold">Join Date:</span> {selectedEmp.joinDate || 'N/A'}</div>
                  <div className="flex items-start gap-2"><Building className="w-3.5 h-3.5 text-slate-400 mt-0.5" /> <div><span className="font-bold">Address:</span> {selectedEmp.address || 'N/A'}</div></div>
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
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
                <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Previous Job History
                </h4>
                <div className="space-y-2">
                  <div><span className="font-bold text-slate-500">Company:</span> <span className="font-bold text-slate-850 dark:text-white">{selectedEmp.prevCompany || 'N/A'}</span></div>
                  <div><span className="font-bold text-slate-500">Designation:</span> {selectedEmp.prevDesignation || 'N/A'}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="font-bold text-slate-500">Duration:</span> {selectedEmp.prevDuration || 'N/A'}</div>
                    <div><span className="font-bold text-slate-500">Last CTC:</span> {selectedEmp.prevCtc || 'N/A'}</div>
                  </div>
                  
                  {selectedEmp.prevRelievingDoc ? (
                    <div className="mt-2.5 p-2 bg-white dark:bg-slate-950 rounded-lg flex items-center justify-between border border-slate-250 dark:border-slate-800">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                        <span className="font-bold truncate text-[10px]">Experience Letter</span>
                      </div>
                      <a 
                        href={selectedEmp.prevRelievingDoc} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-md text-slate-550 transition shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-2.5 p-2 text-center text-slate-400 text-[10px] italic border border-dashed rounded-lg">
                      No relieving letter uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Career Timeline Progression Renders (Component 7 - Promotions & Transfers Career history timeline) */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Career History & Promotion Timeline
              </h4>

              {careerHistoryLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                </div>
              ) : careerHistory.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-indigo-150 dark:border-indigo-950 space-y-5 py-2">
                  {careerHistory.map((history) => (
                    <div key={history._id} className="relative text-xs">
                      {/* Timeline dot */}
                      <span className="absolute -left-[32px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-50 dark:ring-slate-900" />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                            history.type === 'Promotion' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                          }`}>
                            {history.type}
                          </span>
                          <span className="font-extrabold text-slate-805 dark:text-white">
                            {history.previousPosition} → {history.newPosition}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{new Date(history.effectiveDate).toLocaleDateString()}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-2 p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-900 text-[10px] font-bold text-slate-500 leading-normal">
                        <div>
                          <span className="text-slate-400 block font-semibold">DEPARTMENT TRANSITION:</span>
                          <span className="text-slate-750 dark:text-slate-350">{history.previousDepartment} ➔ {history.newDepartment}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">SALARY CHANGE:</span>
                          <span className="text-slate-750 dark:text-slate-350">₹{history.previousSalary?.toLocaleString()} ➔ ₹{history.newSalary?.toLocaleString()}</span>
                        </div>
                        {history.notes && (
                          <div className="col-span-2 md:col-span-1">
                            <span className="text-slate-400 block font-semibold">HR PROGRESSION NOTE:</span>
                            <span className="text-slate-750 dark:text-slate-300 italic font-medium">"{history.notes}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 text-[10px] italic py-2 border border-dashed rounded-lg bg-white dark:bg-slate-950">
                  No previous transfer or promotion history found on timeline dossier.
                </div>
              )}
            </div>

            {/* Payroll & Financial Card */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 space-y-3">
              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Payroll, Bank & Financial Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex items-center justify-between py-1 border-b border-slate-150 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Offered Annual Salary:</span>
                  <span className="font-extrabold text-slate-850 dark:text-white">₹{selectedEmp.joiningSalary || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-150 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Bank Partner Name:</span>
                  <span className="font-bold text-slate-850 dark:text-white">{selectedEmp.bankDetails?.bankName || selectedEmp.bankName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-150 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Account Routing No:</span>
                  <span className="font-mono text-slate-850 dark:text-white">{selectedEmp.bankDetails?.accountNo || selectedEmp.accountNo || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-150 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Permanent Tax ID (PAN):</span>
                  <span className="font-mono text-slate-850 dark:text-white">{selectedEmp.panNumber || selectedEmp.bankDetails?.panNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-150 dark:border-slate-900">
                  <span className="font-bold text-slate-500">Aadhaar National ID:</span>
                  <span className="font-mono text-slate-850 dark:text-white">{selectedEmp.aadhaarNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-150 dark:border-slate-900">
                  <span className="font-bold text-slate-500">IFSC/Routing Code:</span>
                  <span className="font-mono text-slate-850 dark:text-white">{selectedEmp.bankDetails?.ifscCode || selectedEmp.ifscCode || 'N/A'}</span>
                </div>
              </div>
              
              {selectedEmp.prevSalarySlip ? (
                <div className="mt-3 p-2 bg-white dark:bg-slate-950 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800 w-full">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold truncate text-[10px]">Previous Salary Slip</span>
                  </div>
                  <a 
                    href={selectedEmp.prevSalarySlip} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-md text-slate-550 transition shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="mt-3 p-2 text-center text-slate-400 text-[10px] italic border border-dashed rounded-lg bg-white dark:bg-slate-950">
                  No previous salary slip uploaded
                </div>
              )}

              {/* Aadhaar and PAN Card Document Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {selectedEmp.aadhaarCardDoc ? (
                  <div className="p-2 bg-white dark:bg-slate-955 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                      <span className="font-bold truncate text-[10px]">Aadhaar Card Doc</span>
                    </div>
                    <a 
                      href={selectedEmp.aadhaarCardDoc} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-md text-slate-550 transition shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="p-2 text-center text-slate-400 text-[10px] italic border border-dashed rounded-lg bg-white dark:bg-slate-950">
                    No Aadhaar Doc uploaded
                  </div>
                )}

                {selectedEmp.panCardDoc ? (
                  <div className="p-2 bg-white dark:bg-slate-955 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                      <span className="font-bold truncate text-[10px]">PAN Card Doc</span>
                    </div>
                    <a 
                      href={selectedEmp.panCardDoc} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-md text-slate-550 transition shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="p-2 text-center text-slate-400 text-[10px] italic border border-dashed rounded-lg bg-white dark:bg-slate-950">
                    No PAN Doc uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Dossier Footer buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-900 mt-2">
              <button 
                type="button" 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setEmpToDelete(selectedEmp);
                  setIsDeleteConfirmOpen(true);
                }}
                className="px-4 py-2 text-[10px] font-extrabold text-rose-650 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 rounded-xl transition"
              >
                Delete Profile
              </button>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setNewEmp({
                      name: selectedEmp.name,
                      role: selectedEmp.role,
                      dept: selectedEmp.dept || selectedEmp.department || 'Engineering',
                      email: selectedEmp.email,
                      location: selectedEmp.location || 'HQ Austin',
                      phone: selectedEmp.phone || '',
                      address: selectedEmp.address || '',
                      skills: Array.isArray(selectedEmp.skills) ? selectedEmp.skills.join(', ') : (selectedEmp.skills || ''),
                      empId: selectedEmp.empId || '',
                      gender: selectedEmp.avatar?.includes('photo-1534528741775-53994a69daeb') ? 'female' : 'male',
                      prevCompany: selectedEmp.prevCompany || '',
                      prevDesignation: selectedEmp.prevDesignation || '',
                      prevDuration: selectedEmp.prevDuration || '',
                      prevCtc: selectedEmp.prevCtc || '',
                      prevRelievingDoc: selectedEmp.prevRelievingDoc || null,
                      prevSalarySlip: selectedEmp.prevSalarySlip || null,
                      bankName: selectedEmp.bankDetails?.bankName || selectedEmp.bankName || '',
                      accountNo: selectedEmp.bankDetails?.accountNo || selectedEmp.accountNo || '',
                      panNumber: selectedEmp.panNumber || selectedEmp.bankDetails?.panNumber || '',
                      ifscCode: selectedEmp.bankDetails?.ifscCode || selectedEmp.ifscCode || '',
                      joiningSalary: selectedEmp.joiningSalary || '',
                      aadhaarNumber: selectedEmp.aadhaarNumber || '',
                      aadhaarCardDoc: selectedEmp.aadhaarCardDoc || null,
                      panCardDoc: selectedEmp.panCardDoc || null,
                    });
                    setIsEditMode(true);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold transition shadow-md shadow-violet-600/10"
                >
                  Edit Profile
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Career progression / Promotion or Transfer Wizard Modal */}
      <Modal isOpen={isCareerWizardOpen} onClose={() => setIsCareerWizardOpen(false)} title="Career Progression & Hub Transfer Wizard">
        {selectedEmp && (
          <form onSubmit={handleCareerSubmit} className="space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-350">
            <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h5 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Target Employee Details</h5>
              <div className="flex justify-between font-bold">
                <span>Employee Name:</span>
                <span className="text-slate-800 dark:text-white">{selectedEmp.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Department:</span>
                <span>{selectedEmp.dept || selectedEmp.department}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Corporate Position:</span>
                <span>{selectedEmp.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Annual Salary:</span>
                <span>₹{selectedEmp.joiningSalary || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-[10px] text-slate-400">ACTION TYPE</label>
                <select
                  value={careerForm.type}
                  onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-700 dark:text-white"
                >
                  <option value="Transfer">Hub Transfer</option>
                  <option value="Promotion">Career Promotion</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-400">EFFECTIVE DATE</label>
                <input
                  type="date"
                  value={careerForm.effectiveDate}
                  onChange={(e) => setCareerForm({ ...careerForm, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-[10px] text-slate-400">NEW DEPARTMENT / SECTOR</label>
                <select
                  value={careerForm.newDept}
                  onChange={(e) => setCareerForm({ ...careerForm, newDept: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-750 dark:text-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Experience Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Executive Management">Management</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-400">NEW CORPORATE TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Architect"
                  value={careerForm.newPosition}
                  onChange={(e) => setCareerForm({ ...careerForm, newPosition: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-400">NEW ANNUAL SALARY (INR)</label>
              <input
                type="number"
                placeholder="e.g. 1200000"
                value={careerForm.newSalary}
                onChange={(e) => setCareerForm({ ...careerForm, newSalary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-400">HR COMPLIANCE NOTES</label>
              <textarea
                placeholder="Provide details about role transitions, performance rewards, or regional relocation details..."
                value={careerForm.notes}
                onChange={(e) => setCareerForm({ ...careerForm, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
              <button
                type="button"
                onClick={() => setIsCareerWizardOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 font-bold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applyingCareer}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-755 disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-indigo-650/15"
              >
                {applyingCareer ? 'Processing Action...' : 'Apply Progression Plan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Resignation Action Setting / Calendars modal */}
      <Modal isOpen={!!resignationToResolve} onClose={() => setResignationToResolve(null)} title="Separation Schedule & Resolve Case">
        {resignationToResolve && (
          <form onSubmit={handleResolveResignationSubmit} className="space-y-4 text-xs font-semibold text-slate-655 dark:text-slate-350">
            <div className="space-y-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 block">Separation Request Details</span>
              <div className="font-bold text-slate-800 dark:text-white text-xs">{resignationToResolve.employee?.name}</div>
              <div>Proposed Last Day: {new Date(resignationToResolve.lastWorkingDay).toLocaleDateString()}</div>
              <div className="text-[10px] text-slate-400 italic">"Reason: {resignationToResolve.reason}"</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-[10px] text-slate-400">RESOLUTION ACTION</label>
                <select
                  value={resolveResForm.status}
                  onChange={(e) => setResolveResForm({ ...resolveResForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-800 dark:text-slate-300"
                >
                  <option value="Approved">Approve Exit Schedule</option>
                  <option value="Rejected">Reject Separation File</option>
                  <option value="Completed">Complete Final Settlement</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-400">FINAL LAST WORKING DAY</label>
                <input
                  type="date"
                  value={resolveResForm.lastWorkingDay}
                  onChange={(e) => setResolveResForm({ ...resolveResForm, lastWorkingDay: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-805 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
              <button
                type="button"
                onClick={() => setResignationToResolve(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 font-bold"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
              >
                Confirm Resolution
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Register Staff Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Modify Staff Member" : "Register Staff Member"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          
          {/* Form Tab Headers */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveFormTab('basic')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeFormTab === 'basic'
                  ? 'bg-white dark:bg-slate-950 text-violet-650 shadow-sm border border-slate-200/50 dark:border-slate-800'
                  : 'text-slate-455 hover:text-slate-700'
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
                  : 'text-slate-455 hover:text-slate-700'
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
                  : 'text-slate-455 hover:text-slate-700'
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-550 focus:outline-hidden"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-555 focus:outline-hidden"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Experience Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Executive Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">System Access Role *</label>
                  <select 
                    value={newEmp.systemRole}
                    onChange={e => setNewEmp({...newEmp, systemRole: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-555 focus:outline-hidden font-semibold text-indigo-600 dark:text-indigo-400"
                  >
                    <option value="standard_employee">Regular Employee</option>
                    <option value="manager">Project Manager</option>
                    <option value="hr_admin">HR Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-500 font-medium text-xs">Work Email Address *</label>
                    <button
                      type="button"
                      onClick={handleGenerateEmail}
                      className="text-[10px] font-bold text-violet-600 hover:text-violet-750 flex items-center gap-0.5 border border-violet-100 hover:border-violet-200 bg-violet-50/50 hover:bg-violet-50 px-1.5 py-0.5 rounded-lg transition"
                      title="Generate work email from name"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> Auto-Generate
                    </button>
                  </div>
                  <input 
                    type="email" 
                    required
                    value={newEmp.email}
                    onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="samuel.d@Fastigo X.io"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-500 font-medium text-xs">Account Password {isEditMode && <span className="text-[10px] text-slate-400 font-medium">(Optional for Edit)</span>} *</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] font-bold text-violet-600 hover:text-violet-750 flex items-center gap-0.5 border border-violet-100 hover:border-violet-200 bg-violet-50/50 hover:bg-violet-50 px-1.5 py-0.5 rounded-lg transition"
                      title="Generate secure password"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Generate Secure
                    </button>
                  </div>
                  <input 
                    type="text" 
                    required={!isEditMode}
                    value={newEmp.password || ''}
                    onChange={e => setNewEmp({...newEmp, password: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder={isEditMode ? "••••••••" : "Temporary Login Password"}
                  />
                </div>
              </div>

              {newEmp.email && newEmp.password && (
                <div className="p-3 bg-violet-50/70 dark:bg-slate-900/60 border border-violet-100/80 dark:border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 text-xs animate-pulse-subtle">
                  <div className="min-w-0">
                    <span className="font-extrabold text-violet-800 dark:text-violet-400 block mb-0.5 uppercase tracking-wider text-[9px]">Credentials Ready</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-450 block truncate font-medium">
                      Email: <strong className="text-slate-700 dark:text-white font-bold">{newEmp.email}</strong> • Password: <strong className="text-slate-700 dark:text-white font-bold">{newEmp.password}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-650 hover:bg-violet-700 text-white text-[10px] font-bold rounded-xl transition shadow-sm shrink-0"
                  >
                    <Copy className="w-3 h-3" /> Copy Onboarding Note
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500 font-medium text-xs">Phone Number</label>
                  <input 
                    type="text" 
                    value={newEmp.phone}
                    onChange={e => setNewEmp({...newEmp, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-medium text-xs">Staff ID (Auto-Gen)</label>
                  <input 
                    type="text" 
                    value={newEmp.empId}
                    onChange={e => setNewEmp({...newEmp, empId: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. WS-88402"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500 font-medium text-xs">Hub Location</label>
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
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[200px]">
                        {typeof newEmp.prevRelievingDoc === 'string' ? 'Experience Doc (Hosted)' : newEmp.prevRelievingDoc.name}
                      </div>
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

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block mb-1 text-slate-500">Aadhaar National ID</label>
                  <input 
                    type="text" 
                    value={newEmp.aadhaarNumber}
                    onChange={e => setNewEmp({...newEmp, aadhaarNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    placeholder="e.g. 5204 8839 1024"
                  />
                </div>
              </div>

              {/* Aadhaar and PAN Card Document Uploads */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block mb-1 text-slate-500">Aadhaar Card Document</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 transition-all text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[110px]">
                    {newEmp.aadhaarCardDoc ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                        <CheckCircle2 className="w-7 h-7 text-violet-500 animate-bounce" />
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[140px]">
                          {typeof newEmp.aadhaarCardDoc === 'string' ? 'Aadhaar Card (Hosted)' : newEmp.aadhaarCardDoc.name}
                        </div>
                        <button 
                          type="button" 
                          onClick={removeAadhaarDoc}
                          className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 px-2 py-0.5 rounded-lg transition"
                        >
                          <X className="w-2.5 h-2.5" /> Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                        <div className="text-slate-500 text-[9px] font-semibold">Drag & drop or <span className="text-violet-600 underline">browse</span> for Aadhaar Card</div>
                        <input 
                          type="file" 
                          onChange={handleAadhaarUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500">PAN Card Document</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 transition-all text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[110px]">
                    {newEmp.panCardDoc ? (
                      <div className="flex flex-col items-center justify-center gap-1.5 w-full">
                        <CheckCircle2 className="w-7 h-7 text-violet-500 animate-bounce" />
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[140px]">
                          {typeof newEmp.panCardDoc === 'string' ? 'PAN Card (Hosted)' : newEmp.panCardDoc.name}
                        </div>
                        <button 
                          type="button" 
                          onClick={removePanCardDoc}
                          className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 px-2 py-0.5 rounded-lg transition"
                        >
                          <X className="w-2.5 h-2.5" /> Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                        <div className="text-slate-500 text-[9px] font-semibold">Drag & drop or <span className="text-violet-600 underline">browse</span> for PAN Card</div>
                        <input 
                          type="file" 
                          onChange={handlePanCardUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                      </>
                    )}
                  </div>
                </div>
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
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-350 truncate max-w-[200px]">
                        {typeof newEmp.prevSalarySlip === 'string' ? 'Salary Slip (Hosted)' : newEmp.prevSalarySlip.name}
                      </div>
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
                  className="px-4 py-2 bg-violet-650 text-white rounded-xl font-bold shadow-md shadow-violet-555/10"
                >
                  Next: Career →
                </button>
              )}

              {activeFormTab === 'previous' && (
                <button 
                  type="button" 
                  onClick={() => setActiveFormTab('payroll')}
                  className="px-4 py-2 bg-violet-650 text-white rounded-xl font-bold shadow-md shadow-violet-555/10"
                >
                  Next: Payroll →
                </button>
              )}

              {activeFormTab === 'payroll' && (
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl shadow-md shadow-violet-600/10 font-bold"
                >
                  {isEditMode ? "Save Changes" : "Confirm Member"}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteConfirmOpen} 
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setEmpToDelete(null);
        }} 
        title="Confirm Profile Deletion"
      >
        {empToDelete && (
          <div className="space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-350">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 rounded-xl text-rose-700 flex items-start gap-2.5">
              <span className="text-sm">⚠️</span>
              <div>
                <p className="font-bold">Irreversible Action Warning</p>
                <p className="mt-0.5 text-[10px] font-medium leading-relaxed">
                  You are about to permanently delete the employee roster record for <span className="font-extrabold">{empToDelete.name}</span> (ID: {empToDelete.empId || 'N/A'}). All linked attendance metrics and historical access logs will no longer sync under this active account credentials.
                </p>
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-500 text-center py-1">
              Are you sure you want to permanently delete this profile from the organizational roster registry database?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
              <button 
                type="button" 
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setEmpToDelete(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 font-bold transition text-slate-750 dark:text-slate-350"
              >
                No, Keep Profile
              </button>
              <button 
                type="button" 
                onClick={() => {
                  deleteEmployee(empToDelete.id, triggerToast);
                  setIsDeleteConfirmOpen(false);
                  setEmpToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-750 text-white rounded-xl font-bold transition shadow-md shadow-rose-650/10"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
