const fs = require('fs');
const file = '/Users/apple/Documents/HRMS-fff/src/pages/employees/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Chunk 1: States
content = content.replace(
  `  // Lead modal and creations
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({`,
  `  // Lead modal and creations
  const [showLeadModal, setShowLeadModal] = useState(false);
  
  // Lead Details & Update Modal
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadUpdateInput, setLeadUpdateInput] = useState({});

  const [newLead, setNewLead] = useState({`
);

// Chunk 2: Handlers
content = content.replace(
  `      triggerToast("Failed to register lead in database.", "error");
    }
  };

  const handleDwrSubmit = async (e) => {`,
  `      triggerToast("Failed to register lead in database.", "error");
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const updated = await salesService.updateLead(selectedLead._id || selectedLead.id, leadUpdateInput);
      setLeads((prev) => prev.map((l) => (l._id || l.id) === (updated._id || updated.id) ? updated : l));
      setShowLeadDetailsModal(false);
      triggerToast("Lead details updated successfully!", "success");
    } catch (err) {
      triggerToast("Failed to update lead.", "error");
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await salesService.deleteLead(selectedLead._id || selectedLead.id);
      setLeads((prev) => prev.filter((l) => (l._id || l.id) !== (selectedLead._id || selectedLead.id)));
      setShowLeadDetailsModal(false);
      triggerToast("Lead deleted successfully.", "success");
    } catch (err) {
      triggerToast("Failed to delete lead.", "error");
    }
  };

  const handleDwrSubmit = async (e) => {`
);

// Chunk 3: Clickable card
content = content.replace(
  `                      {stageLeads.map((lead) => (
                        <div
                          key={lead._id || lead.id}
                          className={\`p-3 border rounded-xl shadow-xs space-y-2 hover:shadow transition \${lead.status === "Closed Won" ? "bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40" : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-850"}\`}`,
  `                      {stageLeads.map((lead) => (
                        <div
                          key={lead._id || lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setLeadUpdateInput({
                              status: lead.status,
                              next_followup: lead.next_followup || "",
                              priority: lead.priority || "Medium",
                              notes: lead.notes || ""
                            });
                            setShowLeadDetailsModal(true);
                          }}
                          className={\`p-3 border rounded-xl shadow-xs space-y-2 hover:shadow transition cursor-pointer \${lead.status === "Closed Won" ? "bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40" : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-850"}\`}`
);

// Chunk 4: Inner buttons stopPropagation
const innerButtonsTarget = `                              <div className="flex items-center gap-1.5">
                                {stage.showPhone && (
                                  <button
                                    onClick={() => startSimulatedCall(lead)}
                                    className="p-1.5 bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 rounded hover:bg-indigo-100 transition"
                                    title="Call Prospect"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {stage.showGps && (
                                  <button
                                    onClick={() => triggerGpsCheckin(lead)}
                                    className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 rounded hover:bg-emerald-100 transition"
                                    title="GPS Client Check-in"
                                  >
                                    <Navigation className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {lead.status !== "Closed Won" && (
                              <button
                                onClick={() => advanceLeadStatus(lead._id || lead.id, stage.nextStatus)}
                                className={stage.id === "negotiation" ? "px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold shadow-xs cursor-pointer" : "text-[9px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"}`;

const innerButtonsReplacement = `                              <div className="flex items-center gap-1.5">
                                {stage.showPhone && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); startSimulatedCall(lead); }}
                                    className="p-1.5 bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30 rounded hover:bg-indigo-100 transition"
                                    title="Call Prospect"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {stage.showGps && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); triggerGpsCheckin(lead); }}
                                    className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 rounded hover:bg-emerald-100 transition"
                                    title="GPS Client Check-in"
                                  >
                                    <Navigation className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {lead.status !== "Closed Won" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); advanceLeadStatus(lead._id || lead.id, stage.nextStatus); }}
                                className={stage.id === "negotiation" ? "px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold shadow-xs cursor-pointer" : "text-[9px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"}`;

content = content.replace(innerButtonsTarget, innerButtonsReplacement);

// Chunk 5: Modal Insertion
const modalInsertionTarget = `          {/* Create Prospect Modal */}
          {showLeadModal && (`;

const modalInsertionReplacement = `          {/* Lead Details & Update Modal */}
          {showLeadDetailsModal && selectedLead && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm px-4">
              <div className="glass-panel w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-in fade-in-50 zoom-in-95 duration-200">
                <button
                  onClick={() => setShowLeadDetailsModal(false)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-6">
                  <UserPlus className="w-5.5 h-5.5 text-indigo-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Lead Details
                  </h3>
                </div>
                
                {/* Read-only Information */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{selectedLead.name}</h4>
                  <p className="text-xs text-slate-500 mb-3">{selectedLead.company}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedLead.phone || "N/A"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedLead.email || "N/A"}
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleUpdateLead}
                  className="space-y-4 text-xs font-semibold text-slate-500"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Pipeline Status
                      </label>
                      <select
                        value={leadUpdateInput.status}
                        onChange={(e) => setLeadUpdateInput((prev) => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
                      >
                        <option value="Lead">Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Meeting Scheduled">Meeting Scheduled</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                        Priority
                      </label>
                      <select
                        value={leadUpdateInput.priority}
                        onChange={(e) => setLeadUpdateInput((prev) => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium appearance-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Next Follow-up Date/Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-08-15 10:00 AM"
                      value={leadUpdateInput.next_followup}
                      onChange={(e) => setLeadUpdateInput((prev) => ({ ...prev, next_followup: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="text-slate-400 block mb-1 uppercase tracking-wider text-[9px] font-bold">
                      Lead Notes
                    </label>
                    <textarea
                      placeholder="Add conversation notes here..."
                      rows="3"
                      value={leadUpdateInput.notes}
                      onChange={(e) => setLeadUpdateInput((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white font-medium resize-none"
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
                    <button
                      type="button"
                      onClick={handleDeleteLead}
                      className="flex-1 py-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 rounded-xl transition shadow-xs"
                    >
                      Delete Lead
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow shadow-indigo-600/20"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Prospect Modal */}
          {showLeadModal && (`;

content = content.replace(modalInsertionTarget, modalInsertionReplacement);

fs.writeFileSync(file, content);
console.log("Successfully added Lead Details modal!");
