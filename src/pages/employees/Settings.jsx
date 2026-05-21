import React from 'react';
import {
  Sun,
  Moon,
  Key,
  Shield,
  Bell,
  CheckCircle2
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
  triggerToast
}) {
  
  return (
    <div className="space-y-6">
      
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
                {/* Simulated QR Code placeholder */}
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
            >
              Update Password Credentials
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

    </div>
  );
}
