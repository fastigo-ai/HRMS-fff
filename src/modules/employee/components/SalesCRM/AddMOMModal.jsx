import React, { useState } from 'react';
import { X, Users, MessageSquare, CheckSquare, Clock } from 'lucide-react';
import { salesService } from '../../../../services/salesService';
import { useUiStore } from '../../../../store/uiStore';

export default function AddMOMModal({ lead, onClose, onSaved }) {
  const [attendees, setAttendees] = useState('');
  const [pointsDiscussed, setPointsDiscussed] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [duration, setDuration] = useState('30 mins');
  const [isSaving, setIsSaving] = useState(false);
  
  const { triggerToast } = useUiStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attendees || !pointsDiscussed) {
      triggerToast("Attendees and Points Discussed are required.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      await salesService.addActivity({
        leadId: lead._id,
        leadName: lead.name,
        company: lead.company,
        type: 'meeting',
        description: 'Minutes of Meeting logged',
        duration,
        outcome: 'MOM Captured',
        mom: {
          attendees,
          pointsDiscussed,
          actionItems
        }
      });
      triggerToast("MOM successfully logged!");
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      triggerToast(err.message || "Failed to log MOM", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Log Minutes of Meeting (MOM)</h2>
            <p className="text-sm text-slate-500 mt-1">For {lead.company || lead.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form id="momForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Attendees
              </label>
              <input 
                type="text" 
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="E.g. John Doe, Jane Smith, Alex"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Duration
                </label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option>15 mins</option>
                  <option>30 mins</option>
                  <option>45 mins</option>
                  <option>1 hour</option>
                  <option>1.5 hours</option>
                  <option>2 hours+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Points Discussed
              </label>
              <textarea 
                value={pointsDiscussed}
                onChange={(e) => setPointsDiscussed(e.target.value)}
                rows={5}
                placeholder="1. Discussed pricing model...&#10;2. Client requested timeline for phase 1..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Action Items / Next Steps
              </label>
              <textarea 
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                rows={3}
                placeholder="- Send updated proposal by EOD&#10;- Schedule technical review call"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="momForm"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save MOM"}
          </button>
        </div>
      </div>
    </div>
  );
}
