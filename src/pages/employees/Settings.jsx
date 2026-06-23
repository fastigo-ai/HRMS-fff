import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Key,
  Shield,
  Bell,
  CheckCircle2,
  UserMinus,
  Calendar,
  ClipboardList,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight
} from 'lucide-react';

export default function Settings({
  theme,
  toggleDarkMode,
  mfaEnabled,
  handleToggleMfa,
  notificationSettings,
  handleToggleNotification,
  passwordForm,
  setPasswordForm,
  handlePasswordChange,
  isUpdatingPassword,
  triggerToast,
  resignation,
  resignationLoading,
  onSubmitResignation
}) {
  const [activeTab, setActiveTab] = useState('account');
  const [lastWorkingDay, setLastWorkingDay] = useState('');
  const [reason, setReason] = useState('');
  const [submittingResignation, setSubmittingResignation] = useState(false);

  const handleResignationSubmit = async (e) => {
    e.preventDefault();
    if (!lastWorkingDay) {
      triggerToast('Proposed Last Working Day is required!', 'error');
      return;
    }
    if (!reason.trim()) {
      triggerToast('Please provide a reason for resignation!', 'error');
      return;
    }
    setSubmittingResignation(true);
    try {
      await onSubmitResignation(lastWorkingDay, reason);
      setLastWorkingDay('');
      setReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingResignation(false);
    }
  };

  const getClearanceStatusColor = (status) => {
    switch (status) {
      case 'Cleared':
        return 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40';
      case 'Rejected':
        return 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40';
      default:
        return 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40';
    }
  };

  const getOverallStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Rejected':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'Completed':
        return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Premium Tab Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px gap-6">
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'account' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          Account & Security Settings
          {activeTab === 'account' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('resignation')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            activeTab === 'resignation' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <UserMinus className="w-3.5 h-3.5" />
          Resignation & Separation
          {activeTab === 'resignation' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'account' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Visual Appearance</h3>
            <p className="text-xs text-slate-400">Manage dark mode styling variables across standard layout pages</p>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Dark Theme Toggle</h4>
                  <p className="text-[10px] text-slate-400">Class-based dark variant triggers</p>
                </div>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>
          </div>

          {/* Multi-Factor Authentication */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Factor Authenticator (MFA)</h3>
            <p className="text-xs text-slate-400">Protect corporate access with advanced simulated QR credentials</p>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[10px] text-slate-400">MFA token sync layers</p>
                </div>
              </div>
              <button 
                onClick={handleToggleMfa}
                className={`w-12 h-6 rounded-full relative transition-colors ${mfaEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${mfaEnabled ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>

            {mfaEnabled && (
              <div className="p-4 border border-indigo-100 dark:border-indigo-950 rounded-xl bg-indigo-50/30 flex items-center gap-4">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-950 shrink-0">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs text-center leading-none">
                    QR SCAN
                  </div>
                </div>
                <div className="space-y-1">
                  <h5 className="text-[10px] font-bold text-slate-800 dark:text-white">Scan with Google Authenticator</h5>
                  <p className="text-[9px] text-slate-400 leading-normal">Scan QR or enter key `WKS-48F-A39` in mobile devices to bind active security sessions.</p>
                </div>
              </div>
            )}
          </div>

          {/* Change Credentials Form */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Security Credentials</h3>
            <p className="text-xs text-slate-400">Regularly update your login passwords to enforce standard security cycles</p>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <button 
                type="submit"
                disabled={isUpdatingPassword}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition"
              >
                {isUpdatingPassword ? 'Updating Password...' : 'Update Password Credentials'}
              </button>
            </form>
          </div>

          {/* Notifications toggles */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Push Notification Permissions</h3>
            <p className="text-xs text-slate-400">Configure alert rules for standard dashboard modules</p>
            
            <div className="space-y-3 pt-2">
              {[
                { id: 'attendanceAlerts', label: 'Attendance Check-in alerts', desc: 'Warn me if check-in is pending past 09:30 AM' },
                { id: 'leaveUpdates', label: 'Leave status approvals', desc: 'Send alerts when managers approve my leaves request' },
                { id: 'payrollNotifications', label: 'Salary clearing notices', desc: 'Alert me as soon as monthly payslips are issued' },
                { id: 'announcements', label: 'General corporate circulars', desc: 'Notify on annual events, announcements & circulars' },
              ].map(setting => (
                <div key={setting.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{setting.label}</h4>
                    <p className="text-[9px] text-slate-400">{setting.desc}</p>
                  </div>
                  <button 
                    onClick={() => handleToggleNotification(setting.id)}
                    className={`w-9 h-5 rounded-full relative transition-colors ${notificationSettings[setting.id] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${notificationSettings[setting.id] ? 'right-0.5' : 'left-0.5'}`}></span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {resignationLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : !resignation ? (
            /* Submitting Resignation Form */
            <div className="max-w-2xl bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserMinus className="w-5 h-5 text-indigo-500" />
                  Initiate Separation / Resignation Request
                </h3>
                <p className="text-xs text-slate-400">
                  Please specify your proposed last working day and reason. Submitting this request begins the standard corporate offboarding process, including IT, Finance, and HR clearance checklists.
                </p>
              </div>

              <form onSubmit={handleResignationSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Proposed Last Working Day</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="date" 
                      value={lastWorkingDay}
                      onChange={(e) => setLastWorkingDay(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Reason for Resignation</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Provide professional context for your resignation decision..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="submit"
                    disabled={submittingResignation}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-indigo-600/10"
                  >
                    {submittingResignation ? 'Submitting Request...' : 'Submit Resignation & Start Offboarding'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Clearance Stepper and Checklist */
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Resignation Case</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getOverallStatusColor(resignation.status)}`}>
                        {resignation.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(resignation.resignationDate || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase leading-none">Last Working Day</div>
                      <div className="text-xs font-extrabold mt-0.5">{new Date(resignation.lastWorkingDay).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400">Employee Resignation Note:</div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{resignation.reason}"</p>
                </div>
              </div>

              {/* Clearance Stepper Widget */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Separation Clearance Gateway</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1: IT Clearance */}
                  <div className={`p-4 rounded-xl border ${getClearanceStatusColor(resignation.clearanceIT)} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        1. IT Asset Clearance
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">{resignation.clearanceIT}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Handover of official laptop, keys, security tokens, and corporate email account permissions.
                    </p>
                  </div>

                  {/* Step 2: Finance Clearance */}
                  <div className={`p-4 rounded-xl border ${getClearanceStatusColor(resignation.clearanceFinance)} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        2. Finance & Accounts
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">{resignation.clearanceFinance}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Resolution of corporate credit cards, petty cash loans, outstanding expense claims, and dues.
                    </p>
                  </div>

                  {/* Step 3: HR Clearance & Offboarding */}
                  <div className={`p-4 rounded-xl border ${getClearanceStatusColor(resignation.status === 'Completed' ? 'Cleared' : 'Pending')} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        3. HR & Full settlement
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {resignation.status === 'Completed' ? 'Cleared' : 'Awaiting Steps'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Completion of exit interview survey, final salary computation, release certificates issuance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Offboarding checklist verification status */}
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-500" />
                  Your Offboarding & Handover Tasks
                </h3>
                
                {resignation.offboardingTasks && resignation.offboardingTasks.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {resignation.offboardingTasks.map((task, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3.5 border rounded-xl ${
                          task.completed 
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-900' 
                            : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            task.completed 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-white'}`}>
                              {task.taskName}
                            </h4>
                            {task.completed && task.verifiedByHR && (
                              <p className="text-[9px] text-emerald-500 mt-0.5">Verified by HR Administrative team</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          task.completed ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                        }`}>
                          {task.completed ? 'Completed' : 'Pending Action'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <h4 className="text-xs font-bold text-slate-500">No Custom Handover Tasks Yet</h4>
                    <p className="text-[10px] text-slate-400 max-w-sm">
                      Your manager or HR partner will list custom offboarding tasks (like document updates or asset details) once they begin reviewing your separation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
