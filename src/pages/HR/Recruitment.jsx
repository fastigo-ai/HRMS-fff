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
  MoreHorizontal,
  Trash2,
  User,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { DatabaseService } from '../../services/api';
import Modal from '../../shared/ui/Modal';

export default function HRRecruitment({ triggerToast }) {
  const [candidates, setCandidates] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    activeCandidates: 0,
    avgTimeToHire: 18,
    sourcingChannels: []
  });
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Add candidate form states
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    role: '',
    email: '',
    source: 'LinkedIn Outbound',
    notes: ''
  });

  const stages = ["Applied", "Screening", "Technical Round", "Manager Round", "Offer Extended", "Hired", "Rejected"];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Applied': return { dot: 'bg-indigo-500', text: 'text-indigo-650 dark:text-indigo-400', badge: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 text-indigo-700' };
      case 'Screening': return { dot: 'bg-amber-500', text: 'text-amber-650 dark:text-amber-400', badge: 'bg-amber-50 border-amber-100 dark:bg-amber-950/40 text-amber-700' };
      case 'Technical Round': return { dot: 'bg-purple-500', text: 'text-purple-650 dark:text-purple-400', badge: 'bg-purple-50 border-purple-100 dark:bg-purple-950/40 text-purple-700' };
      case 'Manager Round': return { dot: 'bg-orange-500', text: 'text-orange-650 dark:text-orange-400', badge: 'bg-orange-50 border-orange-100 dark:bg-orange-950/40 text-orange-700' };
      case 'Offer Extended': return { dot: 'bg-pink-500', text: 'text-pink-650 dark:text-pink-400', badge: 'bg-pink-50 border-pink-100 dark:bg-pink-950/40 text-pink-700' };
      case 'Hired': return { dot: 'bg-emerald-500', text: 'text-emerald-650 dark:text-emerald-400', badge: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/40 text-emerald-700' };
      case 'Rejected': return { dot: 'bg-rose-500', text: 'text-rose-655 dark:text-rose-400', badge: 'bg-rose-50 border-rose-100 dark:bg-rose-950/40 text-rose-700' };
      default: return { dot: 'bg-slate-500', text: 'text-slate-500', badge: 'bg-slate-50 border-slate-100 text-slate-700' };
    }
  };

  const loadRecruitment = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getHRRecruitment();
      setCandidates(data.candidates);
      setMetrics(data.metrics);
      setInterviews(data.interviews);
    } catch (err) {
      triggerToast('Failed to load recruitment pipeline schema.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recruitment database state
  useEffect(() => {
    loadRecruitment();
  }, []);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.role) {
      triggerToast('Name and Role are required!', 'error');
      return;
    }

    try {
      await DatabaseService.addCandidate(candidateForm);
      triggerToast(`Candidate ${candidateForm.name} added to pipeline.`);
      setIsAddModalOpen(false);
      setCandidateForm({
        name: '',
        role: '',
        email: '',
        source: 'LinkedIn Outbound',
        notes: ''
      });
      await loadRecruitment();
    } catch (err) {
      triggerToast('Error saving candidate to database.', 'error');
    }
  };

  const moveCandidate = async (id, newStage) => {
    try {
      await DatabaseService.updateCandidateStage(id, newStage);
      triggerToast('Candidate pipeline stage updated.');
      
      // Update selectedCandidate if it is currently open
      if (selectedCandidate && selectedCandidate._id === id) {
        setSelectedCandidate(prev => ({
          ...prev,
          stage: newStage,
          stageHistory: [...prev.stageHistory, { stage: newStage, enteredAt: new Date() }]
        }));
      }

      await loadRecruitment();
    } catch (err) {
      triggerToast('Failed to sync candidate transition.', 'error');
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await DatabaseService.deleteCandidate(id);
      triggerToast('Candidate successfully removed from pipeline.');
      setIsDetailModalOpen(false);
      setSelectedCandidate(null);
      await loadRecruitment();
    } catch (err) {
      triggerToast('Failed to delete candidate.', 'error');
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

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
      
      {/* Top Search bar area */}
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
              <span className="text-lg font-extrabold text-slate-800 dark:text-white">8</span>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-900"></div>
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Total Applicants</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{metrics.totalCandidates}</span>
            </div>
            <div className="w-px bg-slate-100 dark:bg-slate-900"></div>
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Active Pipelines</span>
              <span className="text-lg font-extrabold text-indigo-650 dark:text-indigo-400">{metrics.activeCandidates}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Main Grid Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Kanban Board Columns - Scrollable Horizontal Strip */}
        <div className="xl:col-span-3 flex gap-4 overflow-x-auto pb-4 scrollbar-thin max-w-full">
          {stages.map((stage) => {
            const stageCandidates = filteredCandidates.filter(c => c.stage === stage);
            const color = getStageColor(stage);
            return (
              <div 
                key={stage} 
                className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 space-y-4 min-w-[280px] w-[280px] shrink-0 min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-900">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${color.dot} inline-block`}></span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                    <span className="text-[10px] text-slate-450 font-bold bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                      {stageCandidates.length}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {stageCandidates.map(c => {
                    const initials = c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <div 
                        key={c._id || c.id} 
                        onClick={() => openCandidateDetails(c)}
                        className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-3 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-950 transition cursor-pointer group relative"
                      >
                        <div className="flex items-start gap-3">
                          {c.avatar ? (
                            <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-850" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 text-xs font-extrabold flex items-center justify-center border border-indigo-100/30">
                              {initials}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{c.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-900 text-[9px] font-bold">
                          <span className={`px-2 py-0.5 rounded border ${color.badge}`}>{c.source || 'Direct'}</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-450" />
                            {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Fast Move Trigger */}
                        <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 bg-white/80 dark:bg-slate-950/80 p-1 rounded-lg backdrop-blur" onClick={e => e.stopPropagation()}>
                          <select 
                            value={c.stage} 
                            onChange={(e) => moveCandidate(c._id || c.id, e.target.value)}
                            className="px-1.5 py-0.5 text-[8px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-bold text-slate-500"
                          >
                            {stages.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                  {stageCandidates.length === 0 && (
                    <div className="text-center py-8 text-slate-350 dark:text-slate-650 border border-dashed border-slate-100 dark:border-slate-900 rounded-2xl text-[10px] font-bold">
                      Drop Candidates Here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar Widgets Panel */}
        <div className="space-y-6">
          
          {/* Interview Schedule */}
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">Interview Schedule</h3>
              <button 
                onClick={() => triggerToast('Opening full interview agenda')}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {interviews.slice(0, 3).map(evt => (
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
            <h3 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">Recruitment Analytics</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Avg. Time to Hire</span>
              <span className="text-xs font-extrabold text-indigo-600">{metrics.avgTimeToHire} Days</span>
            </div>

            {/* Time progress bar */}
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: `${Math.min(100, Math.max(10, (18 / (metrics.avgTimeToHire || 18)) * 65))}%` }}></div>
              </div>
              <span className="text-[8px] text-emerald-600 font-bold block">Recruitment velocities synchronized</span>
            </div>

            {/* Sourcing channels list */}
            <div className="pt-2 space-y-2 border-t border-slate-50 dark:border-slate-900">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Top Sourcing Channels</span>
              
              {metrics.sourcingChannels.map((ch, idx) => {
                const bgColors = ['bg-indigo-650', 'bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300', 'bg-slate-300'];
                const bg = bgColors[idx] || 'bg-indigo-300';
                return (
                  <div key={ch.name} className="flex items-center justify-between text-[10px] font-semibold text-slate-655 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${bg}`}></span>
                      <span>{ch.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ch.percentage}%</span>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => triggerToast('Full sourcing ledger compiled as PDF')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 rounded-xl transition"
            >
              Generate Full Report
            </button>
          </div>

          {/* Hiring Tip Box */}
          <div className="bg-orange-50/50 border border-orange-100/40 dark:bg-orange-950/10 dark:border-orange-900/20 p-5 rounded-3xl space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orange-600 shrink-0" />
              <h4 className="text-[10px] font-extrabold text-orange-800 dark:text-orange-400 uppercase tracking-widest">Hiring Tip</h4>
            </div>
            <p className="text-[10px] text-orange-850 dark:text-orange-300 leading-relaxed font-semibold">
              Track candidate stage progression speeds to pinpoint bottlenecks in your interviewing rounds.
            </p>
          </div>

        </div>

      </div>

      {/* MODAL 1: Add Candidate Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Candidate to Pipeline">
        <form onSubmit={handleAddCandidate} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div>
            <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Elena Rostova"
              value={candidateForm.name}
              onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Target Position / Role</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Lead Frontend Architect"
              value={candidateForm.role}
              onChange={e => setCandidateForm({ ...candidateForm, role: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com"
              value={candidateForm.email}
              onChange={e => setCandidateForm({ ...candidateForm, email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Sourcing Channel</label>
            <select
              value={candidateForm.source}
              onChange={e => setCandidateForm({ ...candidateForm, source: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-slate-550"
            >
              <option value="LinkedIn Outbound">LinkedIn Outbound</option>
              <option value="Employee Referral">Employee Referral</option>
              <option value="Careers Portal">Careers Portal</option>
              <option value="Agency">Agency</option>
              <option value="Direct Application">Direct Application</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Initial Candidate Notes</label>
            <textarea 
              rows="3"
              placeholder="Candidate background details, initial assessment thoughts..."
              value={candidateForm.notes}
              onChange={e => setCandidateForm({ ...candidateForm, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-xl text-slate-700 dark:text-slate-350"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
            >
              Add Applicant
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Candidate Details & Timeline Audit Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Candidate Details & Timeline" size="lg">
        {selectedCandidate && (
          <div className="space-y-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
            
            {/* Biography Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-2xl">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 text-lg font-extrabold flex items-center justify-center border border-indigo-100/30">
                  {selectedCandidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedCandidate.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{selectedCandidate.role}</p>
                  <p className="text-[10px] text-slate-450 mt-1 font-bold">{selectedCandidate.email || "No email registered"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${getStageColor(selectedCandidate.stage).badge}`}>
                  {selectedCandidate.stage}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-150 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500">
                  {selectedCandidate.source}
                </span>
              </div>
            </div>

            {/* Note & Action panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Details column */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Recruiter Evaluation Note</label>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-850 min-h-[100px] font-medium leading-relaxed">
                    {selectedCandidate.notes || "No candidate notes registered yet."}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Change Stage</label>
                    <select
                      value={selectedCandidate.stage}
                      onChange={(e) => moveCandidate(selectedCandidate._id || selectedCandidate.id, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none font-bold text-slate-550"
                    >
                      {stages.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDeleteCandidate(selectedCandidate._id || selectedCandidate.id)}
                    className="mt-4 px-4 py-2 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Profile
                  </button>
                </div>
              </div>

              {/* Recruitment Speed Timeline (Right column) */}
              <div className="space-y-3">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-900 pb-1">Recruitment Audit Trail</label>
                
                <div className="relative pl-4 space-y-4 border-l border-slate-150 dark:border-slate-850 ml-2 pt-2">
                  {selectedCandidate.stageHistory?.map((hist, idx) => {
                    const color = getStageColor(hist.stage);
                    return (
                      <div key={idx} className="relative">
                        {/* Circle dot marker */}
                        <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-950 ${color.dot}`}></span>
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-bold ${color.text}`}>{hist.stage}</span>
                          <span className="text-[9px] text-slate-450 block font-bold">
                            {new Date(hist.enteredAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-xl text-slate-700 dark:text-slate-350"
              >
                Close View
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
