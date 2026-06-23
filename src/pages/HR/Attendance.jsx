import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  MapPin,
  MoreVertical,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DatabaseService, authenticatedFetch, API_BASE_URL } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import EmployeeAttendance from '../employees/Attendance';
import Modal from '../../shared/ui/Modal';

export default function HRAttendance({
  triggerToast
}) {
  const [activeTab, setActiveTab] = useState('org'); // 'org' | 'my'
  const [activeView, setActiveView] = useState('heatmap');
  const [calendarDays, setCalendarDays] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [allRawLogs, setAllRawLogs] = useState([]);
  const [selectedEmpForDetail, setSelectedEmpForDetail] = useState(null);
  const [overviewStats, setOverviewStats] = useState({
    presentToday: 0,
    lateToday: 0,
    wfhToday: 0,
    complianceRate: 100,
    totalEmployees: 0
  });

  // For Personal Attendance
  const { clockedIn, elapsedTime, toggleClock, clockOutCompleted, setCurrentTab } = useAuthStore();
  const [personalAttendance, setPersonalAttendance] = useState({
    logs: [],
    stats: {
      totalHours: 0,
      avgCheckIn: "09:00 AM",
      presentDays: 0,
      lateMarks: 0
    }
  });

  const fetchPersonalAttendance = async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/attendance/my`);
      const data = await res.json();
      if (res.ok) {
        setPersonalAttendance({
          logs: data.data.logs || [],
          stats: data.data.stats || {
            totalHours: 0,
            avgCheckIn: "09:00 AM",
            presentDays: 0,
            lateMarks: 0
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch personal attendance:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'my') {
      fetchPersonalAttendance();
    }
  }, [activeTab, clockedIn]);

  // Load attendance data asynchronously
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getHRAttendanceLogs();
        setCalendarDays(data.cells);
        setAnomalies(data.anomalies);
        setAuditLogs(data.records);
        if (data.stats) {
          setOverviewStats(data.stats);
        }
        const rawLogs = await DatabaseService.getHRAttendanceLogsAll();
        setAllRawLogs(rawLogs);
      } catch {
        triggerToast('Failed to fetch attendance audits.', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'org') {
      loadLogs();
    }
  }, [triggerToast, activeTab, clockedIn]);

  useEffect(() => {
    setVisibleCount(10);
  }, [auditLogs.length]);

  const handleResolveAnomaly = async (id, name) => {
    try {
      setAnomalies(prev => prev.filter(an => an.id !== id));
      triggerToast(`Anomaly case for ${name} resolved and logged!`);
      await DatabaseService.resolveAnomaly(id);
    } catch {
      triggerToast('Error updating anomaly logs.', 'error');
    }
  };

  const getHeatmapColor = (rate) => {
    switch (rate) {
      case 'high': return 'bg-indigo-700 text-white';
      case 'mid': return 'bg-indigo-400 text-white';
      case 'low': return 'bg-indigo-150 dark:bg-indigo-950/60 text-indigo-700';
      case 'none': return 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-605';
      default: return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64"></div>
        <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
          <div className="h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Present Today', value: overviewStats.presentToday.toLocaleString(), change: null, sub: `${overviewStats.totalEmployees} total registered` },
    { label: 'Late Arrivals', value: overviewStats.lateToday.toLocaleString(), change: null, sub: 'Requires override documentation' },
    { label: 'WFH Employees', value: overviewStats.wfhToday.toLocaleString(), sub: 'Active remote channels', barSegments: [30, 20, 50] },
    { label: 'Compliance Rate', value: `${overviewStats.complianceRate.toFixed(1)}%`, sub: 'Calculated today', progressArc: overviewStats.complianceRate }
  ];

  return (
    <div className="space-y-6">

      {/* Premium Tab Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px gap-6 mb-2">
        <button
          onClick={() => setActiveTab('org')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'org' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          Organization Attendance
          {activeTab === 'org' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === 'my' 
              ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          My Attendance
          {activeTab === 'my' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'my' ? (
        <EmployeeAttendance 
          clockedIn={clockedIn}
          clockOutCompleted={clockOutCompleted}
          toggleClockInOut={() => toggleClock(triggerToast)}
          elapsedTime={elapsedTime}
          triggerToast={triggerToast}
          logs={personalAttendance.logs}
          stats={personalAttendance.stats}
          setCurrentTab={setCurrentTab}
        />
      ) : (
        <>
          {/* Top Header details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Overview</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Monitor active schedules and review compliance heatmaps.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => triggerToast('Attendance Logs manual editor opened')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-650 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition"
          >
            Edit Attendance
          </button>
          
          <button 
            onClick={() => triggerToast('Exporting attendance auditing records')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Manual Audit Warnings banner matching Screenshot 3 */}
      <div className="p-4 bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/60 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-855 text-orange-800 dark:text-orange-350 leading-relaxed font-semibold">
            <span className="font-extrabold block">Manual Audit Log Active</span>
            All manual adjustments to attendance records are being tracked for compliance. Ensure documentation is attached to every override.
          </div>
        </div>
        
        <button 
          onClick={() => triggerToast('Loading compliance policy documentation...')}
          className="text-xs font-bold text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 underline shrink-0"
        >
          View Audit Policy
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              {stat.change && (
                <span className={`flex items-center text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  stat.changeType === 'up' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                }`}>
                  {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}
                </span>
              )}
            </div>

            <div>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-white block">{stat.value}</span>
              {stat.sub && (
                <span className="text-[10px] text-slate-400 font-semibold block">{stat.sub}</span>
              )}
            </div>

            {/* Segmented bar for WFH */}
            {stat.barSegments && (
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full flex overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: `${stat.barSegments[0]}%` }}></div>
                <div className="bg-indigo-400 h-full" style={{ width: `${stat.barSegments[1]}%` }}></div>
                <div className="bg-indigo-250 h-full" style={{ width: `${stat.barSegments[2]}%` }}></div>
              </div>
            )}

            {/* Speedometer Progress Arc for Compliance Rate */}
            {stat.progressArc && (
              <div className="relative w-full pt-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-emerald-600 uppercase">Above Target</span>
                </div>
              </div>
            )}

          </div>
        ))}

      </div>

      {/* Grid split segment: Heatmap vs AI Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap Grid (Left 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Monthly Attendance Trends</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Visualizing peak occupancy and absence heat zones</p>
            </div>

            {/* View selectors */}
            <div className="flex bg-slate-50 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-850 shrink-0">
              <button 
                onClick={() => setActiveView('heatmap')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  activeView === 'heatmap' ? 'bg-white dark:bg-slate-950 text-indigo-650 shadow' : 'text-slate-400'
                }`}
              >
                Heatmap
              </button>
              <button 
                onClick={() => setActiveView('trend')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  activeView === 'trend' ? 'bg-white dark:bg-slate-950 text-indigo-650 shadow' : 'text-slate-400'
                }`}
              >
                Trend Line
              </button>
            </div>
          </div>

          {/* Calendar Heatmap Grid */}
          <div className="space-y-4">
            
            {/* Days Columns header starting SUN */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 tracking-wider">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                <div key={i} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`h-11 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition ${getHeatmapColor(day.status)} hover:scale-105`}
                  title={`Day ${day.day}: ${day.val}% compliance`}
                  onClick={() => triggerToast(`Audited statistics details for Day ${day.day}`)}
                >
                  {day.day}
                </div>
              ))}
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-3 border-t border-slate-50 dark:border-slate-900">
              <span>Low Compliance</span>
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3 bg-rose-100 dark:bg-rose-950 rounded"></span>
                <span className="w-3.5 h-3 bg-indigo-150 rounded"></span>
                <span className="w-3.5 h-3 bg-indigo-400 rounded"></span>
                <span className="w-3.5 h-3 bg-indigo-700 rounded"></span>
              </div>
              <span>High Compliance</span>
            </div>

          </div>

        </div>

        {/* AI Anomaly Detection (Right 1/3) */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Anomaly Detection</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">AI-flagged suspicious patterns</p>
            </div>

            {/* Anomalies listing */}
            <div className="space-y-3">
              {anomalies.map((an) => (
                <div 
                  key={an.id} 
                  onClick={() => handleResolveAnomaly(an.id, an.name)}
                  className={`p-3.5 rounded-2xl border-l-4 border-y border-r border-slate-100 dark:border-slate-900 space-y-1 cursor-pointer hover:opacity-90 transition ${
                    an.severity === 'High' 
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-450 dark:text-rose-400' 
                      : 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-450'
                  }`}
                >
                  <h4 className="text-xs font-extrabold leading-none">{an.type}</h4>
                  <p className="text-[9px] leading-normal font-semibold opacity-85">{an.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-50 dark:border-slate-900 shrink-0">
            <button 
              onClick={() => triggerToast('Opening security anomaly center...')}
              className="text-xs font-bold text-indigo-650 hover:text-indigo-700"
            >
              View All Alerts
            </button>
          </div>

        </div>

      </div>

      {/* Audit Log Details (Bottom wide table) */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-50 dark:border-slate-900">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Audit Log Details</h3>
          
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <button 
              onClick={() => triggerToast('Open filters')}
              className="flex items-center gap-1 px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-100 transition"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button 
              onClick={() => triggerToast('Re-sort logs')}
              className="flex items-center gap-1 px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-100 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </button>
          </div>
        </div>

        {/* Audit logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-50 dark:border-slate-900">
                <th className="pb-3 pr-4">Employee Name</th>
                <th className="pb-3 px-4">Check-In/Out</th>
                <th className="pb-3 px-4">Mode</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Location Validation</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
              {(() => {
                const totalItems = auditLogs.length;
                const currentLogs = auditLogs.slice(0, visibleCount);

                return currentLogs.map((log, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      
                      {/* Profile */}
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="leading-tight">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{log.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block">{log.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Check In / Out */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        <div className="space-y-0.5">
                          <span className="block font-bold">{log.timeIn}</span>
                          <span className="block text-[9px] text-slate-450">{log.timeOut}</span>
                        </div>
                      </td>

                      {/* Mode tag */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold border uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                          {log.mode}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] ${log.status.includes('Lateness') ? 'text-amber-600' : 'text-emerald-600'}`}>{log.status}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
                          <span>{log.coords}</span>
                        </div>
                      </td>

                      {/* Action trigger */}
                      <td className="py-3.5 pl-4 text-right">
                        <button 
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            try {
                              // Fetch latest raw logs directly from server to show details without refresh
                              const latestLogs = await DatabaseService.getHRAttendanceLogsAll();
                              setAllRawLogs(latestLogs);
                              const empLogs = latestLogs.filter(raw => {
                                if (!raw.employee) return false;
                                const empName = typeof raw.employee === 'object' ? raw.employee.name : null;
                                return empName === log.name;
                              });
                              
                              setSelectedEmpForDetail({
                                name: log.name,
                                role: log.role,
                                logs: empLogs
                              });
                            } catch {
                              // Fallback to local logs
                              const empLogs = allRawLogs.filter(raw => {
                                if (!raw.employee) return false;
                                const empName = typeof raw.employee === 'object' ? raw.employee.name : null;
                                return empName === log.name;
                              });
                              setSelectedEmpForDetail({
                                name: log.name,
                                role: log.role,
                                logs: empLogs
                              });
                            }
                          }}
                          className="p-1.5 text-slate-455 text-slate-400 hover:text-indigo-655 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Load more details controls instead of numbered pagination */}
        {(() => {
          const totalItems = auditLogs.length;
          const currentLimit = Math.min(visibleCount, totalItems);

          return (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-900 text-[10px] text-slate-400 font-bold gap-3">
              <span>Showing 1-{currentLimit} of {totalItems} records</span>
              
              {visibleCount < totalItems && (
                <button 
                  type="button"
                  onClick={() => {
                    setVisibleCount(prev => prev + 10);
                    triggerToast("Loaded next 10 details.");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition shadow shadow-indigo-600/10 hover:shadow-indigo-600/20 text-[10px]"
                >
                  Load next 10 details
                </button>
              )}
            </div>
          );
        })()}
      </div>
    </>

        
      )}

      {/* Monthly Attendance Details Modal */}
      <Modal 
        isOpen={!!selectedEmpForDetail} 
        onClose={() => setSelectedEmpForDetail(null)} 
        title={`${selectedEmpForDetail?.name}'s Monthly Attendance Details`}
        size="6xl"
      >
        {selectedEmpForDetail && (
          <div className="space-y-6">
            <EmployeeAttendance 
              clockedIn={false}
              clockOutCompleted={true}
              toggleClockInOut={() => {}}
              elapsedTime=""
              triggerToast={triggerToast}
              logs={selectedEmpForDetail.logs}
              isReadOnly={true}
              stats={{
                totalHours: selectedEmpForDetail.logs.reduce((acc, raw) => acc + (parseFloat(raw.timeSpent) || 0), 0).toFixed(1),
                avgCheckIn: selectedEmpForDetail.logs.length > 0 ? "09:12 AM" : "09:00 AM",
                presentDays: selectedEmpForDetail.logs.length,
                lateMarks: selectedEmpForDetail.logs.filter(raw => raw.status === "Late").length
              }}
            />
          </div>
        )}
      </Modal>

    </div>
  );
}