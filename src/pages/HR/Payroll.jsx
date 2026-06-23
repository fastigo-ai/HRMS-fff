import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  UploadCloud, 
  FileSpreadsheet, 
  Eye, 
  Printer, 
  X 
} from 'lucide-react';
import DataTable from '../../shared/ui/DataTable';
import StatusBadge from '../../shared/ui/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';
import AttendanceCalendar from '../../components/HR/AttendanceCalendar';
import { DatabaseService } from '../../services/api';

// Number-to-words helper
function numberToWords(num) {
  if (!num || isNaN(num)) return 'Zero';
  
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function g(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }
  
  function h(n) {
    if (n < 100) return g(n);
    const remainder = n % 100;
    return a[Math.floor(n / 100)] + ' Hundred' + (remainder ? ' and ' + g(remainder) : '');
  }
  
  function convert(n) {
    if (n < 1000) return h(n);
    if (n < 100000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      return h(thousands) + ' Thousand' + (remainder ? ' ' + h(remainder) : '');
    }
    if (n < 10000000) {
      const lakhs = Math.floor(n / 100000);
      const remainder = n % 100000;
      return h(lakhs) + ' Lakh' + (remainder ? ' ' + convert(remainder) : '');
    }
    const crores = Math.floor(n / 10000000);
    const remainder = n % 10000000;
    return h(crores) + ' Crore' + (remainder ? ' ' + convert(remainder) : '');
  }
  
  return convert(num).trim();
}

