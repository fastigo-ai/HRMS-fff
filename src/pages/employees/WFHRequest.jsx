import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Info,
  ChevronDown,
  Plus
} from 'lucide-react';
import { DatabaseService } from '../../services/api';

export default function WFHRequest({
  setCurrentTab,
  triggerToast
}) {
  const [wfhForm, setWfhForm] = useState({
    startDate: '',
    endDate: '',
    type: 'Full Day',
    reason: ''
  });

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWFH = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getWFHRequests();
        setHistoryList(data || []);
      } catch (err) {
        console.error("Failed to load WFH requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWFH();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wfhForm.startDate || !wfhForm.endDate || !wfhForm.reason) {
      triggerToast('Please fill out all fields.', 'error');
      return;
    }
    
    try {
      const newWfh = await DatabaseService.createWFHRequest(wfhForm);
      setHistoryList([newWfh, ...historyList]);
      setWfhForm({ startDate: '', endDate: '', type: 'Full Day', reason: '' });
      triggerToast('Work From Home request submitted successfully!', 'success');
    } catch (err) {
      triggerToast(err.message || 'Failed to submit WFH request.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Path header & top level actions matching Screenshot 2 */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
        <button onClick={() => setCurrentTab('attendance')} className="hover:text-indigo-600 transition">Attendance</button>
        <span>&gt;</span>
        <span className="text-slate-600 dark:text-slate-300">WFH Request</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Work From Home Request</h2>
        </div>
        <button 
          onClick={() => triggerToast('WFH Corporate Policy Document')}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition"
        >
          View Policy
        </button>
      </div>

      {/* Main Grid: Forms on left, Timeline on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 space): New Request Form + History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* New Request Card */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> New Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Date pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs font-bold text-slate-400 block mb-1">Start Date</label>
                  <input 
                    type="date"
                    value={wfhForm.startDate}
                    onChange={(e) => setWfhForm({ ...wfhForm, startDate: e.target.value })}
                    className="w-full pl-4 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>
                
                <div className="relative">
                  <label className="text-xs font-bold text-slate-400 block mb-1">End Date</label>
                  <input 
                    type="date"
                    value={wfhForm.endDate}
                    onChange={(e) => setWfhForm({ ...wfhForm, endDate: e.target.value })}
                    className="w-full pl-4 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Request Type dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Request Type</label>
                <select 
                  value={wfhForm.type}
                  onChange={(e) => setWfhForm({ ...wfhForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day - AM">Half Day - AM</option>
                  <option value="Half Day - PM">Half Day - PM</option>
                </select>
              </div>

              {/* Reason description */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Reason for Request</label>
                <textarea 
                  rows="4"
                  placeholder="Briefly describe the reason for your work from home request..."
                  value={wfhForm.reason}
                  onChange={(e) => setWfhForm({ ...wfhForm, reason: e.target.value })}
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white leading-relaxed"
                ></textarea>
              </div>

              {/* Footer submission rows */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-slate-50 dark:border-slate-900">
                <div className="flex items-center gap-2 text-slate-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-semibold">Requires manager approval within 24 hours.</span>
                </div>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
                >
                  Submit Request
                </button>
              </div>

            </form>
          </div>

          {/* Request History Card */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Request History</h3>
              <button 
                onClick={() => triggerToast('Historical logs toggled')}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600"
              >
                View All
              </button>
            </div>

              {historyList.map(item => {
                const title = item.reason || item.title;
                const formattedDate = item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'OCT 12';
                const durationText = item.startDate 
                  ? `${item.type} • ${new Date(item.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(item.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` 
                  : item.duration;
                return (
                  <div key={item._id || item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-xl">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded uppercase">{formattedDate}</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-xs">{title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 ml-[54px]">{durationText}</p>
                    </div>
                    
                    <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase ${
                      item.status === 'Approved' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : item.status === 'Rejected' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                );
              })}
          </div>

        </div>

        {/* Right Column (1/3 space): Active Tracking + WFH Balance */}
        <div className="space-y-6">
          
          {/* Active Tracking timeline matching Screenshot 2 */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-900">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Tracking</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 rounded uppercase">PENDING</span>
            </div>

            {/* Timeline Stepper layout */}
            <div className="space-y-5 relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              
              {/* Step 1: Request Submitted */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shadow text-[8px] font-extrabold ring-4 ring-white dark:ring-slate-950">
                  ✓
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Request Submitted</h4>
                <p className="text-[9px] text-slate-400 font-semibold mb-2">Today at 09:45 AM</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] text-slate-400 leading-relaxed font-semibold italic border border-slate-100 dark:border-slate-900">
                  "Remote work for medical checkup..."
                </div>
              </div>

              {/* Step 2: HR Partner Review */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white shadow text-[8px] font-extrabold ring-4 ring-white dark:ring-slate-950">
                  •••
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">HR Partner Review</h4>
                <p className="text-[9px] text-slate-400 font-semibold mb-2">In Progress</p>
                
                {/* HR Partner card details */}
                <div className="p-3 border border-slate-100 dark:border-slate-900 rounded-xl flex items-center gap-3 bg-white dark:bg-slate-950 shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256" 
                    alt="HR Partner" 
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/10"
                  />
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-800 dark:text-white">Sarah Williams</h5>
                    <p className="text-[9px] text-slate-400">HR Business Partner</p>
                  </div>
                </div>
              </div>

              {/* Step 3: Manager Final Approval */}
              <div className="relative">
                <span className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ring-4 ring-white dark:ring-slate-950"></span>
                <h4 className="text-xs font-bold text-slate-400">Manager Final Approval</h4>
                <p className="text-[9px] text-slate-400">Awaiting previous steps</p>
              </div>

            </div>

            {/* Lightbulb callout & nudge button matching Screenshot 2 */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-950 space-y-2">
              <div className="flex gap-2">
                <span className="text-xs">💡</span>
                <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  Need a quicker response? Nudge your HR partner to expedite this request if it's an emergency.
                </p>
              </div>
              <button 
                onClick={() => triggerToast('Alert sent to HR Business Partner!')}
                className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 block pl-5 uppercase tracking-wide"
              >
                Send Reminder
              </button>
            </div>

          </div>

          {/* WFH Balance Card matching Screenshot 2 */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative space-y-4">
            
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">WFH Balance</h3>
            
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-bold text-slate-400">Monthly Usage</span>
                <div>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">4</span>
                  <span className="text-xs text-slate-400 font-semibold"> / 8 days used</span>
                </div>
              </div>
              
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Grid count values */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 dark:border-slate-900">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Pending</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">1</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Approved</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-white">12</span>
              </div>
            </div>

            {/* Blue circular plus button */}
            <button 
              onClick={() => triggerToast('Shortcut: Apply new custom parameters')}
              className="absolute bottom-16 right-4 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
            </button>
            
          </div>

        </div>

      </div>

    </div>
  );
}
