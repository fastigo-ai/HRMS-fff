import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { salesService } from '../../../../services/salesService';

export default function AddLeadModal({ initialData, onClose, onLeadAdded }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    source: initialData?.source || 'Website',
    priority: initialData?.priority || 'Medium',
    industry: initialData?.industry || 'Technology',
    budget: initialData?.budget || '',
    amount: initialData?.amount || '',
    address: initialData?.address || '',
    notes: initialData?.notes || '',
    next_followup: initialData?.next_followup || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.company) {
      alert("Name and Company are required.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        source: formData.source,
        priority: formData.priority,
        industry: formData.industry,
        budget: formData.budget,
        amount: Number(formData.amount) || 0,
        address: formData.address,
        next_followup: formData.next_followup,
        notes: formData.notes
      };

      if (initialData) {
        await salesService.updateLead(initialData._id, payload);
      } else {
        await salesService.registerLead(payload);
      }
      
      if (onLeadAdded) {
        onLeadAdded();
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to register lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Lead' : 'Add New Lead'}</h2>
            <p className="text-xs text-slate-500">{initialData ? 'Update the lead information below.' : 'Enter lead details to enter them into the pipeline.'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} type="text" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="Jane Doe" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company *</label>
              <input name="company" value={formData.company} onChange={handleChange} type="text" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="Acme Corp" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} type="text" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Industry</label>
              <select name="industry" value={formData.industry} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500">
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Lead Source</label>
              <select name="source" value={formData.source} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500">
                <option value="Website">Website</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook">Facebook</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn Outbound">LinkedIn Outbound</option>
                <option value="Walk-in">Walk-in</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Budget Estimate</label>
              <input name="budget" value={formData.budget} onChange={handleChange} type="text" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="₹5.0L" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Deal Value (₹)</label>
              <input name="amount" value={formData.amount} onChange={handleChange} type="number" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. 50000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Next Follow-up</label>
              <input name="next_followup" value={formData.next_followup} onChange={handleChange} type="datetime-local" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address</label>
            <input name="address" value={formData.address} onChange={handleChange} type="text" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="123 Main St, City" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Initial Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm bg-transparent dark:text-white focus:outline-none focus:border-indigo-500" placeholder="Any context or background..."></textarea>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={isSubmitting} className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : initialData ? 'Update Lead' : 'Save Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