export default function Payroll({ triggerToast, hrEmployees = [] }) {
  const [ledgerPayslips, setLedgerPayslips] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('Fastigo X Technologies Inc.');
  const [companyAddress, setCompanyAddress] = useState('882 Park Boulevard, Suite 100');
  const [companyCity, setCompanyCity] = useState('San Francisco, CA');
  const [companyPincode, setCompanyPincode] = useState('94103');
  const [companyCountry, setCompanyCountry] = useState('India');
  const [logoPreview, setLogoPreview] = useState(null);

  // Generate pay period options dynamically (current month + past 5 months)
  const payPeriodOptions = (() => {
    const options = [];
    const now = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodStr = `${months[d.getMonth()]} ${d.getFullYear()}`;
      options.push(periodStr);
    }
    return options;
  })();

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [payPeriod, setPayPeriod] = useState(payPeriodOptions[0] || 'June 2026');
  const [paidDays, setPaidDays] = useState(30);
  const [lopDays, setLopDays] = useState(0);
  
  // Default payDate to today's date formatted as YYYY-MM-DD
  const [payDate, setPayDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [customFields, setCustomFields] = useState([]);

  const [basicSalary, setBasicSalary] = useState(0);
  const [hraAllowance, setHraAllowance] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [customEarnings, setCustomEarnings] = useState([]);
  const [customDeductions, setCustomDeductions] = useState([]);
  const [providentFund, setProvidentFund] = useState(0);

  // Attendance Metrics State
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [workingDays, setWorkingDays] = useState(30);
  const [presentDays, setPresentDays] = useState(30);
  const [absentDays, setAbsentDays] = useState(0);
  const [isBeforeJoining, setIsBeforeJoining] = useState(false);
  const [currentEmployeeLogs, setCurrentEmployeeLogs] = useState([]);

  // Parse Month Period string (e.g. "May 2026") into year and month
  const parsePayPeriod = (periodStr) => {
    const parts = periodStr.split(' ');
    if (parts.length === 2) {
      const monthName = parts[0];
      const year = parseInt(parts[1], 10);
      const months = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
      };
      const month = months[monthName];
      if (month && year) {
        return { year, month };
      }
    }
    return null;
  };

  const [companySettings, setCompanySettings] = useState(null);

  const isWorkingDay = (date, saturdayRule = '5-day') => {
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
    if (dayOfWeek === 0) return false; // Sunday is always off
    if (dayOfWeek === 6) { // Saturday
      if (saturdayRule === '5-day') return false;
      if (saturdayRule === '6-day') return true;
      if (saturdayRule === '2nd-4th-off') {
        const day = date.getDate();
        const isSecondSaturday = day >= 8 && day <= 14;
        const isFourthSaturday = day >= 22 && day <= 28;
        return !(isSecondSaturday || isFourthSaturday);
      }
    }
    return true; // Mon-Fri
  };

  // Calculate required working days in a month
  const getWorkingDaysInMonth = (year, month, saturdayRule = '5-day') => {
    const numDays = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month - 1, day);
      if (isWorkingDay(date, saturdayRule)) {
        workingDays++;
      }
    }
    return workingDays;
  };

  // Calculate working days starting from a specific day of the month
  const getWorkingDaysFromDateInMonth = (year, month, fromDay, saturdayRule = '5-day') => {
    const numDays = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let day = fromDay; day <= numDays; day++) {
      const date = new Date(year, month - 1, day);
      if (isWorkingDay(date, saturdayRule)) {
        workingDays++;
      }
    }
    return workingDays;
  };

  // Safe base salary fetch with position/role fallbacks
  const getBaseSalary = (emp) => {
    if (!emp) return 0;
    const salaryVal = parseFloat(emp.joiningSalary);
    if (!isNaN(salaryVal) && salaryVal > 0) {
      return salaryVal;
    }
    if (emp.role === 'hr_admin') return 95000;
    if (emp.role === 'manager') return 120000;
    return 85000;
  };

  // Load all corporate disbursements, attendance and company details on mount
  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const data = await DatabaseService.getHRPayrollAll();
      setLedgerPayslips(data || []);
      const logs = await DatabaseService.getHRAttendanceLogsAll();
      setAttendanceLogs(logs || []);
      const comp = await DatabaseService.getCompanyDetails();
      setCompanySettings(comp);
    } catch (err) {
      console.error('Failed to load payroll ledger, attendance or company settings:', err);
    }
  };

  // Find matching employee details
  const currentEmp = hrEmployees.find(e => e.id === selectedEmpId);

  // Auto-populate when Employee or Pay Period changes
  useEffect(() => {
    if (!selectedEmpId) {
      setWorkingDays(30);
      setPresentDays(30);
      setAbsentDays(0);
      setPaidDays(30);
      setLopDays(0);
      setBasicSalary(0);
      setHraAllowance(0);
      setIncomeTax(0);
      setProvidentFund(0);
      setIsBeforeJoining(false);
      return;
    }

    const emp = hrEmployees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    // Resolve employee join date properties
    const joinDateObj = emp.joinDate ? new Date(emp.joinDate) : new Date();
    const joinYear = joinDateObj.getFullYear();
    const joinMonth = joinDateObj.getMonth() + 1; // 1-based
    const joinDay = joinDateObj.getDate();

    const parsed = parsePayPeriod(payPeriod);
    if (parsed) {
      const { year, month } = parsed;
      
      // Check if the selected month is before the employee's joining month
      const beforeJoining = (year < joinYear || (year === joinYear && month < joinMonth));
      const isJoiningMonth = (year === joinYear && month === joinMonth);

      setIsBeforeJoining(beforeJoining);

      if (beforeJoining) {
        setWorkingDays(0);
        setPresentDays(0);
        setAbsentDays(0);
        setPaidDays(0);
        setLopDays(0);
        setBasicSalary(0);
        setHraAllowance(0);
        setIncomeTax(0);
        setProvidentFund(0);
        return;
      }

      const saturdayRule = companySettings?.saturdayRule || '5-day';
      const fullMonthWorkingDays = getWorkingDaysInMonth(year, month, saturdayRule);
      let calculatedWorkingDays = fullMonthWorkingDays;

      if (isJoiningMonth) {
        // Only count working days from the day they joined
        calculatedWorkingDays = getWorkingDaysFromDateInMonth(year, month, joinDay, saturdayRule);
      }

      // Filter raw logs for selected employee & period
      const employeeLogs = attendanceLogs.filter(log => {
        const empId = log.employee?._id || log.employee?.id || log.employee;
        if (empId !== selectedEmpId) return false;
        
        if (!log.date) return false;
        const parts = log.date.split('-');
        if (parts.length !== 3) return false;
        const logYear = parseInt(parts[0], 10);
        const logMonth = parseInt(parts[1], 10);
        const logDay = parseInt(parts[2], 10);
        
        if (logYear !== year || logMonth !== month) return false;

        // In joining month, ignore logs prior to joining date
        if (isJoiningMonth && logDay < joinDay) return false;
        
        return true;
      });

      setCurrentEmployeeLogs(employeeLogs);

      let calculatedPresentDays = 0;
      let calculatedAbsentDays = 0;

      const now = new Date();
      const isCurrentMonth = (year === now.getFullYear() && month === now.getMonth() + 1);

      if (isCurrentMonth) {
        const startDay = isJoiningMonth ? joinDay : 1;
        const limitDay = Math.min(now.getDate(), new Date(year, month, 0).getDate());

        let weekdaysUpToToday = 0;
        for (let d = startDay; d <= limitDay; d++) {
          const date = new Date(year, month - 1, d);
          if (isWorkingDay(date, saturdayRule)) {
            weekdaysUpToToday++;
          }
        }

        calculatedWorkingDays = weekdaysUpToToday;

        if (employeeLogs.length > 0 || isJoiningMonth) {
          const actualPresent = employeeLogs.filter(log => log.status === 'Present' || log.status === 'Late').length;
          calculatedPresentDays = actualPresent;
          calculatedAbsentDays = Math.max(0, calculatedWorkingDays - actualPresent);
        } else {
          // No logs, assume present for the days passed
          calculatedPresentDays = calculatedWorkingDays;
          calculatedAbsentDays = 0;
        }
      } else {
        if (employeeLogs.length > 0 || isJoiningMonth) {
          calculatedPresentDays = employeeLogs.filter(log => log.status === 'Present' || log.status === 'Late').length;
          calculatedAbsentDays = Math.max(0, calculatedWorkingDays - calculatedPresentDays);
        } else {
          calculatedPresentDays = calculatedWorkingDays;
          calculatedAbsentDays = 0;
        }
      }

      setWorkingDays(calculatedWorkingDays);
      setPresentDays(calculatedPresentDays);
      setAbsentDays(calculatedAbsentDays);

      setPaidDays(calculatedPresentDays);
      setLopDays(calculatedAbsentDays);

      const baseSalary = getBaseSalary(emp);
      let baseBasic = baseSalary * 0.7;
      let baseHra = baseSalary * 0.3;
      let basePf = baseBasic * 0.12;

      if (emp.salaryBreakup && emp.salaryBreakup.basic) {
        baseBasic = Number(emp.salaryBreakup.basic) || 0;
        baseHra = Number(emp.salaryBreakup.hra) || 0;
        basePf = Number(emp.salaryBreakup.pf) || 0;
      }

      const prorationFactor = calculatedPresentDays / fullMonthWorkingDays;

      const calculatedBasic = Math.round(baseBasic * prorationFactor);
      const calculatedHra = Math.round(baseHra * prorationFactor);
      const calculatedPf = Math.round(basePf * prorationFactor);
      const annualBaseSalary = baseSalary > 0 ? baseSalary * 12 : (baseBasic + baseHra) * 12;
      const calculatedTax = annualBaseSalary > 1270000 ? Math.round((calculatedBasic + calculatedHra) * 0.15) : 0;

      setBasicSalary(calculatedBasic);
      setHraAllowance(calculatedHra);
      setProvidentFund(calculatedPf);
      setIncomeTax(calculatedTax);
    }
  }, [selectedEmpId, payPeriod, attendanceLogs, hrEmployees, companySettings]);

  // Handle manual input updates for Paid Days & recalculate salary
  const handlePaidDaysChange = (val) => {
    setPaidDays(val);
    const calculatedLop = Math.max(0, workingDays - val);
    setLopDays(calculatedLop);
    
    const saturdayRule = companySettings?.saturdayRule || '5-day';
    const fullMonthWorkingDays = getWorkingDaysInMonth(
      parsePayPeriod(payPeriod)?.year || 2026,
      parsePayPeriod(payPeriod)?.month || 5,
      saturdayRule
    ) || 30;

    if (currentEmp && fullMonthWorkingDays > 0) {
      const baseSalary = getBaseSalary(currentEmp);
      let baseBasic = baseSalary * 0.7;
      let baseHra = baseSalary * 0.3;
      let basePf = baseBasic * 0.12;

      if (currentEmp.salaryBreakup && currentEmp.salaryBreakup.basic) {
        baseBasic = Number(currentEmp.salaryBreakup.basic) || 0;
        baseHra = Number(currentEmp.salaryBreakup.hra) || 0;
        basePf = Number(currentEmp.salaryBreakup.pf) || 0;
      }

      const prorationFactor = val / fullMonthWorkingDays;

      const calculatedBasic = Math.round(baseBasic * prorationFactor);
      const calculatedHra = Math.round(baseHra * prorationFactor);
      const calculatedPf = Math.round(basePf * prorationFactor);
      const annualBaseSalary = baseSalary > 0 ? baseSalary * 12 : (baseBasic + baseHra) * 12;
      const calculatedTax = annualBaseSalary > 1270000 ? Math.round((calculatedBasic + calculatedHra) * 0.15) : 0;

      setBasicSalary(calculatedBasic);
      setHraAllowance(calculatedHra);
      setProvidentFund(calculatedPf);
      setIncomeTax(calculatedTax);
    }
  };

  // Handle manual input updates for Loss of Pay Days & recalculate salary
  const handleLopDaysChange = (val) => {
    setLopDays(val);
    const calculatedPaidDays = Math.max(0, workingDays - val);
    setPaidDays(calculatedPaidDays);
    
    const saturdayRule = companySettings?.saturdayRule || '5-day';
    const fullMonthWorkingDays = getWorkingDaysInMonth(
      parsePayPeriod(payPeriod)?.year || 2026,
      parsePayPeriod(payPeriod)?.month || 5,
      saturdayRule
    ) || 30;

    if (currentEmp && fullMonthWorkingDays > 0) {
      const baseSalary = getBaseSalary(currentEmp);
      let baseBasic = baseSalary * 0.7;
      let baseHra = baseSalary * 0.3;
      let basePf = baseBasic * 0.12;

      if (currentEmp.salaryBreakup && currentEmp.salaryBreakup.basic) {
        baseBasic = Number(currentEmp.salaryBreakup.basic) || 0;
        baseHra = Number(currentEmp.salaryBreakup.hra) || 0;
        basePf = Number(currentEmp.salaryBreakup.pf) || 0;
      }

      const prorationFactor = calculatedPaidDays / fullMonthWorkingDays;

      const calculatedBasic = Math.round(baseBasic * prorationFactor);
      const calculatedHra = Math.round(baseHra * prorationFactor);
      const calculatedPf = Math.round(basePf * prorationFactor);
      const annualBaseSalary = baseSalary > 0 ? baseSalary * 12 : (baseBasic + baseHra) * 12;
      const calculatedTax = annualBaseSalary > 1270000 ? Math.round((calculatedBasic + calculatedHra) * 0.15) : 0;

      setBasicSalary(calculatedBasic);
      setHraAllowance(calculatedHra);
      setProvidentFund(calculatedPf);
      setIncomeTax(calculatedTax);
    }
  };

  // Dynamic aggregates
  const grossEarnings = Number(basicSalary) + Number(hraAllowance) + 
    customEarnings.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const taxWithheld = Number(incomeTax);

  const totalDeductions = taxWithheld + Number(providentFund) + 
    customDeductions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const netPayable = grossEarnings - totalDeductions;

  // Add field helpers
  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleAddEarning = () => {
    setCustomEarnings([...customEarnings, { label: '', amount: 0 }]);
  };

  const handleRemoveEarning = (index) => {
    setCustomEarnings(customEarnings.filter((_, i) => i !== index));
  };

  const handleAddDeduction = () => {
    setCustomDeductions([...customDeductions, { label: '', amount: 0 }]);
  };

  const handleRemoveDeduction = (index) => {
    setCustomDeductions(customDeductions.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedEmpId('');
    setPayPeriod(payPeriodOptions[0] || 'June 2026');
    setPaidDays(30);
    setLopDays(0);
    setWorkingDays(30);
    setPresentDays(30);
    setAbsentDays(0);
    setIsBeforeJoining(false);
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setPayDate(`${year}-${month}-${day}`);
    
    setCustomFields([]);
    setBasicSalary(0);
    setHraAllowance(0);
    setIncomeTax(0);
    setCustomEarnings([]);
    setCustomDeductions([]);
    setProvidentFund(0);
    setLogoPreview(null);
    triggerToast('Payslip generator form reset to system defaults.');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        triggerToast('Logo size exceeds the maximum limit of 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        triggerToast('Logo uploaded successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      triggerToast('Please select a target employee to disburse salary!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        employeeName: currentEmp.name,
        period: payPeriod,
        baseSalary: grossEarnings,
        taxWithheld: totalDeductions, // pass totalDeductions so saved netPay aligns with netPayable
        basic: basicSalary,
        hra: hraAllowance,
        providentFund: providentFund,
        incomeTax: incomeTax,
        customEarnings: customEarnings,
        customDeductions: customDeductions
      };
      
      const newSlip = await DatabaseService.disbursePayslip(payload);
      triggerToast(`Payslip generated and disbursed successfully for ${currentEmp.name}!`);
      
      // Refresh corporate ledger and reset form
      fetchLedger();
      handleReset();
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Failed to disburse payslip.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DataTable columns for Disbursement Ledger
  const columns = [
    { 
      header: 'Employee Profile', 
      field: 'employee', 
      className: 'font-bold text-slate-800 dark:text-white',
      render: (emp) => (
        <div>
          <h4 className="text-xs font-bold leading-tight">{emp?.name || 'Unknown'}</h4>
          <span className="text-[9px] text-slate-400 font-semibold">{emp?.position || 'N/A'} • {emp?.department || 'N/A'}</span>
        </div>
      )
    },
    { header: 'Period', field: 'period', className: 'font-bold text-slate-500 text-xs' },
    { 
      header: 'Gross Earnings', 
      field: 'baseSalary', 
      className: 'font-extrabold text-slate-800 dark:text-slate-100 text-xs',
      render: (val) => `₹${val.toLocaleString('en-IN')}`
    },
    { 
      header: 'Tax Withheld', 
      field: 'taxWithheld', 
      className: 'font-semibold text-rose-500 text-xs',
      render: (val) => `₹${val.toLocaleString('en-IN')}`
    },
    { 
      header: 'Net Disbursed', 
      field: 'netPay', 
      className: 'font-extrabold text-indigo-600 dark:text-indigo-400 text-xs',
      render: (val) => `₹${val.toLocaleString('en-IN')}`
    },
    {
      header: 'Clearance Status',
      field: 'status',
      render: (val) => <StatusBadge status={val === 'Disbursed' ? 'Completed' : 'Pending'} />
    },
    {
      header: 'Actions',
      field: '_id',
      className: 'text-right',
      render: (id, row) => (
        <div className="flex justify-end gap-1.5">
          <button 
            onClick={() => setSelectedSlip(row)}
            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[10px] font-bold rounded-lg transition"
            title="Audit Printable Slip"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Print styles injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide main container & layout wrappers entirely */
          body * {
            visibility: hidden;
          }
          /* Target only the printable modal overlay and card content */
          .printable-modal-overlay, .printable-modal-overlay *, .printable-modal-card, .printable-modal-card * {
            visibility: visible;
          }
          .printable-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-modal-card {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      ` }} />

      <PageHeader 
        title="Compensation & Corporate Payroll" 
        description="Configure employee earnings/deductions, automatically calculate withholding structures, and securely disburse salary slips."
      />

      {/* Payslip Creator Blueprint Layout */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Creator Header Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-slate-900">
          
          {/* Logo container */}
          <div className="flex items-center gap-4">
            <label className="relative flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden transition">
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <UploadCloud className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold">Upload Logo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Company Corporate Logo</h4>
              <p className="text-[9px] text-slate-400 mt-1 max-w-[200px]">
                240 x 240 pixels @ 72 DPI, Maximum size of 1MB.
              </p>
            </div>
          </div>

          {/* Letterhead address */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Company Name*</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter the Company's name"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="col-span-2">
              <input 
                type="text" 
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Company Address"
                className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <input 
                type="text" 
                value={companyCity}
                onChange={(e) => setCompanyCity(e.target.value)}
                placeholder="City, Pincode"
                className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <input 
                type="text" 
                value={companyCountry}
                onChange={(e) => setCompanyCountry(e.target.value)}
                placeholder="India"
                className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

        </div>

        {/* Employee Pay Summary Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Employee Pay Summary *</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            
            {/* Left Col inputs */}
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-450 block mb-1">Employee Name</label>
                <select 
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-semibold cursor-pointer"
                >
                  <option value="">-- Choose employee or manager --</option>
                  {hrEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role === 'manager' ? 'Manager' : emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Pay Period</label>
                  <select 
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white cursor-pointer font-medium"
                  >
                    {payPeriodOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Paid Days</label>
                  <input 
                    type="number" 
                    value={paidDays}
                    onChange={(e) => handlePaidDaysChange(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Col inputs */}
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-500 block mb-1">Employee ID</label>
                <input 
                  type="text" 
                  value={currentEmp ? currentEmp.empId : 'Eg: 1234'}
                  readOnly
                  placeholder="Auto-populated Staff ID"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Loss of Pay Days</label>
                  <input 
                    type="number" 
                    value={lopDays}
                    onChange={(e) => handleLopDaysChange(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Pay Date</label>
                  <input 
                    type="date" 
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-855 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Calculated Attendance Metrics Dashboard */}
          {selectedEmpId && (
            isBeforeJoining ? (
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 rounded-2xl flex items-center justify-center text-center">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-450">
                  ⚠️ Pay Period is before Employee's Joining Month (Joined: {currentEmp?.joinDate ? new Date(currentEmp.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'})
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-150/50 dark:border-indigo-900/30 rounded-2xl">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Total Working Days</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{workingDays}</span>
                </div>
                <div className="text-center border-x border-slate-200/60 dark:border-slate-800/60 font-semibold">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Days Present</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{presentDays}</span>
                </div>
                <div className="text-center font-semibold">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Days Absent</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1 block">{absentDays}</span>
                </div>
              </div>
            )
          )}

          {selectedEmpId && !isBeforeJoining && parsePayPeriod(payPeriod) && (
            <AttendanceCalendar 
              year={parsePayPeriod(payPeriod).year}
              month={parsePayPeriod(payPeriod).month}
              employeeLogs={currentEmployeeLogs}
              joinDate={currentEmp?.joinDate}
              saturdayRule={companySettings?.saturdayRule}
            />
          )}

          {/* Interactive custom pay fields */}
          <div className="space-y-2.5">
            {customFields.map((fld, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Custom Label (e.g. Bank Route)" 
                  value={fld.key}
                  onChange={(e) => {
                    const next = [...customFields];
                    next[idx].key = e.target.value;
                    setCustomFields(next);
                  }}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                />
                <input 
                  type="text" 
                  placeholder="Value" 
                  value={fld.value}
                  onChange={(e) => {
                    const next = [...customFields];
                    next[idx].value = e.target.value;
                    setCustomFields(next);
                  }}
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs flex-1"
                />
                <button onClick={() => handleRemoveCustomField(idx)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={handleAddCustomField}
              className="text-xs font-bold text-indigo-650 hover:text-indigo-800 flex items-center gap-1 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another field
            </button>
          </div>

        </div>

        {/* Income Details Table Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Income Details *</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Earnings inputs */}
            <div className="border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 font-bold text-slate-550 dark:text-slate-350">
                    <th className="p-2.5 text-left w-2/3">Earnings</th>
                    <th className="p-2.5 text-right w-1/3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-600">Basic</td>
                    <td className="p-2 text-right">
                      <input 
                        type="number" 
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(Number(e.target.value))}
                        className="w-24 text-right px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded text-slate-800 dark:text-white font-bold"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-600">House Rent Allowance</td>
                    <td className="p-2 text-right">
                      <input 
                        type="number" 
                        value={hraAllowance}
                        onChange={(e) => setHraAllowance(Number(e.target.value))}
                        className="w-24 text-right px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded text-slate-800 dark:text-white font-bold"
                      />
                    </td>
                  </tr>
                  {customEarnings.map((earn, idx) => (
                    <tr key={idx}>
                      <td className="p-2 flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Special Bonus"
                          value={earn.label}
                          onChange={(e) => {
                            const next = [...customEarnings];
                            next[idx].label = e.target.value;
                            setCustomEarnings(next);
                          }}
                          className="px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded"
                        />
                        <button onClick={() => handleRemoveEarning(idx)} className="p-0.5 text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="p-2 text-right">
                        <input 
                          type="number" 
                          value={earn.amount}
                          onChange={(e) => {
                            const next = [...customEarnings];
                            next[idx].amount = Number(e.target.value);
                            setCustomEarnings(next);
                          }}
                          className="w-24 text-right px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded font-bold"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20 font-bold text-slate-800 dark:text-slate-100">
                    <td className="p-2.5">
                      <button 
                        onClick={handleAddEarning}
                        className="text-xs text-indigo-650 hover:text-indigo-800 flex items-center gap-1 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Earnings
                      </button>
                    </td>
                    <td className="p-2.5 text-right font-extrabold text-slate-900 dark:text-white">
                      ₹{grossEarnings.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions inputs */}
            <div className="border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 font-bold text-slate-550 dark:text-slate-350">
                    <th className="p-2.5 text-left w-2/3">Deductions</th>
                    <th className="p-2.5 text-right w-1/3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-600 flex items-center gap-2">
                      Income Tax
                    </td>
                    <td className="p-2 text-right">
                      <input 
                        type="number" 
                        value={incomeTax}
                        onChange={(e) => setIncomeTax(Number(e.target.value))}
                        className="w-24 text-right px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded text-rose-650 text-rose-600 dark:text-rose-400 font-bold"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-600">Provident Fund</td>
                    <td className="p-2 text-right">
                      <input 
                        type="number" 
                        value={providentFund}
                        onChange={(e) => setProvidentFund(Number(e.target.value))}
                        className="w-24 text-right px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded text-slate-800 dark:text-white font-bold"
                      />
                    </td>
                  </tr>
                  {customDeductions.map((ded, idx) => (
                    <tr key={idx}>
                      <td className="p-2 flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Health Insurance"
                          value={ded.label}
                          onChange={(e) => {
                            const next = [...customDeductions];
                            next[idx].label = e.target.value;
                            setCustomDeductions(next);
                          }}
                          className="px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded"
                        />
                        <button onClick={() => handleRemoveDeduction(idx)} className="p-0.5 text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="p-2 text-right">
                        <input 
                          type="number" 
                          value={ded.amount}
                          onChange={(e) => {
                            const next = [...customDeductions];
                            next[idx].amount = Number(e.target.value);
                            setCustomDeductions(next);
                          }}
                          className="w-24 text-right px-2 py-0.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded font-bold"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20 font-bold text-slate-800 dark:text-slate-100">
                    <td className="p-2.5">
                      <button 
                        onClick={handleAddDeduction}
                        className="text-xs text-indigo-650 hover:text-indigo-800 flex items-center gap-1 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Deductions
                      </button>
                    </td>
                    <td className="p-2.5 text-right font-extrabold text-rose-600">
                      ₹{totalDeductions.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Net payable totals horizontal bar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900/80 rounded-2xl p-5 gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Total Net Payable</h4>
            <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">Gross Earnings - Total Deductions</span>
            <span className="text-[10px] italic text-indigo-600 font-semibold block mt-1">
              Amount in words: <strong className="text-slate-700 dark:text-slate-300 not-italic">{numberToWords(netPayable)} Indian Rupees Only</strong>
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">₹{netPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Form CTA Buttons */}
        <div className="flex items-center gap-3 justify-end pt-3">
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-300 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          
          <button 
            onClick={handleGeneratePayslip}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-450 rounded-xl transition shadow"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
            ) : (
              <CreditCard className="w-3.5 h-3.5" />
            )}
            Generate Payslip
          </button>
        </div>

      </div>

      {/* Disbursement Ledger Matrix Section */}
      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Disbursement Logs Matrix</h3>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded uppercase">
            Corporate Audited Logs
          </span>
        </div>
        
        {ledgerPayslips.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-xl">
            No payroll disbursements found in the corporate ledger.
          </div>
        ) : (
          <DataTable columns={columns} data={ledgerPayslips} />
        )}
      </div>

      {/* SECURE AUDIT PRINTABLE SLIP MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm printable-modal-overlay">
          <div className="relative bg-white text-slate-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto p-6 space-y-6 printable-modal-card">
            
            {/* Modal actions toolbar */}
            <div className="flex items-center justify-between border-b pb-3 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-slate-500">Secure Audit Voucher</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* THE PRINTABLE SLIP - SECURE LAYOUT */}
            <div id="printable-slip" className="bg-white p-2 text-slate-900">
              
              {/* Slip Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-8 h-8 object-cover rounded-lg" />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-extrabold">
                        W
                      </div>
                    )}
                    <span className="text-lg font-black tracking-tight text-slate-900">{companyName}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                    {companyAddress}, {companyCity}, {companyPincode}<br />
                    Operational Country: {companyCountry}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest leading-none mb-1.5">Salary Pay Slip</h2>
                  <span className="text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">{selectedSlip.period}</span>
                </div>
              </div>

              {/* Employee & Disbursal info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs border-b border-slate-150 py-5">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Employee Name</span>
                  <span className="font-bold text-slate-800">{selectedSlip.employee?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Designation & Position</span>
                  <span className="font-bold text-slate-855">{selectedSlip.employee?.position || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Staff Identifier</span>
                  <span className="font-bold text-slate-855 tracking-wider font-mono text-[11px]">{selectedSlip.employee?.empId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Operational Department</span>
                  <span className="font-bold text-slate-855">{selectedSlip.employee?.department || 'N/A'}</span>
                </div>
              </div>

              {/* Bank & Payment Routing */}
              <div className="grid grid-cols-4 gap-4 text-xs border-b border-slate-150 py-5 bg-slate-50/50 px-2.5 rounded-lg my-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Corporate Bank</span>
                  <span className="font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.bankName || 'Silicon Valley Clearing Bank'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Account Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.accountNo || '•••• •••• 0000'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">IFSC Route Code</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.ifscCode || 'SVCB0008800'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">PAN Card Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.panNumber || 'XXAPJ0000F'}</span>
                </div>
              </div>

              {/* Earnings & Deductions Breakdowns */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs mt-5">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-2.5 text-left w-1/2">Earnings Breakdown</th>
                      <th className="p-2.5 text-right w-1/4 border-r border-slate-200">Amount (INR)</th>
                      <th className="p-2.5 text-left w-1/2">Deductions & Levies</th>
                      <th className="p-2.5 text-right w-1/4">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {(() => {
                      const slipBasic = Math.round(selectedSlip.baseSalary * 0.7);
                      const slipHra = selectedSlip.baseSalary - slipBasic;
                      const slipPF = Math.round(slipBasic * 0.12);
                      const slipTax = Math.max(0, selectedSlip.taxWithheld - slipPF);
                      return (
                        <>
                          <tr>
                            <td className="p-2.5 font-medium text-slate-600">Basic Salary (70%)</td>
                            <td className="p-2.5 text-right font-bold text-slate-800 border-r border-slate-200">₹{slipBasic.toLocaleString('en-IN')}</td>
                            <td className="p-2.5 font-medium text-slate-600">Income Tax (Withheld 15%)</td>
                            <td className="p-2.5 text-right font-bold text-rose-600">₹{slipTax.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-slate-600">House Rent Allowance (HRA 30%)</td>
                            <td className="p-2.5 text-right font-bold text-slate-800 border-r border-slate-200">₹{slipHra.toLocaleString('en-IN')}</td>
                            <td className="p-2.5 font-medium text-slate-600">Provident Fund (PF)</td>
                            <td className="p-2.5 text-right font-bold text-slate-800">₹{slipPF.toLocaleString('en-IN')}</td>
                          </tr>
                          {selectedSlip.deductionAmount > 0 && (
                            <tr>
                              <td className="p-2.5 font-medium text-slate-400 border-r border-slate-200" colSpan="2">
                                <span className="text-[10px] uppercase font-bold text-slate-450">Adjustment:</span> Leave-based Deductions applied
                              </td>
                              <td className="p-2.5 font-semibold text-rose-500">Unpaid Leaves ({selectedSlip.extraLeaves} day(s))</td>
                              <td className="p-2.5 text-right font-bold text-rose-600">₹{selectedSlip.deductionAmount.toLocaleString('en-IN')}</td>
                            </tr>
                          )}
                          <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-800">
                            <td className="p-2.5">Gross Total Earnings</td>
                            <td className="p-2.5 text-right border-r border-slate-200">₹{selectedSlip.baseSalary.toLocaleString('en-IN')}</td>
                            <td className="p-2.5">Total Deductions Outflow</td>
                            <td className="p-2.5 text-right text-rose-600">₹{(selectedSlip.taxWithheld + (selectedSlip.deductionAmount || 0)).toLocaleString('en-IN')}</td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Net salary totals & spelling in words */}
              <div className="flex justify-between items-center border border-slate-250 bg-slate-900 text-white rounded-lg p-4.5 mt-5">
                <div>
                  <span className="text-[9px] font-semibold text-slate-350 uppercase block leading-none mb-1">Total Net Disbursed Salary</span>
                  <span className="text-xs text-slate-300 font-medium italic">
                    Amount in words: <strong className="text-white not-italic">{numberToWords(selectedSlip.netPay)} Indian Rupees Only</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-semibold text-slate-350 uppercase block leading-none mb-1">Direct Bank Clearing</span>
                  <span className="text-2xl font-black text-white tracking-tight">₹{selectedSlip.netPay.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Signature zones & generation disclaimers */}
              <div className="flex justify-between items-end pt-12 text-[10px] text-slate-400">
                <div className="w-48 text-center border-t border-dashed border-slate-300 pt-1.5 font-semibold">
                  Employee Signature
                </div>
                <div className="max-w-xs text-center leading-relaxed italic text-[9px] px-4 text-slate-350">
                  This document is securely signed electronically. It is computer-generated and does not require a physical corporate stamp or signature to confirm validity.
                </div>
                <div className="w-48 text-center border-t border-dashed border-slate-300 pt-1.5 font-semibold text-slate-650">
                  Sarah Jenkins<br />
                  <span className="text-[8px] uppercase tracking-wider font-bold text-slate-450 block">Authorized HR Signatory</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
