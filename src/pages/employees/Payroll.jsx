import React, { useState } from 'react';
import {
  IndianRupee,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Percent
} from 'lucide-react';

export default function Payroll({
  profileData,
  triggerToast
}) {
  const [downloadingPayslip, setDownloadingPayslip] = useState(null);

  const mockSalary = {
    basic: 65000,
    hra: 24000,
    allowances: 12000,
    pf: 7800,
    tax: 11200,
    insurance: 1500
  };

  const netSalary = (mockSalary.basic + mockSalary.hra + mockSalary.allowances) - (mockSalary.pf + mockSalary.tax + mockSalary.insurance);

  const mockPayslips = [
    { month: 'April 2026', filename: 'Payslip_Apr_2026.pdf', date: '30 Apr 2026' },
    { month: 'March 2026', filename: 'Payslip_Mar_2026.pdf', date: '31 Mar 2026' },
    { month: 'February 2026', filename: 'Payslip_Feb_2026.pdf', date: '28 Feb 2026' },
  ];

  const handleDownload = (filename) => {
    setDownloadingPayslip(filename);
    setTimeout(() => {
      setDownloadingPayslip(null);
      triggerToast(`Completed secure download of ${filename}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Earnings Card */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Gross Earnings</span>
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₹1,01,000</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">/ month</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">Sum of Basic, HRA & allowances</p>
        </div>

        {/* Deductions Card */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Total Deductions</span>
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-rose-600">₹20,500</span>
            <span className="text-xs text-rose-500 font-bold ml-2">/ month</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">Sum of PF, taxes & insurance</p>
        </div>

        {/* Net Take-home Card */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Net Take-Home</span>
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{netSalary.toLocaleString('en-IN')}</span>
            <span className="text-xs text-indigo-500 font-bold ml-2">/ month</span>
          </div>
          <p className="text-[10px] text-indigo-600 font-semibold mt-2">Direct bank clearing amount</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: salary breakdown table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Earnings & Deductions Matrix</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Earnings column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg uppercase tracking-wider text-center">Earnings</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Basic Salary</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{mockSalary.basic.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">HRA Allowance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{mockSalary.hra.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Travel & Special Allowances</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{mockSalary.allowances.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Deductions column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg uppercase tracking-wider text-center">Deductions</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">PF Contribution</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{mockSalary.pf.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Income Tax (Withheld)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{mockSalary.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Health Insurance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{mockSalary.insurance.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Payslips vault */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Payslips Download Vault</h3>
          
          <div className="space-y-3">
            {mockPayslips.map((payslip, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-lg">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{payslip.month}</h4>
                    <span className="text-[9px] text-slate-400">{payslip.date}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDownload(payslip.filename)}
                  disabled={downloadingPayslip !== null}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                >
                  {downloadingPayslip === payslip.filename ? (
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin block"></span>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
