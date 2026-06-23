import React, { useState } from 'react';
import { Briefcase, Users, LayoutDashboard, Calendar, BarChart3 } from 'lucide-react';
import JobsList from '../../components/HR/Recruitment/JobsList';
import KanbanPipeline from '../../components/HR/Recruitment/KanbanPipeline';

export default function HRRecruitment({ triggerToast }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [selectedJobId, setSelectedJobId] = useState(null);

  const tabs = [
    { id: 'jobs', label: 'Job Requisitions', icon: Briefcase },
    { id: 'pipeline', label: 'Pipeline Board', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidate DB', icon: Users },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <div className="pt-2">
        {activeTab === 'jobs' && (
          <JobsList triggerToast={triggerToast} setActiveTab={setActiveTab} setSelectedJobId={setSelectedJobId} />
        )}
        
        {activeTab === 'pipeline' && (
          <KanbanPipeline triggerToast={triggerToast} selectedJobId={selectedJobId} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'candidates' && (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Candidate Database</h3>
            <p className="text-xs text-slate-400 mt-2">All candidate resumes and profiles will be securely stored here.</p>
          </div>
        )}

        {activeTab === 'interviews' && (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Interview Scheduler</h3>
            <p className="text-xs text-slate-400 mt-2">Schedule candidate interviews with hiring managers.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recruitment Analytics</h3>
            <p className="text-xs text-slate-400 mt-2">View real-time metrics on your hiring pipeline conversions.</p>
          </div>
        )}
      </div>

    </div>
  );
}
