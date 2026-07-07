import React, { useState } from 'react';
import {
  TrendingUp, Users, Target, PhoneCall,
  FileText, Download, Briefcase, IndianRupee,
  Calendar, CheckCircle, Search, Mail,
  MessageCircle, Star, Plus, MoreVertical,
  Activity, ArrowUpRight, Trash2, Edit2
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useUiStore } from '../../../store/uiStore';
import { Navigate } from 'react-router-dom';
import { useSalesData } from '../../../hooks/useSalesData';
import { salesService } from '../../../services/salesService';

import LeadDashboard from '../components/SalesCRM/LeadDashboard';
import LeadList from '../components/SalesCRM/LeadList';
import LeadDetailsModal from '../components/SalesCRM/LeadDetailsModal';
import AddLeadModal from '../components/SalesCRM/AddLeadModal';
import QuotationForm from '../components/SalesCRM/QuotationForm';

export default function SalesCRM() {
  const { profileData } = useAuthStore();
  const { triggerToast } = useUiStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [editLeadData, setEditLeadData] = useState(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [editQuotationData, setEditQuotationData] = useState(null);

  const { leads, activities, quotations, analytics, isLoading, isError, mutateLeads, mutateQuotations } = useSalesData();

  const isSalesRole = profileData?.role === 'salesperson' ||
                      profileData?.position?.toLowerCase().includes('sale') ||
                      profileData?.department?.toLowerCase().includes('sale') ||
                      profileData?.role === 'manager' || 
                      profileData?.role === 'hr_admin';

  if (!isSalesRole) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Dynamic Data Computation
  const dashboardMetrics = {
    total: leads.length,
    new: leads.filter(l => l.status === 'Lead').length,
    qualified: leads.filter(l => l.status === 'Qualified').length,
    converted: leads.filter(l => l.status === 'Closed Won').length,
    lost: leads.filter(l => l.status === 'Closed Lost').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'Closed Won').length / leads.length) * 100).toFixed(1) : 0
  };

  const customers = leads
    .filter(l => l.status === 'Closed Won')
    .map(l => ({
      id: l._id,
      name: l.company || l.name,
      since: new Date(l.updatedAt || l.createdAt).getFullYear().toString(),
      status: 'Active',
      ltv: 'TBD', // No invoice backend exists yet to calculate LTV
      raw: l
    }));

  const followups = leads
    .filter(l => l.next_followup && l.status !== 'Closed Won' && l.status !== 'Closed Lost')
    .map(l => ({
      id: l._id,
      type: 'Follow-up',
      client: l.company || l.name,
      time: l.next_followup,
      priority: l.priority || 'Medium',
      owner: l.assignedTo?.name || 'Unassigned',
      raw: l
    }));

  const handleDeleteQuotation = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await salesService.deleteQuotation(id);
        mutateQuotations();
      } catch (err) {
        console.error(err);
        triggerToast(err.message || "Failed to delete quotation", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Sales CRM Hub
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Manage your entire sales pipeline, customers, and revenues.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white w-64 shadow-sm"
            />
          </div>
          <button onClick={() => setShowAddLead(true)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition">
            <Plus className="w-4 h-4" />
            New Deal
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 scrollbar-hide">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'leads', label: 'Lead Management', icon: Target },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'followups', label: 'Follow-ups', icon: PhoneCall },
          { id: 'quotations', label: 'Quotations & Invoices', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <div className="animate-fade-in pt-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">Loading data...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <LeadDashboard metrics={dashboardMetrics} followUpsToday={followups.slice(0, 5).map(f => ({ clientName: f.client, time: f.time }))} analytics={analytics} />
            )}

            {activeTab === 'leads' && (
              <LeadList leads={leads} onRowClick={setSelectedLead} onAddLeadClick={() => setShowAddLead(true)} />
            )}

        {activeTab === 'customers' && (
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer Directory</h3>
                <p className="text-xs text-slate-400">Manage ongoing customer relationships.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((cust) => (
                <div key={cust.id} onClick={() => setSelectedLead(cust.raw)} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition space-y-4 cursor-pointer bg-white dark:bg-slate-950">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">{cust.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Client since {cust.since}</p>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${cust.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-500">Lifetime Value</span>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{cust.ltv}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => e.stopPropagation()} className="flex-1 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1 transition">
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className="flex-1 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1 transition">
                      <PhoneCall className="w-3.5 h-3.5" /> Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'followups' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Tasks</h3>
              <div className="space-y-4">
                {followups.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">No upcoming tasks scheduled.</div>
                ) : (
                  followups.map((task) => (
                    <div key={task.id} onClick={() => setSelectedLead(task.raw)} className="flex gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition cursor-pointer">
                      <div className={`p-3 rounded-xl h-fit border ${
                        task.type === 'Call' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50' :
                        task.type === 'Email' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:border-amber-900/50' :
                        'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50'
                      }`}>
                        {task.type === 'Call' ? <PhoneCall className="w-5 h-5" /> :
                         task.type === 'Email' ? <Mail className="w-5 h-5" /> :
                         <Users className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{task.type} with {task.client}</h4>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                            task.priority === 'High' ? 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/50' : 
                            'text-slate-500 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                          }`}>{task.priority}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(task.time).toLocaleString()}
                        </p>
                      </div>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        salesService.updateLead(task.id, { next_followup: "" }).then(() => mutateLeads());
                      }} className="text-slate-400 hover:text-rose-500 self-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Clear Task">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Quick Note / Compose */}
            <div className="bg-indigo-600 dark:bg-indigo-900 p-6 rounded-3xl shadow-lg text-white space-y-6">
              <h3 className="text-base font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-200" /> Add Quick Note
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const leadId = e.target.lead.value;
                const note = e.target.note.value;
                if (!leadId || !note) return;
                const lead = leads.find(l => l._id === leadId);
                salesService.addActivity({
                  lead: leadId,
                  leadName: lead.name,
                  company: lead.company,
                  type: 'call',
                  description: note,
                  outcome: 'Note Added',
                  duration: 'N/A'
                }).then(() => {
                  e.target.reset();
                  triggerToast("Note saved!");
                }).catch(err => triggerToast(err.message, "error"));
              }} className="space-y-4">
                <select name="lead" required className="w-full bg-indigo-700/50 dark:bg-indigo-950/50 border border-indigo-500 dark:border-indigo-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-indigo-300">
                  <option value="">Select Client/Lead...</option>
                  {leads.map(l => <option key={l._id} value={l._id}>{l.company || l.name}</option>)}
                </select>
                <textarea 
                  name="note"
                  required
                  rows={4}
                  placeholder="Type your interaction notes here..."
                  className="w-full bg-indigo-700/50 dark:bg-indigo-950/50 border border-indigo-500 dark:border-indigo-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-indigo-300"
                ></textarea>
                <button type="submit" className="w-full py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-white font-extrabold text-sm rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition shadow-md">
                  Save Note
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Invoices & Quotations</h3>
                <p className="text-xs text-slate-400">Generate and track financial documents.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowQuotation(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 transition border border-indigo-100 dark:border-indigo-900/50">
                  Create Quote
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow">
                  New Invoice
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {quotations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No quotations found.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 px-4">Quote ID</th>
                      <th className="pb-3 px-4">Client</th>
                      <th className="pb-3 px-4">Valid Until</th>
                      <th className="pb-3 px-4">Amount</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
                    {quotations.map((q) => (
                      <tr key={q._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-xs text-indigo-600 dark:text-indigo-400">{q.quotationNumber}</td>
                        <td className="py-4 px-4 font-semibold text-sm text-slate-800 dark:text-white">{q.lead?.company || q.lead?.name || 'Unknown'}</td>
                        <td className="py-4 px-4 text-xs text-slate-500">{new Date(q.validUntil).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-sm font-extrabold text-slate-700 dark:text-slate-300">₹{q.totalAmount?.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase border ${
                            q.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50' :
                            q.status === 'Sent' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50' :
                            q.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/50' :
                            'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/40 dark:border-slate-900/50'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right flex justify-end gap-2">
                          <button onClick={() => setEditQuotationData(q)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition border border-slate-200 dark:border-slate-700" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteQuotation(q._id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition border border-slate-200 dark:border-slate-700" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

          </>
        )}
      </div>
      
      {/* Modals rendered outside the tab flow */}
      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead} 
          activities={activities.filter(a => a.lead === selectedLead._id)} 
          onClose={() => setSelectedLead(null)} 
          onEdit={() => {
            setEditLeadData(selectedLead);
            setSelectedLead(null); // Optional: close details when editing
          }}
          onLeadUpdated={() => mutateLeads()} 
        />
      )}
      {showAddLead && (
        <AddLeadModal 
          onClose={() => setShowAddLead(false)} 
          onLeadAdded={() => mutateLeads()}
        />
      )}
      {editLeadData && (
        <AddLeadModal 
          initialData={editLeadData}
          onClose={() => setEditLeadData(null)} 
          onLeadAdded={() => {
            mutateLeads();
            setSelectedLead(editLeadData); // Optionally re-open
          }}
        />
      )}
      {showQuotation && <QuotationForm leads={leads} onClose={() => setShowQuotation(false)} onSaved={() => mutateQuotations()} />}
      {editQuotationData && <QuotationForm leads={leads} initialData={editQuotationData} onClose={() => setEditQuotationData(null)} onSaved={() => mutateQuotations()} />}
    </div>
  );
}
