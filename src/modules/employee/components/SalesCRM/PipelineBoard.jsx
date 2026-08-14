import React from 'react';
import { MoreVertical } from 'lucide-react';
import { salesService } from '../../../../services/salesService';

const PIPELINE_STAGES = [
  "Lead",
  "Contacted",
  "Qualified",
  "Meeting Scheduled",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
];

export default function PipelineBoard({ leads, onLeadClick, onLeadUpdated }) {
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;

    const lead = leads.find(l => l._id === leadId || l.id === leadId);
    if (!lead) return;

    if (lead.status === targetStage) return;

    // Prevent moving from Closed back to open stages
    if (["Closed Won", "Closed Lost"].includes(lead.status) && !["Closed Won", "Closed Lost"].includes(targetStage)) {
      alert(`Cannot move a closed lead back to ${targetStage}`);
      return;
    }

    try {
      await salesService.advanceLead(lead._id || lead.id, targetStage);
      if (onLeadUpdated) onLeadUpdated();
    } catch (err) {
      alert(err.message || "Failed to update pipeline stage");
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto min-h-[600px]">
      <div className="flex gap-6 min-w-max h-full">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.status === stage);
          
          return (
            <div 
              key={stage} 
              className="w-80 flex flex-col bg-slate-100 dark:bg-slate-950/50 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {stage}
                </h3>
                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead._id || lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead._id || lead.id)}
                    onClick={() => onLeadClick && onLeadClick(lead)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {lead.company || lead.name}
                      </h4>
                      <button className="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      {lead.name}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                        lead.priority === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' :
                        lead.priority === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {lead.priority || 'Low'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {lead.amount || lead.budget ? (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            ₹{lead.amount || lead.budget}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
