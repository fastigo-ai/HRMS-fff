import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';

export default function LeadList({ leads, onRowClick, onAddLeadClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Leads</h3>
          <p className="text-xs text-slate-400">Manage and convert your sales pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 w-60"
            />
          </div>
          <button className="p-2 text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={onAddLeadClick}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 px-4">Lead Info</th>
              <th className="pb-3 px-4">Source</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4">Priority</th>
              <th className="pb-3 px-4">Assignee</th>
              <th className="pb-3 px-4">Created</th>
              <th className="pb-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
            {filteredLeads.map((lead) => (
              <tr 
                key={lead._id || lead.id} 
                onClick={() => onRowClick(lead)}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors cursor-pointer group"
              >
                <td className="py-4 px-4">
                  <div className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 transition">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.company} • {lead.phone}</div>
                </td>
                <td className="py-4 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{lead.source}</td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase border ${
                    lead.status === 'Qualified' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/50' :
                    lead.status === 'Contacted' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/50' :
                    lead.status === 'Negotiation' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/50' :
                    lead.status === 'Won' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900/50' :
                    'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    lead.priority === 'High' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {lead.priority}
                  </span>
                </td>
                <td className="py-4 px-4 text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                    {(lead.assignee?.name || lead.assignee || 'U').charAt(0)}
                  </div>
                  {lead.assignee?.name || lead.assignee || 'Unassigned'}
                </td>
                <td className="py-4 px-4 text-xs text-slate-400">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : lead.createdDate}</td>
                <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"><MoreVertical className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-slate-500">No leads found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
