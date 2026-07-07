import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, Building, Briefcase, Calendar, CheckCircle2, ChevronRight, MessageSquare, Clock, Edit2, Trash2 } from 'lucide-react';
import { salesService } from '../../../../services/salesService';
import { useUiStore } from '../../../../store/uiStore';
import AddMOMModal from './AddMOMModal';

export default function LeadDetailsModal({ lead, activities = [], onClose, onLeadUpdated, onEdit }) {
  if (!lead) return null;
  const [activeTab, setActiveTab] = useState('details');
  const [showMOMModal, setShowMOMModal] = useState(false);
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [activityType, setActivityType] = useState('call');
  const [isLogging, setIsLogging] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showWonModal, setShowWonModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [followupDelay, setFollowupDelay] = useState('0');
  const { triggerToast } = useUiStore();

  const pipelineStages = ["Lead", "Contacted", "Qualified", "Meeting Scheduled", "Negotiation", "Closed Won", "Closed Lost"];

  const handleStageClick = async (stage) => {
    if (stage === lead.status) return;

    if (stage === "Closed Lost") {
      setShowLostModal(true);
      return;
    }

    if (stage === "Closed Won") {
      setShowWonModal(true);
      return;
    }

    try {
      await salesService.advanceLead(lead._id, stage);
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      console.error(err);
      triggerToast(err.message || "Failed to update lead status", "error");
    }
  };

  const handleSubmitLost = async () => {
    try {
      const updates = { status: "Closed Lost" };
      if (lostReason) {
        updates.notes = (lead.notes || '') + `\n\n[Lost Reason]: ${lostReason}`;
      }
      if (followupDelay !== '0') {
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + parseInt(followupDelay));
        updates.next_followup = nextDate.toISOString();
      }
      await salesService.updateLead(lead._id, updates);
      setShowLostModal(false);
      triggerToast("Lead marked as Closed Lost.");
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      triggerToast(err.message || "Failed to mark lead as lost", "error");
    }
  };

  const handleSubmitWon = async (createInvoice) => {
    try {
      await salesService.updateLead(lead._id, { status: "Closed Won" });
      setShowWonModal(false);
      triggerToast("Lead marked as Closed Won! Now moved to Customers.");
      if (onLeadUpdated) onLeadUpdated();
      if (createInvoice) {
        // Just log activity for now since Invoices aren't complete
        await salesService.logActivity({
          leadId: lead._id,
          leadName: lead.name,
          company: lead.company,
          type: 'email',
          description: 'Initial Quotation/Invoice process started for new customer.'
        });
        setActiveTab('activities');
      }
    } catch (err) {
      triggerToast(err.message || "Failed to mark lead as won", "error");
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete lead: ${lead.name}? This action cannot be undone.`)) {
      try {
        await salesService.deleteLead(lead._id);
        if (onLeadUpdated) onLeadUpdated();
        onClose();
      } catch (err) {
        console.error(err);
        triggerToast(err.message || "Failed to delete lead", "error");
      }
    }
  };

  const handleLogActivity = async () => {
    if (!newActivityDesc.trim()) return;
    setIsLogging(true);
    try {
      await salesService.logActivity({
        leadId: lead._id,
        leadName: lead.name,
        company: lead.company,
        type: activityType,
        description: newActivityDesc
      });
      setNewActivityDesc('');
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      console.error(err);
      triggerToast(err.message || "Failed to log activity", "error");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {lead.status === 'Closed Won' && (
          <div className="bg-emerald-50 text-emerald-700 px-6 py-3 border-b border-emerald-100 flex items-center justify-center gap-2 font-bold text-sm">
            🎉 Deal Won! This lead is now available in the Customers directory.
          </div>
        )}
        {lead.status === 'Closed Lost' && (
          <div className="bg-rose-50 text-rose-700 px-6 py-3 border-b border-rose-100 flex items-center justify-center gap-2 font-bold text-sm">
            ❌ Deal Lost. See below for lost reason and future engagement plans.
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-extrabold text-xl">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{lead.name}</h2>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full uppercase border ${
                  lead.status === 'Won' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>{lead.status}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{lead.company} • {lead._id?.substring(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition" title="Edit Lead">
              <Edit2 className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition" title="Delete Lead">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pipeline Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between overflow-x-auto">
            {pipelineStages.map((stage, idx) => {
              const isActive = lead.status === stage;
              const isPast = pipelineStages.indexOf(lead.status) > idx;
              return (
                <div key={stage} className="flex items-center min-w-max">
                  <button onClick={() => handleStageClick(stage)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer hover:opacity-80 ${
                    isActive ? 'bg-indigo-600 text-white shadow-md' :
                    isPast ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {stage}
                  </button>
                  {idx < pipelineStages.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-slate-300 dark:text-slate-700" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Left Sidebar Info */}
          <div className="w-full md:w-1/3 border-r border-slate-100 dark:border-slate-800 p-6 overflow-y-auto bg-white dark:bg-slate-950 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" /> {lead.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" /> {lead.email}
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" /> 
                  <span className="leading-tight">{lead.address || 'No address provided'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Deal Details</h3>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Building className="w-3.5 h-3.5"/> Industry</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{lead.industry || 'Tech'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5"/> Source</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{lead.source}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-3.5 h-3.5"/> Budget</span>
                  <span className="font-extrabold text-emerald-600">{lead.budget || lead.value}</span>
                </div>
              </div>
              <div className="mt-3">
                <button onClick={() => {
                  const amount = prompt("Enter total quotation amount:", "50000");
                  if (amount) {
                    salesService.generateQuote({
                      leadId: lead._id,
                      items: [{ description: "Services", quantity: 1, unitPrice: Number(amount), total: Number(amount) }],
                      subtotal: Number(amount),
                      totalAmount: Number(amount),
                      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    }).then(() => {
                       alert("Quote Generated!");
                       if (onLeadUpdated) onLeadUpdated();
                    }).catch(e => alert(e.message));
                  }
                }} className="w-full py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                  Generate Quote
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assignment</h3>
              <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                  {(lead.assignedTo?.name || 'Unassigned').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{lead.assignedTo?.name || 'Unassigned'}</p>
                  <p className="text-[10px] text-slate-500">Sales Executive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Area (Activity & Notes) */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900/20">
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
              <button onClick={() => setActiveTab('details')} className={`pb-2 px-4 text-sm font-bold border-b-2 ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Activity Timeline</button>
              <button onClick={() => setActiveTab('notes')} className={`pb-2 px-4 text-sm font-bold border-b-2 ${activeTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Notes & Documents</button>
            </div>

            {activeTab === 'details' && (
              <div className="flex-1 space-y-6">
                <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[21px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {activities?.length > 0 ? activities.map((activity, idx) => (
                    <div key={activity._id || idx} className="relative pl-6">
                      <span className="absolute left-[-11px] top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
                        {activity.type === 'call' ? <Phone className="w-3 h-3 text-indigo-500"/> :
                         activity.type === 'email' ? <Mail className="w-3 h-3 text-indigo-500"/> :
                         activity.type === 'pipeline' ? <CheckCircle2 className="w-3 h-3 text-emerald-500"/> :
                         <Clock className="w-3 h-3 text-indigo-500"/>}
                      </span>
                      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{activity.type}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                        {activity.mom && activity.mom.pointsDiscussed ? (
                        <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Minutes of Meeting</h5>
                          <div className="space-y-3">
                            {activity.mom.attendees && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Attendees</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300">{activity.mom.attendees}</p>
                              </div>
                            )}
                            {activity.mom.pointsDiscussed && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Discussion Points</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.mom.pointsDiscussed}</p>
                              </div>
                            )}
                            {activity.mom.actionItems && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Action Items</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.mom.actionItems}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{activity.description}</p>
                      )}
                      {activity.duration && activity.duration !== 'N/A' && !activity.mom && (
                        <span className="inline-block mt-2 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                          Duration: {activity.duration}
                        </span>
                      )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-400 pl-6">No activity recorded yet.</div>
                  )}
                </div>
                
                {/* Log Activity Box */}
                <div className="mt-8 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500"/> Log Activity</h4>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setActivityType('call')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activityType === 'call' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>Log Call</button>
                    <button onClick={() => setActivityType('email')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activityType === 'email' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>Log Email</button>
                    <button onClick={() => setActivityType('meeting')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activityType === 'meeting' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>Schedule Meeting</button>
                  </div>
                  <textarea value={newActivityDesc} onChange={(e) => setNewActivityDesc(e.target.value)} placeholder="Write a summary..." className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 bg-transparent dark:text-white mb-3" rows="2"></textarea>
                  <button onClick={handleLogActivity} disabled={isLogging || !newActivityDesc.trim()} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow hover:bg-indigo-700 transition disabled:opacity-50">Save Activity</button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="text-slate-700 dark:text-slate-300 text-sm mt-4 p-4 bg-white dark:bg-slate-950 rounded-xl whitespace-pre-wrap shadow-sm border border-slate-100 dark:border-slate-800">
                {lead.notes || 'No notes available.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {showMOMModal && (
        <AddMOMModal 
          lead={lead} 
          onClose={() => setShowMOMModal(false)}
          onSaved={() => {
            if (onLeadUpdated) onLeadUpdated();
            setActiveTab('activities');
          }}
        />
      )}

      {/* Closed Lost Prompt */}
      {showLostModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mark as Closed Lost</h2>
              <p className="text-sm text-slate-500 mt-1">Provide context to help optimize future targeting.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Lost Reason</label>
                <select value={lostReason} onChange={e => setLostReason(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                  <option value="">Select a reason...</option>
                  <option value="Pricing too high">Pricing too high</option>
                  <option value="Went with competitor">Went with competitor</option>
                  <option value="Timing not right">Timing not right</option>
                  <option value="Lack of budget">Lack of budget</option>
                  <option value="No response/Ghosted">No response/Ghosted</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Next Step (Re-engagement)</label>
                <select value={followupDelay} onChange={e => setFollowupDelay(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                  <option value="0">Do not follow up</option>
                  <option value="1">Follow up in 1 month</option>
                  <option value="3">Follow up in 3 months</option>
                  <option value="6">Follow up in 6 months</option>
                  <option value="12">Follow up in 1 year</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button onClick={() => setShowLostModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition">Cancel</button>
              <button onClick={handleSubmitLost} className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition">Confirm Loss</button>
            </div>
          </div>
        </div>
      )}

      {/* Closed Won Prompt */}
      {showWonModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Deal Won! 🎉</h2>
              <p className="text-sm text-slate-500 mb-6">Congratulations! You've successfully converted {lead.company || lead.name} into a customer.</p>
              
              <div className="space-y-3">
                <button onClick={() => handleSubmitWon(true)} className="w-full px-4 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg transition">
                  Create Initial Quotation/Invoice
                </button>
                <button onClick={() => handleSubmitWon(false)} className="w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition">
                  Just Mark as Won
                </button>
                <button onClick={() => setShowWonModal(false)} className="w-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
