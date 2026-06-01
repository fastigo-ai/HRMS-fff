import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Phone,
  Navigation,
  FileText,
  ShieldCheck,
  CheckCircle,
  Plus,
  ArrowUpRight,
  Sliders,
  DollarSign,
  Award,
  ChevronDown,
  Calendar,
  AlertTriangle,
  Flame,
  Award as Trophy,
} from "lucide-react";
import { salesService } from "../../services/salesService";
import { useUiStore } from "../../store/uiStore";

export default function SalesAudit() {
  const { triggerToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dwrs, setDwrs] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAllSalesData = async () => {
    setLoading(true);
    try {
      const perfData = await salesService.fetchSalesPerformance();
      const leadsData = await salesService.fetchLeads();
      const actsData = await salesService.fetchActivities();
      const dwrsData = await salesService.fetchDwrs();

      setPerformance(perfData);
      setLeads(leadsData);
      setActivities(actsData);
      setDwrs(dwrsData);
    } catch (err) {
      console.error("Failed to load administrative sales audit ledger:", err);
      triggerToast("Failed to fetch Sales Audit databases.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSalesData();
  }, []);

  const handleRoleSwap = async (empId, newPosition) => {
    setUpdatingId(empId);
    try {
      await salesService.changeSalesRole(empId, newPosition);
      triggerToast(`Staff position promoted to: ${newPosition}!`, "success");
      await loadAllSalesData();
    } catch (err) {
      triggerToast("Failed to transition employee sales position.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  // Calculate high-level KPIs
  const totalReps = performance.length;
  const activeLeadsCount = leads.length;
  const totalCallsSeeded = activities.filter((a) => a.type === "call").length;
  const totalMeetingsChecked = activities.filter((a) => a.type === "meeting").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-500" />
          Sales CRM Performance & Audit Hub
        </h2>
        <p className="text-xs text-slate-400">
          Administer active sales pipelines, audit VoIP Twilio logs, geofence client visits, and manage BDA & BDM rosters.
        </p>
      </div>

      {/* Roster Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Active CRM Reps
            </span>
            <span className="text-lg font-extrabold text-slate-850 dark:text-white block">
              {totalReps} Sales Staff
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-sky-50 text-sky-655 dark:bg-sky-950/40 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Pipeline Opportunities
            </span>
            <span className="text-lg font-extrabold text-slate-850 dark:text-white block">
              {activeLeadsCount} Registered
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              VoIP Trunk Calls
            </span>
            <span className="text-lg font-extrabold text-slate-850 dark:text-white block flex items-center gap-1">
              {totalCallsSeeded} Connected
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-rose-50 text-rose-600 dark:bg-rose-950/40 rounded-xl">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              GPS Geofence Visits
            </span>
            <span className="text-lg font-extrabold text-slate-850 dark:text-white block">
              {totalMeetingsChecked} Verified
            </span>
          </div>
        </div>
      </div>

      {/* Main Roster List */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Sales Roster & Metrics</h3>
          <p className="text-xs text-slate-400">Review sales rep capacities, aggregate deal counts, and swap BDA / BDM positions.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performance.map(({ user, stats }) => {
            const isBDM = user.position?.toLowerCase().includes("manager") || user.position?.toLowerCase().includes("bdm");
            return (
              <div
                key={user._id || user.id}
                className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-6 relative overflow-hidden"
              >
                {updatingId === (user._id || user.id) && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 z-10 flex items-center justify-center backdrop-blur-xs">
                    <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* rep card bio */}
                  <div className="flex gap-4">
                    <img
                      src={user.avatar || (user.gender === "female" 
                        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64"
                        : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64")}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-850"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{user.name}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-lg ${isBDM ? "text-indigo-600 bg-indigo-50 border-indigo-150 dark:bg-indigo-950/40" : "text-sky-500 bg-sky-50 border-sky-100 dark:bg-sky-950/40"}`}>
                          {isBDM ? "BDM (Manager)" : "BDA (Associate)"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{user.email} • {user.empId}</p>
                    </div>
                  </div>

                  {/* promotion switcher trigger */}
                  <div className="relative shrink-0">
                    <select
                      value={user.position}
                      onChange={(e) => handleRoleSwap(user._id || user.id, e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-hidden text-slate-500"
                    >
                      <option value="Business Development Associate">Set as BDA (Associate)</option>
                      <option value="Business Development Manager">Set as BDM (Manager)</option>
                    </select>
                  </div>
                </div>

                {/* stats aggregates */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-150 dark:border-slate-900">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-center border border-slate-100 dark:border-slate-900">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                      Leads Pipeline
                    </span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                      {stats.leads} Leads
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-center border border-slate-100 dark:border-slate-900">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                      VoIP Connected
                    </span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block flex items-center justify-center gap-0.5">
                      {stats.calls}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                    </span>
                  </div>
                  <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl text-center border border-indigo-100/30">
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-wider block mb-1">
                      Closed Revenue
                    </span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-455 block">
                      ₹{stats.revenue}L
                    </span>
                  </div>
                </div>

                {/* extra badges/achievements */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-indigo-500" />
                    {stats.meetings} GPS check-ins audited
                  </span>
                  <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-500" />
                    {stats.dwrs} DWR submittals log
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ledger Section (Pipeline + DWRs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CRM Leads Audit Ledger */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4.5 h-4.5 text-indigo-500" />
              Live Lead Audit Ledger
            </h3>
            <p className="text-xs text-slate-400">Live operational prospects synchronized from MongoDB database.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-900">
                  <th className="pb-3 pt-2">Prospect</th>
                  <th className="pb-3 pt-2">Company</th>
                  <th className="pb-3 pt-2">Representative</th>
                  <th className="pb-3 pt-2">Stage</th>
                  <th className="pb-3 pt-2">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                {leads.slice(0, 10).map((lead) => (
                  <tr key={lead._id || lead.id} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{lead.name}</td>
                    <td className="py-3">{lead.company}</td>
                    <td className="py-3 font-semibold text-slate-500">{lead.assignedTo?.name || "Unassigned"}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lead.status === "Closed Won" || lead.status === "Won" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40" : "bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${lead.priority === "High" ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40" : "bg-slate-50 text-slate-500 dark:bg-slate-900"}`}>
                        {lead.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily DWR Audits */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-900 mb-4">
              <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-indigo-500" />
                Audited Daily Work Reports
              </h3>
              <p className="text-xs text-slate-400">Review recent submittals.</p>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {dwrs.map((dwr) => (
                <div key={dwr._id || dwr.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
                      {dwr.employee?.name}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">
                      {new Date(dwr.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    <strong>Summary:</strong> "{dwr.summary}"
                  </p>
                  <p className="text-[11px] text-indigo-500 dark:text-indigo-400 leading-relaxed font-semibold">
                    <strong>Plan:</strong> "{dwr.plan}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
