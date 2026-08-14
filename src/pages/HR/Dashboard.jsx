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
  PieChart,
  Megaphone,
  Trash2,
  Pin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Download,
  FileSpreadsheet,
  Eye,
  Printer,
  X
} from 'lucide-react';
import { DatabaseService } from '../../services/api';
import { hrService } from '../../services/hrService';

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

export default function HRDashboard({
  setCurrentTab,
  triggerToast,
  profileData,
  clockedIn,
  toggleClockInOut,
  elapsedTime,
  clockOutCompleted,
  leaveBalances,
  payslips = [],
  leaveHistory = [],
  applyLeave,
  attendanceStats,
  personalAttendance,
  notifications = []
}) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeDashboardTab, setActiveDashboardTab] = useState('org'); // 'org' | 'personal'
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [downloadingPayslip, setDownloadingPayslip] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'General',
    pinned: false
  });
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

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
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const data = await hrService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      triggerToast('Title and content are required!', 'error');
      return;
    }
    setPostingAnnouncement(true);
    try {
      await hrService.createAnnouncement(newAnnouncement);
      triggerToast('System announcement successfully broadcasted!');
      setNewAnnouncement({ title: '', content: '', category: 'General', pinned: false });
      fetchAnnouncements();
    } catch (err) {
      triggerToast(err.message || 'Failed to post announcement', 'error');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await hrService.deleteAnnouncement(id);
      triggerToast('Announcement deleted.');
      fetchAnnouncements();
    } catch (err) {
      triggerToast('Failed to delete announcement.', 'error');
    }
  };

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

  // Personal payroll calculations
  const joiningBaseSalary = parseFloat(
    profileData?.joiningSalary ||
    profileData?.bankDetails?.joiningSalary ||
    0
  );
  const latestPayslip = payslips && payslips.length > 0 ? payslips[0] : null;
  const personalBaseSalary = latestPayslip ? latestPayslip.baseSalary : (joiningBaseSalary || 120000);
  const personalTaxWithheld = latestPayslip ? latestPayslip.taxWithheld : Math.round(personalBaseSalary * 0.15);
  const personalNetPay = latestPayslip ? latestPayslip.netPay : personalBaseSalary - personalTaxWithheld;

  const personalBasic = Math.round(personalBaseSalary * 0.7);
  const personalHra = personalBaseSalary - personalBasic;

  const totalLeaveBalance = (leaveBalances?.casualLeave || 0) + (leaveBalances?.sickLeave || 0) + (leaveBalances?.paidLeave || 0);
  const personalPresentDays = attendanceStats?.presentDays || 0;
  const personalLateMarks = attendanceStats?.lateMarks || 0;

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

  const svgWidth = 600;
  const svgHeight = 160;

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

      {/* Overview Heading details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {activeDashboardTab === 'org' ? 'Overview' : 'My Personal Space'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {activeDashboardTab === 'org' 
              ? "Welcome back. Here's what's happening at Fastigo X today." 
              : "Access your personal workspace metrics, attendance records, and pay details."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Segmented Tab control */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit shrink-0">
            <button
              onClick={() => setActiveDashboardTab('org')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDashboardTab === 'org' 
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-405'
              }`}
            >
              Organization
            </button>
            <button
              onClick={() => {
                setActiveDashboardTab('personal');
                triggerToast('Loaded personal workspace dashboard.');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeDashboardTab === 'personal' 
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-405'
              }`}
            >
              Personal Space
            </button>
          </div>

          {/* Date block */}
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 dark:text-slate-350 dark:bg-slate-950 dark:border-slate-800 rounded-xl shadow-sm">
            <span>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {activeDashboardTab === 'personal' ? (
        <>
          {/* Welcome Banner */}
          <div className="relative p-6 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-xl font-extrabold mb-1">
                Welcome Back, {profileData?.name || 'Sarah Jenkins'}!
              </h2>
              <p className="text-indigo-200 text-xs mb-4">
                Manage your personal work shifts, apply for leaves, and view your salary payslips.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentTab('hr-attendance')}
                  className="px-4 py-2 text-xs font-bold bg-white text-indigo-900 rounded-xl hover:bg-slate-50 transition shadow"
                >
                  {clockedIn ? "Check Active Session" : "Clock In Now"}
                </button>
                <button
                  onClick={() => setCurrentTab('hr-leaves')}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600/30 text-white border border-white/20 rounded-xl hover:bg-indigo-600/50 transition"
                >
                  Request Time Off
                </button>
              </div>
            </div>
          </div>

          {/* Personal Indicators Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Clock Status */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clock Status</span>
                <div className={`p-2 rounded-xl ${clockedIn ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-slate-100 text-slate-400 dark:bg-slate-900"}`}>
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {clockedIn ? "Active" : "Offline"}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  {clockedIn ? `Session running: ${elapsedTime}` : "Shift tracker not started"}
                </p>
                <button
                  onClick={toggleClockInOut}
                  className={`w-full py-2 text-xs font-bold rounded-xl transition ${
                    clockedIn
                      ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400"
                      : "bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400"
                  }`}
                >
                  {clockedIn ? "Clock Out" : "Clock In"}
                </button>
              </div>
            </div>

            {/* Card 2: Leave Balance */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Available Leaves</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {totalLeaveBalance} Days
                </h3>
                <p className="text-xs text-indigo-500 font-semibold mb-3">
                  Casual: {leaveBalances?.casualLeave || 0} • Sick: {leaveBalances?.sickLeave || 0} • Paid: {leaveBalances?.paidLeave || 0}
                </p>
                <button
                  onClick={() => setCurrentTab('hr-leaves')}
                  className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-55 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
                >
                  Leave Request Portal
                </button>
              </div>
            </div>

            {/* Card 3: Present Days */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Present Days</span>
                <div className="p-2 bg-indigo-50 text-indigo-655 dark:text-indigo-400 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {personalPresentDays} Days
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  Late marks: {personalLateMarks} (Limit: 3/month)
                </p>
                <button
                  onClick={() => setCurrentTab('hr-attendance')}
                  className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-55 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
                >
                  Attendance History
                </button>
              </div>
            </div>

            {/* Card 4: Compensation */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Compensation</span>
                <div className="p-2 bg-indigo-50 text-indigo-650 dark:text-indigo-400 rounded-xl">
                  <IndianRupee className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  ₹{personalNetPay.toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  Monthly net payable payout
                </p>
                <button
                  onClick={() => setCurrentTab('hr-payroll')}
                  className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-55 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
                >
                  Payroll Ledger View
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Personal Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Personal Payslips Vault */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-900">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-500" />
                  Personal Payslips Vault
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-55 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded uppercase">
                  Issued Salary Slips
                </span>
              </div>

              <div className="space-y-3">
                {payslips.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-450 border border-dashed rounded-xl flex flex-col items-center justify-center space-y-2">
                    <IndianRupee className="w-6 h-6 text-slate-300" />
                    <p className="font-semibold text-slate-500">No payslips issued to your profile yet.</p>
                    <p className="text-[10px] text-slate-400">Your generated corporate salary payouts will show up here.</p>
                  </div>
                ) : (
                  payslips.map((slip) => (
                    <div key={slip._id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 hover:border-slate-200 dark:hover:border-slate-800 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-55 text-indigo-600 dark:bg-indigo-950/40 rounded-lg">
                          <FileSpreadsheet className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{slip.period}</h4>
                          <span className="text-[9px] text-slate-405 font-medium">Net: ₹{slip.netPay.toLocaleString('en-IN')}</span>
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

            {/* Personal Leave History */}
            <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-900">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Personal Leave Requests
                </h3>
                <span className="text-[10px] font-bold text-slate-450">Total: {leaveHistory.length}</span>
              </div>

              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {leaveHistory.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-450 border border-dashed rounded-xl flex flex-col items-center justify-center space-y-2">
                    <Umbrella className="w-6 h-6 text-slate-300" />
                    <p className="font-semibold text-slate-500">No leave requests logged.</p>
                    <p className="text-[10px] text-slate-400">Your requested casual/sick leaves will be listed here.</p>
                  </div>
                ) : (
                  leaveHistory.map((leave, idx) => (
                    <div key={leave.id || idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{leave.type}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide inline-block ${
                          leave.status === 'Approved' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' 
                            : leave.status === 'Rejected' 
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal">
                        <strong>Dates:</strong> {leave.startDate} to {leave.endDate} ({leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'})
                      </p>
                      {leave.reason && (
                        <p className="text-[10px] text-slate-400 italic">
                          "{leave.reason}"
                        </p>
                      )}
                      <span className="text-[8px] text-slate-400 block pt-0.5">
                        Reviewed by: {leave.approvedBy || 'Pending'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
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

          {/* Announcement Hub (Component 8 - HR Announcement Broadcaster & Feed CRUD) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Broadcasts Feed (2/3) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-900">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-500" />
                  Active System Broadcasts
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Total: {announcements.length}</span>
              </div>

              {announcementsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {announcements.map((ann) => (
                    <div key={ann._id} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 rounded-xl flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            {ann.pinned && <Pin className="w-3.5 h-3.5 text-indigo-500 shrink-0 fill-indigo-500" />}
                            {ann.title}
                          </h4>
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            ann.category === 'Alert' ? 'bg-rose-505 bg-rose-500/10 text-rose-500 border-rose-500/20' :
                            ann.category === 'Policy' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            ann.category === 'Event' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          } border`}>
                            {ann.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-normal">
                          {ann.content}
                        </p>
                        <div className="text-[9px] text-slate-400 flex items-center gap-2">
                          <span>Posted by {ann.createdBy || 'HR Department'}</span>
                          <span>•</span>
                          <span>{new Date(ann.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-450 hover:text-rose-500 transition shrink-0"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                  <Megaphone className="w-7 h-7 text-slate-350 dark:text-slate-650" />
                  <h4 className="text-xs font-bold text-slate-500">No active circulars found</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs">Use the broadcaster widget to draft and post circular alerts to all employee dashboards.</p>
                </div>
              )}
            </div>

            {/* Announcement Broadcaster Form (1/3) */}
            <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-indigo-500" />
                Announcement Broadcaster
              </h3>
              
              <form onSubmit={handlePostAnnouncement} className="space-y-3.5">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-1">CIRCULAR TITLE</label>
                  <input 
                    type="text"
                    placeholder="e.g. Annual Diwali Celebration or Policy Update"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white animate-transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">CATEGORY</label>
                    <select
                      value={newAnnouncement.category}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                    >
                      <option value="General">General</option>
                      <option value="Policy">Policy</option>
                      <option value="Event">Event</option>
                      <option value="Alert">Alert</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-200 transition h-[36px]">
                      <input 
                        type="checkbox"
                        checked={newAnnouncement.pinned}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-350">PIN TO HOME</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-1">CONTENT BODY</label>
                  <textarea 
                    placeholder="Draft the announcement details clearly..."
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={postingAnnouncement}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-705 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {postingAnnouncement ? 'Broadcasting...' : 'Publish Circular Alert'}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Grid Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Activities (Left 2/3) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-900">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent Activities</h3>
                <button className="text-slate-405 hover:text-slate-655">•••</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-405 font-bold uppercase tracking-wider text-[9px] border-b border-slate-50 dark:border-slate-900">
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
                                : 'bg-indigo-50 text-indigo-705 dark:bg-indigo-950/20'
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
                  className="text-xs font-bold text-indigo-650 hover:text-indigo-705 transition"
                >
                  View All Activities
                </button>
              </div>

            </div>

            {/* Right column: Holidays & Diversity */}
            <div className="space-y-6">
              
              {/* Upcoming Holidays */}
              <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Upcoming Holidays</h3>
                  <button 
                    onClick={() => triggerToast('Holidays calendar opened')}
                    className="text-xs font-bold text-indigo-650 hover:text-indigo-705"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {holidays.map((h, i) => (
                    <div key={i} className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-909/60 rounded-2xl border border-slate-100 dark:border-slate-900">
                      <div className="bg-rose-50 text-rose-700 dark:bg-rose-955/40 text-[9px] font-extrabold p-2 rounded-xl text-center w-12 shrink-0">
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

              {/* Staffing Diversity Ring */}
              <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 relative">
                
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Staffing Diversity</h3>
                  
                  <button 
                    onClick={() => triggerToast('Diversity filters updated')}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-full shadow-md transition shrink-0"
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
        </>
      )}

      {/* SECURE AUDIT PRINTABLE SLIP MODAL */}
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
                  className="p-1.5 text-slate-405 hover:text-slate-655 hover:bg-slate-100 rounded-lg transition"
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
                  <span className="font-bold text-slate-800">{selectedSlip.employeeName || profileData?.name || 'Sarah Jenkins'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Designation & Position</span>
                  <span className="font-bold text-slate-850">{profileData?.position || 'HR Director'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Staff Identifier</span>
                  <span className="font-bold text-slate-850 tracking-wider font-mono text-[11px]">{profileData?.empId || 'WS-00101'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none mb-0.5">Operational Department</span>
                  <span className="font-bold text-slate-855">{profileData?.department || 'People Operations'}</span>
                </div>
              </div>

              {/* Bank & Payment Routing */}
              <div className="grid grid-cols-4 gap-4 text-xs border-b border-slate-150 py-5 bg-slate-50/50 px-2.5 rounded-lg my-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Corporate Bank</span>
                  <span className="font-bold text-slate-800">{profileData?.bankDetails?.bankName || 'JPMorgan Chase & Co.'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Account Number</span>
                  <span className="font-mono font-bold text-slate-800">{profileData?.bankDetails?.accountNo || '•••• •••• 1102'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">IFSC Route Code</span>
                  <span className="font-mono font-bold text-slate-800">{profileData?.bankDetails?.ifscCode || 'CHAS0001204'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">PAN Card Number</span>
                  <span className="font-mono font-bold text-slate-800">{profileData?.bankDetails?.panNumber || 'BBBPJ1024D'}</span>
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
                      <td className="p-2.5 font-medium text-slate-600">Basic Salary (70%)</td>
                      <td className="p-2.5 text-right font-bold text-slate-800 border-r border-slate-200">₹{Math.round(selectedSlip.baseSalary * 0.7).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 font-medium text-slate-600">Income Tax (Withheld 15%)</td>
                      <td className="p-2.5 text-right font-bold text-rose-600">₹{selectedSlip.taxWithheld.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-slate-600">House Rent Allowance (HRA 30%)</td>
                      <td className="p-2.5 text-right font-bold text-slate-800 border-r border-slate-200">₹{(selectedSlip.baseSalary - Math.round(selectedSlip.baseSalary * 0.7)).toLocaleString('en-IN')}</td>
                      <td className="p-2.5 font-medium text-slate-600">Provident Fund (PF)</td>
                      <td className="p-2.5 text-right font-bold text-slate-800">₹0</td>
                    </tr>
                    <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-850">
                      <td className="p-2.5">Gross Total Earnings</td>
                      <td className="p-2.5 text-right border-r border-slate-200">₹{selectedSlip.baseSalary.toLocaleString('en-IN')}</td>
                      <td className="p-2.5">Total Deductions Outflow</td>
                      <td className="p-2.5 text-right text-rose-600">₹{selectedSlip.taxWithheld.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net salary totals & spelling in words */}
              <div className="flex justify-between items-center border border-slate-250 bg-slate-900 text-white rounded-lg p-4.5 mt-5">
                <div>
                  <span className="text-[9px] font-semibold text-slate-350 uppercase block leading-none mb-1">Total Net Disbursed Salary</span>
                  <span className="text-xs text-slate-300 font-medium italic">
                    Amount in words: <strong className="text-white not-italic">{numberToWords(selectedSlip.netPay || (selectedSlip.baseSalary - selectedSlip.taxWithheld))} Indian Rupees Only</strong>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-semibold text-slate-355 uppercase block leading-none mb-1">Direct Bank Clearing</span>
                  <span className="text-2xl font-black text-white tracking-tight">₹{(selectedSlip.netPay || (selectedSlip.baseSalary - selectedSlip.taxWithheld)).toLocaleString('en-IN')}</span>
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
