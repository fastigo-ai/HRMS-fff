import React, { useState, useEffect } from "react";
import {
  Clock,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  ExternalLink,
  ChevronDown,
  Info,
  Plus
} from "lucide-react";
import { DatabaseService } from "../../services/api";

export default function Attendance({
  clockedIn,
  clockOutCompleted,
  toggleClockInOut,
  elapsedTime,
  setCurrentTab,
  triggerToast,
  logs = [],
  stats = {},
}) {
  const [selectedLogsMonth, setSelectedLogsMonth] = useState("May 2026");
  const [activeTabSub, setActiveTabSub] = useState("clocking"); // 'clocking' | 'overtime' | 'regularize'
  const [overtimeHistory, setOvertimeHistory] = useState([]);
  const [regularizationHistory, setRegularizationHistory] = useState([]);
  const [overtimeForm, setOvertimeForm] = useState({ date: "", hours: "", reason: "" });
  const [regularizeForm, setRegularizeForm] = useState({ attendanceDate: "", requestedCheckIn: "09:00", requestedCheckOut: "18:00", reason: "" });

  useEffect(() => {
    const fetchAttendanceExtras = async () => {
      try {
        const otData = await DatabaseService.getOvertimeRequests();
        setOvertimeHistory(otData || []);
        const regData = await DatabaseService.getRegularizations();
        setRegularizationHistory(regData || []);
      } catch (err) {
        console.error("Failed to load attendance extras:", err);
      }
    };
    fetchAttendanceExtras();
  }, [activeTabSub]);

  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Generate calendar days dynamically for May 2026
  const getCalendarDays = () => {
    const days = [];
    // April 2026 padding (starts Friday, Mon-Thu are previous month)
    for (let d = 27; d <= 30; d++) {
      days.push({ day: d, currentMonth: false });
    }
    // May 2026 days
    for (let d = 1; d <= 31; d++) {
      const dayStr = String(d).padStart(2, "0");
      const fullDateStr = `2026-05-${dayStr}`;
      const log = logs.find((l) => l.date === fullDateStr);

      let type = undefined;
      if (log) {
        if (log.clockIn && !log.clockOut) {
          type = "active";
        } else if (log.mode === "WFH") {
          type = "wfh";
        } else if (log.mode === "Field") {
          type = "field";
        } else {
          type = "office";
        }
      }
      days.push({ day: d, currentMonth: true, type });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6">
      {/* Page Header Area matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Attendance Overview
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Tracking your productivity for May 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-850 shadow-inner">
            <button
              onClick={() => setActiveTabSub("clocking")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTabSub === "clocking" 
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Attendance Board
            </button>
            <button
              onClick={() => setActiveTabSub("overtime")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTabSub === "overtime" 
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Overtime Request
            </button>
            <button
              onClick={() => setActiveTabSub("regularize")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTabSub === "regularize" 
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Regularization
            </button>
          </div>

          <button
            onClick={() =>
              triggerToast("Attendance report exported successfully!")
            }
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Report
          </button>

          <button
            onClick={toggleClockInOut}
            disabled={clockOutCompleted}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md transition ${
              clockOutCompleted
                ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-600 shadow-none"
                : clockedIn
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 hover:shadow-rose-600/20 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10 hover:shadow-indigo-600/20 text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            {clockOutCompleted
              ? "Shift Completed"
              : clockedIn
                ? `Clock Out (${elapsedTime})`
                : "Clock In"}
          </button>
        </div>
      </div>

      {activeTabSub === "clocking" && (
        <>
          {/* Metrics Row (4 Card Grid) matching Screenshot 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Working Hours */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Total Working Hours
              </span>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.totalHours || 0}
                </span>
                <span className="text-xs text-slate-400 font-semibold ml-1">
                  hrs
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-900">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                  +12.4%
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  vs Last Month
                </span>
              </div>
            </div>

            {/* Present Days */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Present Days
              </span>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.presentDays || 0}
                </span>
                <span className="text-xs text-slate-400 font-semibold ml-1">
                  / 31 Days
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-900">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 px-2 py-0.5 rounded-lg">
                  96.4% Ratio
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Stellar Attendance
                </span>
              </div>
            </div>

            {/* Late Marks */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Late Marks
              </span>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.lateMarks || 0}
                </span>
                <span className="text-xs text-slate-400 font-semibold ml-1">
                  Times
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-900">
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg">
                  -2 Times
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Better than last
                </span>
              </div>
            </div>

            {/* Average Check In */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Average Check-In
              </span>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.avgCheckIn || "09:00 AM"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-900">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                  On Time
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Target: 09:30 AM
                </span>
              </div>
            </div>
          </div>

          {/* Main split grid: Calendar on left, Live Log on right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2/3 Column: Calendar View Grid */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Attendance Calendar
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Live checking distribution overview
                  </p>
                </div>

                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm shrink-0">
                  <button
                    onClick={() => triggerToast("Rollback calendar month")}
                    className="p-1.5 text-slate-500 hover:bg-slate-55 hover:bg-slate-100 dark:hover:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950">
                    May 2026
                  </span>
                  <button
                    onClick={() => triggerToast("Advance calendar month")}
                    className="p-1.5 text-slate-500 hover:bg-slate-55 hover:bg-slate-100 dark:hover:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sunday-Saturday Calendar Headers */}
              <div>
                <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                    (d, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 dark:bg-slate-900/50 py-3 text-center text-[10px] font-bold text-slate-400 tracking-wider"
                      >
                        {d}
                      </div>
                    ),
                  )}

                  {/* Calendar Days */}
                  {calendarDays.map((cell, idx) => {
                    let cellClass =
                      "bg-white dark:bg-slate-950 h-20 p-2 relative flex flex-col justify-between transition-colors";
                    let textClass = "text-xs font-bold ";

                    if (!cell.currentMonth) {
                      textClass += "text-slate-300 dark:text-slate-700";
                    } else {
                      textClass += "text-slate-800 dark:text-slate-200";
                    }

                    return (
                      <div key={idx} className={cellClass}>
                        <span className={textClass}>{cell.day}</span>

                        {cell.type === "active" && (
                          <div className="bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/60 p-1 rounded text-[7px] font-extrabold text-indigo-700 dark:text-indigo-400 leading-none truncate">
                            Active Clock
                          </div>
                        )}

                        {cell.type === "wfh" && (
                          <div className="bg-sky-50 border border-sky-100 dark:bg-sky-950/40 dark:border-sky-900/60 p-1 rounded text-[7px] font-extrabold text-sky-700 dark:text-sky-400 leading-none truncate">
                            Remote WFH
                          </div>
                        )}

                        {cell.type === "field" && (
                          <div className="bg-amber-50 border border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/60 p-1 rounded text-[7px] font-extrabold text-amber-700 dark:text-amber-400 leading-none truncate">
                            Field Client
                          </div>
                        )}

                        {cell.type === "office" && (
                          <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/60 p-1 rounded text-[7px] font-extrabold text-emerald-700 dark:text-emerald-400 leading-none truncate">
                            Office Present
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 1/3 Column: Active tracking / WFH request indicator */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Request Shortcut
                </h3>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Need to work remotely?
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Submit a Work From Home parameters request to your reporting manager
                    instantly.
                  </p>
                  <button
                    onClick={() => setCurrentTab && setCurrentTab("wfh-request")}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-xl transition shadow shadow-indigo-600/10"
                  >
                    Apply WFH Request
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Regularize Logs
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Missed a clock in/out? Request regularization to correct your records.
                  </p>
                  <button
                    onClick={() => setActiveTabSub("regularize")}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-855 text-slate-700 dark:text-slate-350 text-[10px] font-bold rounded-xl transition"
                  >
                    Fix Missing Logs
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Log Table Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 pt-6">
            <div className="px-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Attendance Logs
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Comprehensive history of your check-in triggers
                </p>
              </div>

              {/* Month selectors dropdown */}
              <div className="relative">
                <button
                  onClick={() => triggerToast("Changing log duration")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl transition"
                >
                  <span>{selectedLogsMonth}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table structure */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-900 text-slate-400 uppercase font-bold text-[9px] tracking-wider bg-slate-50 dark:bg-slate-950/40">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Clock In</th>
                    <th className="px-6 py-3.5">Clock Out</th>
                    <th className="px-6 py-3.5">Work Hours</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Coordinates Location</th>
                    <th className="px-6 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                  {logs.map((log, idx) => {
                    const formatDate = (dateStr) => {
                      if (!dateStr) return "N/A";
                      const dateObj = new Date(dateStr);
                      return dateObj.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    };

                    const formatTime = (timeStr) => {
                      if (!timeStr) return "--:--";
                      return new Date(timeStr).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    };

                    const inTimeStr = formatTime(log.clockIn);
                    const outTimeStr = formatTime(log.clockOut);

                    let statusText = log.status || "Present";
                    let statusClass =
                      "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40";

                    if (statusText === "Late") {
                      statusClass =
                        "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40";
                    } else if (statusText === "Absent") {
                      statusClass =
                        "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40";
                    }

                    return (
                      <tr
                        key={log._id || idx}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {formatDate(log.date || log.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-655 dark:text-slate-300">
                          {inTimeStr}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-400">
                          {outTimeStr}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-655 dark:text-slate-300">
                          {log.timeSpent || "Current"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase ${statusClass}`}
                          >
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{log.location || "Headquarters"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              triggerToast(
                                `Check-in coordinates verified: ${log.location || "Headquarters"}`,
                              )
                            }
                            className="text-[10px] font-bold text-slate-400 hover:text-indigo-600"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-slate-400 italic"
                      >
                        No attendance records found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Load Previous Month Dropdown Trigger */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-900 text-center">
              <button
                onClick={() => triggerToast("Logs expanded for previous months.")}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600"
              >
                Load Previous Month <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* OVERTIME VIEW */}
      {activeTabSub === "overtime" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left: Apply Overtime Form */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Apply Overtime (OT)
            </h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!overtimeForm.date || !overtimeForm.hours || !overtimeForm.reason) {
                  triggerToast("Please fill out all fields!", "error");
                  return;
                }
                try {
                  const newOt = await DatabaseService.createOvertimeRequest(overtimeForm);
                  setOvertimeHistory([newOt, ...overtimeHistory]);
                  setOvertimeForm({ date: "", hours: "", reason: "" });
                  triggerToast("Overtime request filed successfully!", "success");
                } catch (err) {
                  triggerToast(err.message || "Failed to submit Overtime.", "error");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Overtime Date</label>
                <input 
                  type="date"
                  value={overtimeForm.date}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Requested Hours</label>
                <input 
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="e.g. 2.5"
                  value={overtimeForm.hours}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Reason / Task Accomplished</label>
                <textarea 
                  rows="3"
                  placeholder="Briefly describe the task worked on during overtime hours..."
                  value={overtimeForm.reason}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white leading-normal"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
              >
                Submit OT Claim
              </button>
            </form>
          </div>

          {/* Right: OT History Ledger */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Overtime History Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Claim Hours</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Approved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                  {overtimeHistory.map((ot, idx) => {
                    let statusColor = "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40";
                    if (ot.status === "Approved") statusColor = "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40";
                    if (ot.status === "Rejected") statusColor = "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40";
                    return (
                      <tr key={ot._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-3 font-bold text-slate-800 dark:text-white">
                          {new Date(ot.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">{ot.hours} hrs</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate italic">"{ot.reason}"</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>{ot.status}</span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">{ot.approvedBy || "Pending"}</td>
                      </tr>
                    );
                  })}
                  {overtimeHistory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 italic">No overtime logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REGULARIZATION VIEW */}
      {activeTabSub === "regularize" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left: Apply Regularization Form */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Request Regularization
            </h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!regularizeForm.attendanceDate || !regularizeForm.requestedCheckIn || !regularizeForm.requestedCheckOut || !regularizeForm.reason) {
                  triggerToast("Please fill out all fields!", "error");
                  return;
                }
                try {
                  const newReg = await DatabaseService.applyRegularization(regularizeForm);
                  setRegularizationHistory([newReg, ...regularizationHistory]);
                  setRegularizeForm({ attendanceDate: "", requestedCheckIn: "09:00", requestedCheckOut: "18:00", reason: "" });
                  triggerToast("Regularization request submitted!", "success");
                } catch (err) {
                  triggerToast(err.message || "Failed to submit Regularization.", "error");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Target Date</label>
                <input 
                  type="date"
                  value={regularizeForm.attendanceDate}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, attendanceDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Correct Check-In</label>
                  <input 
                    type="time"
                    value={regularizeForm.requestedCheckIn}
                    onChange={(e) => setRegularizeForm({ ...regularizeForm, requestedCheckIn: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Correct Check-Out</label>
                  <input 
                    type="time"
                    value={regularizeForm.requestedCheckOut}
                    onChange={(e) => setRegularizeForm({ ...regularizeForm, requestedCheckOut: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Reason for Adjustment</label>
                <textarea 
                  rows="3"
                  placeholder="e.g. Card biometric sensor scanner malfunction, forgot check-in..."
                  value={regularizeForm.reason}
                  onChange={(e) => setRegularizeForm({ ...regularizeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white leading-normal"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow"
              >
                Submit Regularization
              </button>
            </form>
          </div>

          {/* Right: Regularization History Logs */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Regularization Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Requested Hours</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Resolved By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                  {regularizationHistory.map((reg, idx) => {
                    let statusColor = "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40";
                    if (reg.status === "Approved") statusColor = "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40";
                    if (reg.status === "Rejected") statusColor = "bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40";
                    return (
                      <tr key={reg._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-3 font-bold text-slate-800 dark:text-white">
                          {new Date(reg.attendanceDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">
                          {reg.requestedCheckIn} to {reg.requestedCheckOut}
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate italic">"{reg.reason}"</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>{reg.status}</span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">{reg.approvedBy || "Pending Review"}</td>
                      </tr>
                    );
                  })}
                  {regularizationHistory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 italic">No regularization logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
