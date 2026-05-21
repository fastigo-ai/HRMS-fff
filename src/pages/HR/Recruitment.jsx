import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Video,
  Phone,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  Lightbulb,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { DatabaseService } from '../../services/api';

export default function HRRecruitment({
  triggerToast
}) {
  const [candidates, setCandidates] = useState([]);
  const [sourcingChannels, setSourcingChannels] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch recruitment database state
  useEffect(() => {
    const loadRecruitment = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.getHRRecruitment();
        setCandidates(data.candidates);
        setSourcingChannels(data.sourcingChannels);
        setInterviews(data.interviews);
      } catch (err) {
        triggerToast('Failed to load recruitment pipeline schema.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadRecruitment();
  }, []);

  const handleAddCandidate = async () => {
    const name = prompt("Enter candidate's full name:");
    if (!name) return;
    const role = prompt("Enter job title / role (e.g. Frontend Architect):", "Frontend Developer");
    if (!role) return;

    const newCandidate = {
      name,
      role,
      stage: 'applied',
      badge: 'New Application',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
      time: 'Just now',
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    };

    try {
      const updated = await DatabaseService.addCandidate(newCandidate);
      setCandidates(updated);
      triggerToast(`Candidate ${name} added to Applied stage successfully!`);
    } catch (err) {
      triggerToast('Error saving candidate to cache database.', 'error');
    }
  };

  const moveCandidate = async (id, newStage) => {
    try {
      // Optimistic pipeline transition
      setCandidates(candidates.map(c => {
        if (c.id === id) {
          let badge = 'Review Pending';
          let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400';
          
          if (newStage === 'screening') {
            badge = 'Phone Screen';
            badgeColor = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
          } else if (newStage === 'interview') {
            badge = 'Panel Round 2';
            badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900';
          }
          return { ...c, stage: newStage, badge, badgeColor };
        }
        return c;
      }));
      triggerToast('Candidate pipeline stage updated.');
      
      // Async API update
      await DatabaseService.updateCandidateStage(id, newStage);
    } catch (err) {
      triggerToast('Failed to sync candidate transition.', 'error');
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // High-fidelity loading shimmer skeletons
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full max-w-xl"></div>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="h-10 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
          <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-xl w-64"></div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(c => (
              <div key={c} className="h-96 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-3xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Search bar area matching screenshot exactly */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search candidates or roles..." 
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white shadow-sm"
        />
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recruitment Pipeline</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Manage hiring stages and track candidate progress across active departments.
          </p>
        </div>

        {/* Stats and Action button panel */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-6 shadow-sm">
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Open Positions</span>
              <span className="text-lg font-extrabold text-slate-850 dark:text-white">8</span>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-900"></div>
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Qualified Candidates</span>
              <span className="text-lg font-extrabold text-indigo-650 dark:text-indigo-400">{candidates.length}</span>
            </div>
          </div>

          <button 
            onClick={handleAddCandidate}
            className="flex items-center gap-2 px-5 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Main Grid Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Kanban Board Columns (Left 3 Columns span) */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* COLUMN 1: Applied */}
          <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Applied</span>
                <span className="text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                  {filteredCandidates.filter(c => c.stage === 'applied').length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-650"><MoreHorizontal className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              {filteredCandidates.filter(c => c.stage === 'applied').map(c => (
                <div 
                  key={c.id} 
                  className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-950 transition cursor-pointer group relative"
                >
                  <div className="flex items-start gap-3">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 text-xs font-extrabold flex items-center justify-center">
                        {c.initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{c.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900 text-[9px] font-bold">
                    <span className={`px-2 py-0.5 rounded border ${c.badgeColor || 'bg-slate-100 text-slate-700'}`}>{c.badge || 'New'}</span>
                    <span className="text-slate-400 flex items-center gap-1">⏰ {c.time || 'Just now'}</span>
                  </div>

                  {/* Drag / Transition buttons overlay */}
                  <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-white/80 dark:bg-slate-950/80 p-1 rounded-lg backdrop-blur">
                    <button 
                      onClick={() => moveCandidate(c.id, 'screening')}
                      className="px-2 py-0.5 text-[9px] font-extrabold text-indigo-650 hover:bg-slate-50 rounded"
                    >
                      Screening →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: Screening */}
          <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Screening</span>
                <span className="text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                  {filteredCandidates.filter(c => c.stage === 'screening').length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-650"><MoreHorizontal className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              {filteredCandidates.filter(c => c.stage === 'screening').map(c => {
                return (
                  <div 
                    key={c.id} 
                    className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-950 transition cursor-pointer group relative"
                  >
                    <div className="flex items-start gap-3">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 text-xs font-extrabold flex items-center justify-center">
                          {c.initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{c.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900 text-[9px] font-bold">
                      <span className={`px-2 py-0.5 rounded border ${c.badgeColor || 'bg-slate-100 text-slate-700'}`}>{c.badge || 'Phone Screen'}</span>
                      <span className="text-slate-400 flex items-center gap-1">⏰ {c.time || '1d ago'}</span>
                    </div>

                    {/* Drag / Transition buttons overlay */}
                    <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-white/80 dark:bg-slate-950/80 p-1 rounded-lg backdrop-blur">
                      <button 
                        onClick={() => moveCandidate(c.id, 'applied')}
                        className="px-2 py-0.5 text-[9px] font-extrabold text-slate-550 hover:bg-slate-50 rounded"
                      >
                        ← Applied
                      </button>
                      <button 
                        onClick={() => moveCandidate(c.id, 'interview')}
                        className="px-2 py-0.5 text-[9px] font-extrabold text-indigo-650 hover:bg-slate-50 rounded"
                      >
                        Interview →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 3: Interview */}
          <div className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-450 inline-block"></span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interview</span>
                <span className="text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                  {filteredCandidates.filter(c => c.stage === 'interview').length}
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-650"><MoreHorizontal className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              {filteredCandidates.filter(c => c.stage === 'interview').map(c => {
                return (
                  <div 
                    key={c.id} 
                    className="bg-indigo-50/20 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/60 shadow-sm space-y-3 hover:shadow-md transition cursor-pointer group relative"
                  >
                    <div className="flex items-start gap-3">
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-750 dark:bg-indigo-950/40 text-xs font-extrabold flex items-center justify-center">
                          {c.initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</h4>
                          <Video className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{c.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-[9px] font-bold">
                      <span className={`px-2 py-0.5 rounded border ${c.badgeColor || 'bg-slate-100 text-slate-700'}`}>{c.badge || 'Panel Round 2'}</span>
                      <span className="text-slate-400">{c.time || 'Tomorrow'}</span>
                    </div>

                    {/* Drag / Transition buttons overlay */}
                    <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-white/80 dark:bg-slate-950/80 p-1 rounded-lg backdrop-blur">
                      <button 
                        onClick={() => moveCandidate(c.id, 'screening')}
                        className="px-2 py-0.5 text-[9px] font-extrabold text-slate-550 hover:bg-slate-50 rounded"
                      >
                        ← Screening
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Sidebar Widgets Panel */}
        <div className="space-y-6">
          
          {/* Interview Schedule */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Interview Schedule</h3>
              <button 
                onClick={() => triggerToast('Opening full interview agenda')}
                className="text-[10px] font-bold text-indigo-650 hover:text-indigo-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {interviews.map(evt => (
                <div key={evt.id} className="flex items-start gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-center rounded-xl p-2 shrink-0 w-12">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{evt.date.split(' ')[0]}</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white block mt-0.5">{evt.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{evt.title}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">{evt.candidate} • {evt.time}</p>
                    
                    <div className="flex items-center gap-1.5 mt-2">
                      <img src={evt.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-white dark:border-slate-950" />
                      <span className="text-[7px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">{evt.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruitment Analytics */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">Recruitment Analytics</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Avg. Time to Hire</span>
              <span className="text-xs font-extrabold text-indigo-600">18 Days</span>
            </div>

            {/* Time progress bar */}
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className="bg-indigo-650 h-full w-[65%]" style={{ width: '65%' }}></div>
              </div>
              <span className="text-[8px] text-emerald-600 font-bold block">2 days faster than last month</span>
            </div>

            {/* Sourcing channels list */}
            <div className="pt-2 space-y-2 border-t border-slate-50 dark:border-slate-900">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Top Sourcing Channels</span>
              
              {sourcingChannels.map((ch, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-indigo-400' : 'bg-indigo-300'}`}></span>
                    <span>{ch.name.split(' ')[0]}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{ch.percentage}%</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => triggerToast('Full sourcing ledger compiled as PDF')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 rounded-xl transition"
            >
              Generate Full Report
            </button>
          </div>

          {/* Hiring Tip Peach Box */}
          <div className="bg-orange-50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/40 p-5 rounded-3xl space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orange-600 shrink-0" />
              <h4 className="text-[10px] font-extrabold text-orange-800 dark:text-orange-400 uppercase tracking-widest">Hiring Tip</h4>
            </div>
            <p className="text-[10px] text-orange-850 dark:text-orange-300 leading-relaxed font-semibold">
              Collaborative hiring is 3x more effective. Tag your team members in candidate cards to get instant feedback.
            </p>
            
            <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-10 translate-x-2 translate-y-2">
              <Lightbulb className="w-16 h-16 text-orange-800" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
