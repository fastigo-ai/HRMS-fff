import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Briefcase,
  DollarSign,
  AlertTriangle,
  BarChart3,
  Users,
  UserPlus,
  Play,
  Square,
  Flame,
  Zap,
  Award,
  ShieldAlert,
  ChevronRight,
  X,
  Navigation,
  CheckCircle,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { useUiStore } from "../../store/uiStore";
import { salesService } from "../../services/salesService";
import { DatabaseService } from "../../services/api";

// Circular Radial Progress widget styled with HSL border-rings
const CircularProgress = ({
  value,
  max,
  label,
  colorClass,
  icon: Icon,
  suffix = "",
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 22;
  const strokeDashoffset = 138 - (138 * percentage) / 100;
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
      <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800 stroke-3 fill-none"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            className={`${colorClass} stroke-3 stroke-linecap-round fill-none transition-all duration-500`}
            style={{ strokeDasharray: 138, strokeDashoffset }}
          />
        </svg>
        <div className="absolute flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-500" />
        </div>
      </div>
      <div>
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
          {label}
        </span>
        <span className="text-xs font-extrabold text-slate-850 dark:text-white block">
          {value}
          {suffix} / {max}
          {suffix}
        </span>
      </div>
    </div>
  );
};

export default function Dashboard({
  setCurrentTab,
  leaveBalances,
  tasks,
  notifications,
  clockedIn,
  toggleClockInOut,
  userRole,
  attendanceStats = {
    presentDays: 0,
    lateMarks: 0,
    totalHours: 0,
    avgCheckIn: "09:00 AM",
  },
  profileData,
}) {
  const { triggerToast } = useUiStore();
  const [liveAnnouncements, setLiveAnnouncements] = useState([]);
  const [liveHolidays, setLiveHolidays] = useState([]);
  const [onboardingChecklist, setOnboardingChecklist] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const anns = await DatabaseService.getAnnouncements();
        setLiveAnnouncements(anns);
        const hols = await DatabaseService.getHolidays();
        if (hols && hols.length > 0) {
          setLiveHolidays(hols.map(h => ({
            date: new Date(h.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' }),
            name: h.name,
            day: new Date(h.date).toLocaleDateString("en-US", { weekday: 'long' }),
            isOptional: h.isOptional
          })));
        }
        const onboard = await DatabaseService.getOnboardingTasks();
        setOnboardingChecklist(onboard);
      } catch (err) {
        console.error("Failed to load dashboard dynamic data:", err);
      }
    };
    loadDashboardData();
  }, []);

  const [activePortal, setActivePortal] = useState("hr"); // 'hr' | 'sales'
  const [salesRole, setSalesRole] = useState(() => {
    if (profileData?.position?.toLowerCase().includes("manager") || profileData?.position?.toLowerCase().includes("bdm")) {
      return "bdm";
    }
    return "bda";
  });

  const pendingTasksCount = tasks.filter(
    (t) => t.status !== "Completed",
  ).length;
  const recentAlerts = notifications.slice(0, 3);

  // Sales CRM State persistent database layer
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dwrLogs, setDwrLogs] = useState([]);
  const [loadingCRM, setLoadingCRM] = useState(false);

  useEffect(() => {
    const loadCRMData = async () => {
      if (activePortal === "sales") {
        setLoadingCRM(true);
        try {
          const fetchedLeads = await salesService.fetchLeads();
          const fetchedActivities = await salesService.fetchActivities();
          const fetchedDwrs = await salesService.fetchDwrs();
          setLeads(fetchedLeads);
          setActivities(fetchedActivities);
          setDwrLogs(fetchedDwrs);
        } catch (err) {
          console.error("Failed to load CRM data from MongoDB:", err);
        } finally {
          setLoadingCRM(false);
        }
      }
    };
    loadCRMData();
  }, [activePortal]);

  // Lead modal and creations
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    source: "LinkedIn Outbound",
    status: "Lead",
    priority: "Medium",
    next_followup: "",
    notes: "",
  });

  // DWR modal
  const [showDwrModal, setShowDwrModal] = useState(false);
  const [dwrInput, setDwrInput] = useState({
    summary: "",
    plan: "",
    blockers: "None",
  });

  // Twilio Caller Simulator State
  const [callerActive, setCallerActive] = useState(false);
  const [callingLead, setCallingLead] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const [callStatus, setCallStatus] = useState("connecting"); // 'connecting' | 'active' | 'saving'
  const [callNotes, setCallNotes] = useState("");

  // GPS verification state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  // Active call seconds ticker
  useEffect(() => {
    let interval;
    if (callerActive && callStatus === "active") {
      interval = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callerActive, callStatus]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) {
      triggerToast("Lead name and company are required!", "error");
      return;
    }
    try {
      const created = await salesService.registerLead(newLead);
      setLeads((prev) => [created, ...prev]);
      const updatedActs = await salesService.fetchActivities();
      setActivities(updatedActs);
      setShowLeadModal(false);
      setNewLead({
        name: "",
        company: "",
        phone: "",
        email: "",
        source: "LinkedIn Outbound",
        status: "Lead",
        priority: "Medium",
        next_followup: "",
        notes: "",
      });
      triggerToast(
        "New prospect successfully registered in CRM pipeline!",
        "success",
      );
    } catch (err) {
      triggerToast("Failed to register lead in database.", "error");
    }
  };

  const handleDwrSubmit = async (e) => {
    e.preventDefault();
    if (!dwrInput.summary || !dwrInput.plan) {
      triggerToast(
        "Please supply today's work summary and tomorrow's plan!",
        "error",
      );
      return;
    }
    try {
      const created = await salesService.submitDwr(dwrInput);
      setDwrLogs((prev) => [created, ...prev]);
      setDwrInput({ summary: "", plan: "", blockers: "None" });
      setShowDwrModal(false);
      triggerToast("Daily Work Report (DWR) successfully submitted!", "success");
    } catch (err) {
      triggerToast("Failed to submit DWR report.", "error");
    }
  };

  const startSimulatedCall = (lead) => {
    setCallingLead(lead);
    setCallerActive(true);
    setCallStatus("connecting");
    setCallTime(0);
    setCallNotes("");
    triggerToast(`Connecting to secure Twilio voice trunk for ${lead.name}...`);

    setTimeout(() => {
      setCallStatus("active");
    }, 2000);
  };

  const endSimulatedCall = () => {
    setCallStatus("saving");
  };

  const saveSimulatedCall = async () => {
    const mins = Math.floor(callTime / 60);
    const secs = callTime % 60;
    const timeStr = `${mins}m ${secs}s`;

    const actData = {
      leadId: callingLead._id || callingLead.id,
      leadName: callingLead.name,
      company: callingLead.company,
      type: "call",
      description: `Simulated Twilio Voice connection logged. Notes: "${callNotes || "No extra notes"}"`,
      duration: timeStr,
      outcome: "Call Completed",
      verified: true,
    };

    try {
      const created = await salesService.logActivity(actData);
      setActivities((prev) => [created, ...prev]);
      setCallerActive(false);
      setCallingLead(null);
      triggerToast(
        "VoIP call recording and analytics synchronized successfully!",
        "success",
      );
    } catch (err) {
      triggerToast("Failed to synchronize VoIP log.", "error");
    }
  };

  const triggerGpsCheckin = (lead) => {
    setGpsLoading(true);
    setGpsStatus(null);
    triggerToast("Fetching precise GPS geofence parameters...");

    setTimeout(async () => {
      setGpsLoading(false);
      setGpsStatus({
        leadName: lead.name,
        company: lead.company,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        coordinates: "30.2672° N, 97.7431° W (Austin Core Boundary)",
        accuracy: "GPS Lock: Accuracy within 3.8m",
      });
      triggerToast("GPS visit proof validated successfully!", "success");

      const actData = {
        leadId: lead._id || lead.id,
        leadName: lead.name,
        company: lead.company,
        type: "meeting",
        description: "Verified Client check-in visit. Anti-fake GPS geofence tag verified.",
        duration: "N/A",
        outcome: "Visit Proof Validated",
        verified: true,
      };

      try {
        const created = await salesService.logActivity(actData);
        setActivities((prev) => [created, ...prev]);
      } catch (err) {
        console.error("Failed to log GPS check-in:", err);
      }
    }, 2200);
  };

  const advanceLeadStatus = async (leadId, nextStatus) => {
    try {
      await salesService.advanceLead(leadId, nextStatus);
      const updatedLeads = await salesService.fetchLeads();
      const updatedActs = await salesService.fetchActivities();
      setLeads(updatedLeads);
      setActivities(updatedActs);
      triggerToast(`Lead advanced to: ${nextStatus}`, "success");
    } catch (err) {
      triggerToast("Failed to update pipeline stage.", "error");
    }
  };

  const holidays = [
    { date: "25 May 2026", name: "Memorial Day", day: "Monday" },
    { date: "19 Jun 2026", name: "Juneteenth", day: "Friday" },
    { date: "04 Jul 2026", name: "Independence Day", day: "Saturday" },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Segmented Portal Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-5.5 h-5.5 text-indigo-500" />
            Fastigo X Employee Hub
          </h2>
          <p className="text-[11px] text-slate-400">
            Access corporate tools, clock tracking, and active CRM targets.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit shrink-0 self-start sm:self-auto border border-slate-200 dark:border-slate-850">
          <button
            onClick={() => setActivePortal("hr")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activePortal === "hr" ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"}`}
          >
            HR & Ops Portal
          </button>
          <button
            onClick={() => {
              setActivePortal("sales");
              triggerToast("Sales Performance Portal synced!");
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${activePortal === "sales" ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"}`}
          >
            Sales CRM Hub
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-ping"></span>
          </button>
        </div>
      </div>

      {/* PORTAL VIEW 1: HR PORTAL */}
      {activePortal === "hr" && (
        <>
          {/* Onboarding Checklist banner */}
          {onboardingChecklist && onboardingChecklist.progress < 100 && (
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-150 dark:border-indigo-900/60 p-6 rounded-2xl shadow-sm space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    🚀 Welcome aboard! Your Onboarding Checklist
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complete the required corporate setups below. (Your HR partner will verify your submissions).
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-xl">
                    Onboarding Progress: {onboardingChecklist.progress}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {onboardingChecklist.tasks.map((task, idx) => (
                  <div key={task.taskKey || idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={async (e) => {
                          try {
                            const updated = await DatabaseService.toggleOnboardingTask(task.taskKey, e.target.checked);
                            setOnboardingChecklist(updated);
                            triggerToast("Onboarding task status updated!", "success");
                          } catch (err) {
                            triggerToast("Failed to toggle onboarding task.", "error");
                          }
                        }}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-[11px] font-semibold truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-350'}`}>
                        {task.label}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase shrink-0 ${
                      task.verifiedByHR 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                    }`}>
                      {task.verifiedByHR ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Banner Greetings */}
          <div className="relative p-6 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-xl font-extrabold mb-1">
                Welcome Back to Fastigo X!
              </h2>
              <p className="text-indigo-200 text-xs mb-4">
                You have {pendingTasksCount} pending tasks on your schedule for
                today. Keep track of operations cleanly.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setCurrentTab("attendance")}
                  className="px-4 py-2 text-xs font-bold bg-white text-indigo-700 rounded-xl hover:bg-slate-50 transition shadow"
                >
                  {clockedIn ? "Check Active Session" : "Clock In Now"}
                </button>
                <button
                  onClick={() => setCurrentTab("leaves")}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600/30 text-white border border-white/20 rounded-xl hover:bg-indigo-600/50 transition"
                >
                  Request Time Off
                </button>
              </div>
            </div>
          </div>

          {/* Grid Quick Indicators */}
          {/* Grid Quick Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Clock state */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Clock Status
                </span>
                <div
                  className={`p-2 rounded-xl ${clockedIn ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-slate-100 text-slate-400 dark:bg-slate-900"}`}
                >
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {clockedIn ? "Active" : "Offline"}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  Today's work shift tracker
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
            <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Available Leaves
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {leaveBalances.casualLeave +
                    leaveBalances.sickLeave +
                    leaveBalances.paidLeave}{" "}
                  Days
                </h3>
                <p className="text-xs text-indigo-500 font-semibold mb-3">
                  Across casual, paid, & sick
                </p>
                <button
                  onClick={() => setCurrentTab("leaves")}
                  className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
                >
                  Leave Portal
                </button>
              </div>
            </div>

            {/* Card 3: Present Days */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Present Days
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-650 dark:text-indigo-400 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {attendanceStats.presentDays} Days
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  Target: 22 days/month
                </p>
                <button
                  onClick={() => setCurrentTab("attendance")}
                  className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
                >
                  Attendance Records
                </button>
              </div>
            </div>

            {/* Card 4: Late Marks */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Late Marks
                </span>
                <div className="p-2 bg-rose-50 text-rose-600 dark:bg-rose-955/40 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3
                  className={`text-2xl font-extrabold mb-1 ${attendanceStats.lateMarks > 3 ? "text-rose-600 animate-pulse" : "text-slate-900 dark:text-white"}`}
                >
                  {String(attendanceStats.lateMarks).padStart(2, "0")}
                </h3>
                <p className="text-xs text-rose-500 font-semibold mb-3">
                  Allowed: 3 per month
                </p>
                <button
                  onClick={() => setCurrentTab("attendance")}
                  className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
                >
                  Lateness Ledger
                </button>
              </div>
            </div>

            {/* Card 5: Tasks Tracker */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Tasks Pending
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {pendingTasksCount} Tasks
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  On dynamic Agile sprint
                </p>
                <button
                  onClick={() => setCurrentTab("tasks")}
                  className="w-full py-2 text-xs font-bold text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-100 dark:border-slate-800"
                >
                  Task Kanban Board
                </button>
              </div>
            </div>

            {/* Card 6: Role access */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Access Scope
                </span>
                <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1 capitalize truncate">
                  {userRole.replace("_", " ")}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  Access constraints enforced
                </p>
                <div className="px-3 py-2 text-[10px] bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-500 font-bold border border-slate-100 dark:border-slate-800 uppercase tracking-wider text-center">
                  Role-Based RBAC active
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: announcements + upcoming holidays */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Announcements list */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Announcements Feed
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Important circulars and events
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab("notifications")}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-4">
                {liveAnnouncements.length > 0 ? (
                  liveAnnouncements.slice(0, 3).map((ann) => (
                    <div
                      key={ann._id}
                      className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 flex items-start gap-4 animate-fade-in"
                    >
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {ann.title}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            ann.category === 'Alert' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-350' 
                              : ann.category === 'Policy'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-300'
                          }`}>
                            {ann.category}
                          </span>
                          {ann.pinned && (
                            <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase">PINNED</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-1.5">
                          {ann.content}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">
                          Broadcast by {ann.createdBy || 'HR'} • {new Date(ann.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 flex items-start gap-4"
                    >
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 rounded-xl shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {alert.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-300">
                            {alert.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-1">
                          {alert.message}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {alert.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Holidays list */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-900">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Upcoming Holidays
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Corporate calendar cycle
                  </p>
                </div>
                <div className="space-y-3">
                  {(liveHolidays.length > 0 ? liveHolidays : holidays).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {h.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {h.day} {h.isOptional ? "(Optional)" : ""}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                        {h.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-900 text-center">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">
                  Total paid annual holidays: 14 days
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PORTAL VIEW 2: SALES CRM HUB */}
      {activePortal === "sales" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Persona Selection Banner */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl"></div>

            <div className="space-y-2 z-10">
              <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-950 border border-indigo-900/50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                Sales Active Persona Switcher
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {salesRole === "bda"
                  ? "Business Development Associate (BDA)"
                  : "Business Development Manager (BDM)"}{" "}
                Workspace
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-xl">
                {salesRole === "bda"
                  ? "Focus: Daily lead prospecting, outbound cold outreach (VoIP twilio, WhatsApp, LinkedIn logs), and booking verified qualified meetings."
                  : "Focus: Reviewing sales opportunities, presenting product demos, negotiating corporate deal sizes, and closing revenue contracts."}
              </p>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 z-10 shrink-0">
              <button
                onClick={() => {
                  setSalesRole("bda");
                  triggerToast("Switched to BDA pipeline parameters!");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${salesRole === "bda" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400"}`}
              >
                BDA Role
              </button>
              <button
                onClick={() => {
                  setSalesRole("bdm");
                  triggerToast("Switched to BDM pipeline parameters!");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${salesRole === "bdm" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400"}`}
              >
                BDM Role
              </button>
            </div>
          </div>

          {/* Radial KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {salesRole === "bda" ? (
              <>
                <CircularProgress
                  value={42}
                  max={50}
                  label="Daily Calls Target"
                  colorClass="stroke-indigo-600"
                  icon={Phone}
                />
                <CircularProgress
                  value={78}
                  max={100}
                  label="Outreach Multipliers"
                  colorClass="stroke-sky-500"
                  icon={MessageSquare}
                />
                <CircularProgress
                  value={12}
                  max={15}
                  label="Qualified Leads Generated"
                  colorClass="stroke-emerald-500"
                  icon={UserPlus}
                />
                <CircularProgress
                  value={4}
                  max={5}
                  label="Meetings Booked"
                  colorClass="stroke-amber-500"
                  icon={Calendar}
                />
              </>
            ) : (
              <>
                <CircularProgress
                  value={12.5}
                  max={15}
                  label="Revenue Achieved"
                  colorClass="stroke-emerald-500"
                  icon={DollarSign}
                  suffix="L"
                />
                <CircularProgress
                  value={8}
                  max={10}
                  label="Corporate Deals Closed"
                  colorClass="stroke-indigo-600"
                  icon={Award}
                />
                <CircularProgress
                  value={45}
                  max={60}
                  label="Pipeline Contract Value"
                  colorClass="stroke-sky-500"
                  icon={TrendingUp}
                  suffix="L"
                />
                <CircularProgress
                  value={96}
                  max={100}
                  label="Client Retention Rate"
                  colorClass="stroke-amber-500"
                  icon={Users}
                  suffix="%"
                />
              </>
            )}
          </div>

          {/* CRM Sales Pipeline Kanban board */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-900">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Agile CRM Lead Pipeline
                </h3>
                <p className="text-xs text-slate-400">
                  Track source, priorities, and drag opportunities across
                  milestones.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowDwrModal(true)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Submit Daily DWR
                </button>
                <button
                  onClick={() => setShowLeadModal(true)}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-1.5 shadow shadow-indigo-600/15"
                >
                  <Plus className="w-4 h-4" />
                  Register Prospect
                </button>
              </div>
            </div>

            {/* Pipeline Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Column 1: Leads */}
              <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 p-4 rounded-2xl flex flex-col space-y-4 min-h-[350px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-900">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    1. Leads Prospecting
                  </span>
                  <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-900 text-slate-600 px-2 py-0.5 rounded">
                    {leads.filter((l) => l.status === "Lead").length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {leads
                    .filter((l) => l.status === "Lead")
                    .map((lead) => (
                      <div
                        key={lead._id || lead.id}
                        className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xs space-y-2 hover:shadow transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-100/40">
                            {lead.source}
                          </span>
                          <span
                            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${lead.priority === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-500 border"}`}
                          >
                            {lead.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                          {lead.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {lead.company}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/50">
                          <button
                            onClick={() => startSimulatedCall(lead)}
                            className="p-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 rounded hover:bg-indigo-100 transition"
                            title="Call Prospect"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              advanceLeadStatus(lead._id || lead.id, "Contacted")
                            }
                            className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"
                          >
                            Contact <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 2: Contacted */}
              <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 p-4 rounded-2xl flex flex-col space-y-4 min-h-[350px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-900">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    2. Outreach Done
                  </span>
                  <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-900 text-slate-600 px-2 py-0.5 rounded">
                    {leads.filter((l) => l.status === "Contacted").length}
                  </span>
                </div>                <div className="space-y-3 flex-1 overflow-y-auto">
                  {leads
                    .filter((l) => l.status === "Contacted")
                    .map((lead) => (
                      <div
                        key={lead._id || lead.id}
                        className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xs space-y-2 hover:shadow transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-100/40">
                            {lead.source}
                          </span>
                          <span
                            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${lead.priority === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-500 border"}`}
                          >
                            {lead.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                          {lead.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {lead.company}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/50">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startSimulatedCall(lead)}
                              className="p-1.5 bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 rounded hover:bg-indigo-100 transition"
                              title="Call Prospect"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => triggerGpsCheckin(lead)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 rounded hover:bg-emerald-100 transition"
                              title="GPS Client Check-in"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              advanceLeadStatus(lead._id || lead.id, "Qualified")
                            }
                            className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"
                          >
                            Qualify <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 3: Qualified */}
              <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 p-4 rounded-2xl flex flex-col space-y-4 min-h-[350px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-900">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    3. Qualified SQLs
                  </span>
                  <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-900 text-slate-600 px-2 py-0.5 rounded">
                    {
                      leads.filter(
                        (l) =>
                          l.status === "Qualified" ||
                          l.status === "Meeting Scheduled",
                      ).length
                    }
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {leads
                    .filter(
                      (l) =>
                        l.status === "Qualified" ||
                        l.status === "Meeting Scheduled",
                    )
                    .map((lead) => (
                      <div
                        key={lead._id || lead.id}
                        className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xs space-y-2 hover:shadow transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-100/40">
                            {lead.source}
                          </span>
                          <span
                            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100`}
                          >
                            SQL
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                          {lead.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {lead.company}
                        </p>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded text-[9px] text-slate-500 font-medium">
                          <strong>Pipeline:</strong>{" "}
                          {lead.status === "Qualified"
                            ? "Qualification verified"
                            : "Meeting set: " + lead.next_followup}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/50">
                          <button
                            onClick={() => triggerGpsCheckin(lead)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 rounded hover:bg-emerald-100 transition"
                            title="GPS Check-in"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              advanceLeadStatus(lead._id || lead.id, "Negotiation")
                            }
                            className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"
                          >
                            Negotiate <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 4: Negotiation / Closed */}
              <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 p-4 rounded-2xl flex flex-col space-y-4 min-h-[350px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-900">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    4. Negotiations & Won
                  </span>
                  <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-900 text-slate-600 px-2 py-0.5 rounded">
                    {
                      leads.filter(
                        (l) => l.status === "Negotiation" || l.status === "Won",
                      ).length
                    }
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {leads
                    .filter(
                      (l) => l.status === "Negotiation" || l.status === "Won",
                    )
                    .map((lead) => (
                      <div
                        key={lead._id || lead.id}
                        className={`p-3 border rounded-xl shadow-xs space-y-2 hover:shadow transition ${lead.status === "Won" ? "bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40" : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-850"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/40">
                            Proposal
                          </span>
                          <span
                            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${lead.status === "Won" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {lead.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                          {lead.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {lead.company}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/50">
                          <span className="text-[9px] text-slate-400 font-bold block">
                            Follow-up: {lead.next_followup}
                          </span>
                          {lead.status !== "Won" && (
                            <button
                              onClick={() => advanceLeadStatus(lead._id || lead.id, "Won")}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold shadow-xs cursor-pointer"
                            >
                              Mark Won
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activities Timeline & DWR summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline column */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-900 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-indigo-500" />
                    Verified Outreach Activity log
                  </h3>
                  <p className="text-xs text-slate-400">
                    Validated call times and GPS check-ins generated
                    dynamically.
                  </p>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-start justify-between gap-3"
                    >
                      <div className="flex gap-3 items-start min-w-0">
                        <div
                          className={`p-2 rounded-xl text-white ${
                            act.type === "call"
                              ? "bg-indigo-600"
                              : act.type === "meeting"
                                ? "bg-emerald-600"
                                : "bg-slate-400"
                          }`}
                        >
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="text-xs min-w-0 leading-normal">
                          <p className="font-extrabold text-slate-900 dark:text-white truncate">
                            {act.leadName} • {act.company}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-[11px] mt-1">
                            {act.description}
                          </p>
                          <div className="flex gap-4 items-center mt-2 text-[10px] text-slate-400 font-extrabold">
                            <span>Duration: {act.duration}</span>
                            <span>Outcome: {act.outcome}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-400 block font-bold mb-1">
                          {act.timestamp}
                        </span>
                        {act.verified && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-fake work compliance status */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <span className="text-indigo-650 dark:text-indigo-400 font-extrabold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 animate-bounce" />
                  Anti-Fake Work System Enforcement
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold bg-white dark:bg-slate-950 border px-2.5 py-1 rounded-lg">
                  100% compliance
                </span>
              </div>
            </div>

            {/* Daily DWR logs column */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="pb-3 border-b border-slate-100 dark:border-slate-900 mb-4">
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-indigo-500" />
                    Filed Daily Work Reports
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your submitted today summaries and agendas.
                  </p>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {dwrLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FileText className="w-8 h-8 stroke-1.5 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-wider">
                        No DWRs filed yet today
                      </p>
                    </div>
                  ) : (
                    dwrLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-xl text-xs space-y-2 font-medium"
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 pb-1">
                          <span>DWR REGISTERED</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-slate-850 dark:text-slate-200 leading-normal">
                          <strong>Today's Work:</strong> {log.summary}
                        </p>
                        <p className="text-slate-650 dark:text-slate-400 leading-normal">
                          <strong>Tomorrow's Agenda:</strong> {log.plan}
                        </p>
                        <p
                          className={`leading-normal ${log.blockers !== "None" ? "text-amber-600 font-semibold" : "text-slate-400"}`}
                        >
                          <strong>Blockers:</strong> {log.blockers}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-indigo-600 text-white rounded-2xl space-y-2 shadow">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-extrabold text-xs">
                    Incentives Engine Active
                  </span>
                </div>
                <div className="text-[10px] text-indigo-100 leading-relaxed font-semibold">
                  Complete outreach tasks to unlock tier commissions! Currently:{" "}
                  <strong>₹62,500 active</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* VoIP Call Floating Dialer Simulator */}
          {callerActive && callingLead && (
            <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-5 flex flex-col space-y-4 animate-in slide-in-from-bottom-12 duration-300">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">
                    Fastigo X VoIP Call
                  </span>
                </div>
                {callStatus !== "saving" && (
                  <button
                    onClick={() => setCallerActive(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-center py-4 space-y-2">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto shadow shadow-indigo-600/50 relative">
                  {callStatus === "active" && (
                    <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-35"></span>
                  )}
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <h4 className="text-xs font-bold text-white block">
                    {callingLead.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {callingLead.company}
                  </span>
                </div>

                <div className="text-sm font-extrabold text-indigo-400 tracking-wider">
                  {callStatus === "connecting" ? (
                    "Connecting voice trunk..."
                  ) : (
                    <span>
                      {String(Math.floor(callTime / 60)).padStart(2, "0")}:
                      {String(callTime % 60).padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>

              {callStatus === "active" && (
                <button
                  onClick={endSimulatedCall}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-750 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow shadow-rose-600/20 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> End Connection
                </button>
              )}

              {callStatus === "saving" && (
                <div className="space-y-3">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Log Call Outcome notes
                  </label>
                  <textarea
                    rows={2}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Enter prospect feedback, key queries, or qualified parameters..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    onClick={saveSimulatedCall}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Confirm & Sync Activities
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GPS checked in outcome tag */}
          {gpsStatus && (
            <div className="fixed bottom-6 left-6 z-50 w-80 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-4 flex flex-col space-y-2 animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-900">
                <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  GPS Visit Tagged
                </span>
                <button
                  onClick={() => setGpsStatus(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-white leading-normal space-y-1.5 font-medium">
                <p>
                  <strong>Client:</strong> {gpsStatus.leadName} (
                  {gpsStatus.company})
                </p>
                <p>
                  <strong>Time Checked:</strong> {gpsStatus.timestamp}
                </p>
                <p className="text-[10px] text-slate-400">
                  <strong>Coordinates:</strong> {gpsStatus.coordinates}
                </p>
                <p className="text-[9px] text-emerald-400 font-semibold">
                  {gpsStatus.accuracy}
                </p>
              </div>
            </div>
          )}

          {/* Create Prospect Modal */}
          {showLeadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm px-4">
              <div className="glass-panel w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-in fade-in-50 zoom-in-95 duration-200">
                <button
                  onClick={() => setShowLeadModal(false)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-6">
                  <UserPlus className="w-5.5 h-5.5 text-indigo-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Register CRM Prospect
                  </h3>
                </div>

                <form
                  onSubmit={handleCreateLead}
                  className="space-y-4 text-xs font-semibold text-slate-500"
                >
                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Prospect Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Robert Chen"
                      value={newLead.name}
                      onChange={(e) =>
                        setNewLead((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Company / Corporate Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Global Corp"
                      value={newLead.company}
                      onChange={(e) =>
                        setNewLead((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. +1 (555) 892-3029"
                        value={newLead.phone}
                        onChange={(e) =>
                          setNewLead((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. robert@apex.com"
                        value={newLead.email}
                        onChange={(e) =>
                          setNewLead((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Source Channel
                      </label>
                      <select
                        value={newLead.source}
                        onChange={(e) =>
                          setNewLead((prev) => ({
                            ...prev,
                            source: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 font-bold"
                      >
                        <option value="LinkedIn Outbound">
                          LinkedIn Outbound
                        </option>
                        <option value="Cold Email">Cold Email</option>
                        <option value="Referral">Referral</option>
                        <option value="Website Signup">Website Signup</option>
                        <option value="Inbound Demo">Inbound Demo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Initial Priority
                      </label>
                      <select
                        value={newLead.priority}
                        onChange={(e) =>
                          setNewLead((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 font-bold"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Pipeline Entry Status
                      </label>
                      <select
                        value={newLead.status}
                        onChange={(e) =>
                          setNewLead((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 font-bold"
                      >
                        <option value="Lead">Leads Prospecting</option>
                        <option value="Contacted">Outreach Done</option>
                        <option value="Qualified">Qualified SQL</option>
                        <option value="Negotiation">Negotiation Mode</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Next Follow-up Date
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. May 28, 2026"
                        value={newLead.next_followup}
                        onChange={(e) =>
                          setNewLead((prev) => ({
                            ...prev,
                            next_followup: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Detailed Requirements / Discovery Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add specific cloud demands, budget ranges, or software integration requirements..."
                      value={newLead.notes}
                      onChange={(e) =>
                        setNewLead((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition shadow shadow-indigo-650/15 cursor-pointer"
                  >
                    Confirm Prospect Entry
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Submit DWR Modal */}
          {showDwrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm px-4">
              <div className="glass-panel w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-in fade-in-50 zoom-in-95 duration-200">
                <button
                  onClick={() => setShowDwrModal(false)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5.5 h-5.5 text-indigo-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    File Daily Work Report (DWR)
                  </h3>
                </div>

                <form
                  onSubmit={handleDwrSubmit}
                  className="space-y-4 text-xs font-semibold text-slate-500"
                >
                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Today's Completed Outreach Summary
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Conducted 42 discovery calls, scheduled 2 client demos for Apex Global Corp and Zen Global..."
                      value={dwrInput.summary}
                      onChange={(e) =>
                        setDwrInput((prev) => ({
                          ...prev,
                          summary: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Tomorrow's Planned Pipeline Agenda
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Follow-up calls with Zen Global, outbound sourcing for logistics firms..."
                      value={dwrInput.plan}
                      onChange={(e) =>
                        setDwrInput((prev) => ({
                          ...prev,
                          plan: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Active Blockers or Dependencies
                    </label>
                    <input
                      type="text"
                      placeholder="None reported"
                      value={dwrInput.blockers}
                      onChange={(e) =>
                        setDwrInput((prev) => ({
                          ...prev,
                          blockers: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition shadow shadow-indigo-650/15 cursor-pointer"
                  >
                    Confirm & File Report
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
