import React, { useState } from 'react';
import {
  IndianRupee,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Percent,
  Eye,
  Printer,
  X
} from 'lucide-react';

// Helper function to convert numeric salary to English words
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

export default function Payroll({
  payslips = [],
  profileData = {},
  triggerToast
}) {
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [downloadingPayslip, setDownloadingPayslip] = useState(null);

  // Get active payslip or fallback to joining salary from profile
  const latestPayslip = payslips && payslips.length > 0 ? payslips[0] : null;

  const ctc = Number(String(profileData?.joiningSalary || '0').replace(/[^0-9.]/g, ''));
  const breakup = profileData?.salaryBreakup && Object.keys(profileData.salaryBreakup).length > 0 && profileData.salaryBreakup.basic ? profileData.salaryBreakup : {
    basic: Math.round(ctc * 0.7),
    hra: Math.round(ctc * 0.3),
    pf: Math.round(ctc * 0.7 * 0.12),
    specialAllowance: 0,
    customFields: []
  };
  
  // Real breakdown from HR Profile DB (or HR default split)
  const salaryBasic = breakup.basic || 0;
  const salaryHra = breakup.hra || 0;
  const specialAllowance = breakup.specialAllowance || 0;
  const pfDeduction = breakup.pf || 0;

  const baseSalary = ctc;
  const totalDeductions = pfDeduction;
  const netPay = baseSalary - totalDeductions;

  const isNoData = ctc === 0;


  const handleDownloadClick = (slip) => {
    setDownloadingPayslip(slip._id);
    setTimeout(() => {
      setDownloadingPayslip(null);
      setSelectedSlip(slip);
      setTimeout(() => {
        window.print();
        triggerToast(`Exported payslip for ${slip.period} successfully.`);
      }, 300);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
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

      {/* Metrics breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Earnings Card */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Gross Earnings</span>
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{baseSalary.toLocaleString('en-IN')}</span>
            <span className="text-xs text-emerald-600 font-bold ml-2">/ yearly</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">Sum of Basic, HRA & Special Allowances</p>
        </div>

        {/* Deductions Card */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Total Deductions</span>
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-rose-600">₹{totalDeductions.toLocaleString('en-IN')}</span>
            <span className="text-xs text-rose-500 font-bold ml-2">/ yearly</span>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-2">Sum of Provident Fund & Statutory Deductions</p>
        </div>

        {/* Net Take-home Card */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Net Take-Home</span>
          <div className="flex items-baseline">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{netPay.toLocaleString('en-IN')}</span>
            <span className="text-xs text-indigo-500 font-bold ml-2">/ yearly</span>
          </div>
          <p className="text-[10px] text-indigo-600 font-semibold mt-2">Direct bank clearing amount</p>
        </div>

      </div>



      {isNoData && (
        <div className="flex items-start gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <span className="text-slate-400 shrink-0 mt-0.5">ℹ</span>
          <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            No salary data found for your profile. Please contact HR to ensure your joining salary and payroll details are configured in the system.
          </p>
        </div>
      )}

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
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{salaryBasic.toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">HRA Allowance</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{salaryHra.toLocaleString('en-IN')}</span>
                </div>
                {specialAllowance > 0 && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Special Allowance</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{specialAllowance.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions column */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-3 py-1.5 rounded-lg uppercase tracking-wider text-center">Deductions</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Income Tax (Withheld)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{(latestPayslip?.incomeTax || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Provident Fund (PF)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{pfDeduction.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Payslips vault */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Payslips Download Vault</h3>
          
          <div className="space-y-3">
            {payslips.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No payslips issued to your profile yet.
              </div>
            ) : (
              payslips.map((slip) => (
                <div key={slip._id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-lg">
                      <FileSpreadsheet className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{slip.period}</h4>
                      <span className="text-[9px] text-slate-400 font-medium">Net: ₹{slip.netPay.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setSelectedSlip(slip)}
                      className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                      title="View Slip Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDownloadClick(slip)}
                      disabled={downloadingPayslip !== null}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                      title="Print Slip PDF"
                    >
                      {downloadingPayslip === slip._id ? (
                        <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin block"></span>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* PROFESSIONAL SLIP POPUP MODAL */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm printable-modal-overlay">
          <div className="relative bg-white text-slate-950 dark:bg-white dark:text-slate-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 printable-modal-card">
            
            {/* Modal action toolbar */}
            <div className="flex items-center justify-between border-b pb-3 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secure Audit Voucher</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
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
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-extrabold">
                      W
                    </div>
                    <span className="text-lg font-black tracking-tight text-slate-900">Fastigo X Technologies Inc.</span>
                  </div>
                  <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                    882 Park Boulevard, Suite 100, San Francisco, California 94103<br />
                    Corporate Registry ID: C1029482-SF
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
                  <span className="font-bold text-slate-800">{selectedSlip.employee?.name || profileData.name || 'Alex Johnson'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Designation & Position</span>
                  <span className="font-bold text-slate-850">{selectedSlip.employee?.position || profileData.position || 'Senior Engineer'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Staff Identifier</span>
                  <span className="font-bold text-slate-850 tracking-wider font-mono text-[11px]">{selectedSlip.employee?.empId || profileData.empId || 'WS-88402'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Operational Department</span>
                  <span className="font-bold text-slate-850">{selectedSlip.employee?.department || profileData.department || 'SaaS Development'}</span>
                </div>
              </div>

              {/* Bank & Payment Routing */}
              <div className="grid grid-cols-4 gap-4 text-xs border-b border-slate-150 py-5 bg-slate-50/50 px-2.5 rounded-lg my-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Corporate Bank</span>
                  <span className="font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.bankName || profileData.bankDetails?.bankName || 'Silicon Valley Clearing Bank'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Account Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.accountNo || profileData.bankDetails?.accountNo || '•••• •••• 9840'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">IFSC Route Code</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.ifscCode || profileData.bankDetails?.ifscCode || 'SVCB0008842'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">PAN Card Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSlip.employee?.bankDetails?.panNumber || profileData.bankDetails?.panNumber || 'AAAPJ9082F'}</span>
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
                    <tr>
                      <td className="p-2.5 font-medium text-slate-600">Basic Salary</td>
                      <td className="p-2.5 text-right font-bold text-slate-800 border-r border-slate-200">₹{(selectedSlip.basic || salaryBasic).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 font-medium text-slate-600">Income Tax (Withheld)</td>
                      <td className="p-2.5 text-right font-bold text-rose-600">₹{(selectedSlip.incomeTax || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-600">House Rent Allowance (HRA)</td>
                      <td className="p-2.5 text-right font-bold text-slate-800 border-r border-slate-200">₹{(selectedSlip.hra || salaryHra).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 font-medium text-slate-600">Provident Fund (PF)</td>
                      <td className="p-2.5 text-right font-bold text-slate-800">₹{(selectedSlip.providentFund || pfDeduction).toLocaleString('en-IN')}</td>
                    </tr>
                    {(selectedSlip.specialAllowance) > 0 && (
                      <tr>
                        <td className="p-2.5 font-medium text-slate-600">Special Allowance</td>
                        <td className="p-2.5 text-right font-bold text-slate-800 border-r border-slate-200">₹{(selectedSlip.specialAllowance).toLocaleString('en-IN')}</td>
                        <td className="p-2.5 font-medium text-slate-600"></td>
                        <td className="p-2.5 text-right font-bold text-slate-800"></td>
                      </tr>
                    )}
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
                      <td className="p-2.5 text-right border-r border-slate-200">₹{(selectedSlip.basic ? selectedSlip.baseSalary : baseSalary).toLocaleString('en-IN')}</td>
                      <td className="p-2.5">Total Deductions Outflow</td>
                      <td className="p-2.5 text-right text-rose-600">₹{((selectedSlip.incomeTax || 0) + (selectedSlip.providentFund || 0) + (selectedSlip.deductionAmount || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net salary totals & spelling in words */}
              <div className="flex justify-between items-center border border-slate-250 bg-slate-900 text-white rounded-lg p-4.5 mt-5">
                <div>
                  <span className="text-[9px] font-semibold text-slate-350 uppercase block leading-none mb-1">Total Net Disbursed Salary</span>
                  <span className="text-xs text-slate-300 font-medium italic">
                    Amount in words: <strong className="text-white not-italic">{numberToWords(selectedSlip.basic || salaryBasic)} Indian Rupees Only</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-semibold text-slate-350 uppercase block leading-none mb-1">Direct Bank Clearing</span>
                  <span className="text-2xl font-black text-white tracking-tight">₹{(selectedSlip.basic || salaryBasic).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Signature zones & generation disclaimers */}
              <div className="flex justify-between items-end pt-12 text-[10px] text-slate-400">
                <div className="w-48 text-center border-t border-dashed border-slate-300 pt-1.5 font-semibold">
                  Employee Signature
                </div>
                <div className="max-w-xs text-center leading-relaxed italic text-[9px] px-4 text-slate-300">
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
