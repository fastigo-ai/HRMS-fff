const fs = require('fs');
const file = '/Users/apple/Documents/HRMS-fff/src/pages/employees/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const stagesCode = `};

const PIPELINE_STAGES = [
  {
    id: "leads",
    title: "1. Leads Prospecting",
    validStatuses: ["Lead"],
    showPhone: true,
    showGps: false,
    nextStatus: "Contacted",
    nextLabel: "Contact"
  },
  {
    id: "outreach",
    title: "2. Outreach Done",
    validStatuses: ["Contacted"],
    showPhone: true,
    showGps: true,
    nextStatus: "Qualified",
    nextLabel: "Qualify"
  },
  {
    id: "qualified",
    title: "3. Qualified SQLs",
    validStatuses: ["Qualified", "Meeting Scheduled"],
    showPhone: false,
    showGps: true,
    nextStatus: "Negotiation",
    nextLabel: "Negotiate"
  },
  {
    id: "negotiation",
    title: "4. Negotiations & Won",
    validStatuses: ["Negotiation", "Closed Won"],
    showPhone: false,
    showGps: false,
    nextStatus: "Closed Won",
    nextLabel: "Mark Won"
  }
];

export default function Dashboard({`;

content = content.replace("};\n\nexport default function Dashboard({", stagesCode);

const columnsStart = `            {/* Pipeline Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">`;
const columnsEnd = `              </div>
            </div>
          </div>

          {/* Activities Timeline & DWR summaries */}`;

const startIndex = content.indexOf(columnsStart);
const endIndex = content.indexOf(columnsEnd);

if (startIndex > -1 && endIndex > -1) {
  const newColumns = `            {/* Pipeline Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PIPELINE_STAGES.map((stage) => {
                const stageLeads = leads.filter((l) => stage.validStatuses.includes(l.status));
                return (
                  <div key={stage.id} className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 p-4 rounded-2xl flex flex-col space-y-4 min-h-[350px]">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-150 dark:border-slate-900">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        {stage.title}
                      </span>
                      <span className="text-[9px] font-bold bg-slate-200 dark:bg-slate-900 text-slate-600 px-2 py-0.5 rounded">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead._id || lead.id}
                          className={\`p-3 border rounded-xl shadow-xs space-y-2 hover:shadow transition \${lead.status === "Closed Won" ? "bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/40" : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-850"}\`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-100/40">
                              {stage.id === "negotiation" ? "Proposal" : lead.source}
                            </span>
                            <span
                              className={\`text-[8px] font-extrabold px-1.5 py-0.5 rounded \${lead.status === "Closed Won" ? "bg-emerald-100 text-emerald-700" : stage.id === "qualified" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : lead.priority === "High" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-500 border"}\`}
                            >
                              {lead.status === "Closed Won" ? lead.status : stage.id === "qualified" ? "SQL" : lead.priority}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                            {lead.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {lead.company}
                          </p>
                          
                          {(lead.status === "Qualified" || lead.status === "Meeting Scheduled") && (
                            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded text-[9px] text-slate-500 font-medium">
                              <strong>Pipeline:</strong>{" "}
                              {lead.status === "Qualified"
                                ? "Qualification verified"
                                : "Meeting set: " + lead.next_followup}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/50">
                            {stage.id === "negotiation" ? (
                              <span className="text-[9px] text-slate-400 font-bold block">
                                Follow-up: {lead.next_followup}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
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
                                className={stage.id === "negotiation" ? "px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold shadow-xs cursor-pointer" : "text-[9px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-0.5"}
                              >
                                {stage.nextLabel} {stage.id !== "negotiation" && <ChevronRight className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
`;
  content = content.substring(0, startIndex) + newColumns + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Successfully refactored Dashboard.jsx");
} else {
  console.log("Failed to find boundaries in Dashboard.jsx", {startIndex, endIndex});
}
