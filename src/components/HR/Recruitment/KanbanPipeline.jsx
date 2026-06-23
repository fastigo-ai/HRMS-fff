import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Plus, Clock, FileText, ArrowLeft, Send } from 'lucide-react';
import { DatabaseService } from '../../../services/api';
import Modal from '../../../shared/ui/Modal';

export default function KanbanPipeline({ triggerToast, selectedJobId, setActiveTab }) {
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidateApp, setSelectedCandidateApp] = useState(null);
  const [appForm, setAppForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', source: 'LinkedIn Outbound', notes: '', resume: null
  });

  const defaultStages = [
    "Applied", "Screening", "Shortlisted", "HR Interview", 
    "Technical Interview", "Manager Round", "Final Round", 
    "Offer Released", "Joined", "Rejected"
  ];

  const stages = job?.rounds?.length > 0 
    ? ["Applied", ...job.rounds.map(r => r.name), "Offer Released", "Joined", "Rejected"]
    : defaultStages;

  const loadData = async () => {
    if (!selectedJobId) return;
    try {
      setLoading(true);
      const [jobRes, appsRes] = await Promise.all([
        DatabaseService.getJob(selectedJobId),
        DatabaseService.getJobApplications(selectedJobId)
      ]);
      setJob(jobRes.data.job);
      setApplications(appsRes.data.applications);
    } catch (err) {
      triggerToast("Failed to load pipeline", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJobId]);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("firstName", appForm.firstName);
      formData.append("lastName", appForm.lastName);
      formData.append("email", appForm.email);
      if (appForm.phone) formData.append("phone", appForm.phone);
      if (appForm.resume) formData.append("resume", appForm.resume);
      
      // 1. Create candidate
      const candRes = await DatabaseService.createCandidate(formData);
      
      // 2. Create application
      await DatabaseService.createJobApplication({
        jobId: selectedJobId,
        candidateId: candRes.data.candidate._id,
        source: appForm.source,
        notes: appForm.notes
      });
      
      triggerToast("Candidate added to pipeline");
      setIsAddModalOpen(false);
      setAppForm({ firstName: '', lastName: '', email: '', phone: '', source: 'LinkedIn Outbound', notes: '', resume: null });
      loadData();
    } catch (err) {
      triggerToast("Failed to add candidate", "error");
    }
  };

  const moveCandidate = async (appId, newStage) => {
    try {
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, stage: newStage } : a));
      await DatabaseService.updateJobApplicationStage(appId, newStage);
      triggerToast(`Candidate moved to ${newStage}`);
      loadData(); // refresh to get history
    } catch (err) {
      triggerToast("Failed to move candidate", "error");
      loadData();
    }
  };

  const triggerVoiceScreening = async (appId) => {
    try {
      await DatabaseService.triggerVoiceScreening(appId);
      triggerToast("AI Voice Screening Call Initiated!");
      loadData();
      if (selectedCandidateApp) {
        setSelectedCandidateApp(prev => ({ 
          ...prev, 
          aiVoiceScreening: { ...prev.aiVoiceScreening, status: "in_progress" } 
        }));
      }
    } catch (err) {
      triggerToast("Failed to initiate voice screening", "error");
    }
  };

  const syncVoiceScreening = async (appId) => {
    try {
      triggerToast("Syncing voice screening status...", "info");
      const res = await DatabaseService.syncVoiceScreening(appId);
      if (res.data?.callStatus === "completed") {
        triggerToast("AI Voice Screening Completed & Evaluated!", "success");
      } else {
        triggerToast(`Call Status: ${res.data?.callStatus || "pending"}`, "info");
      }
      loadData();
      if (selectedCandidateApp && res.data?.application) {
        setSelectedCandidateApp(res.data.application);
      }
    } catch (err) {
      triggerToast("Failed to sync voice screening", "error");
    }
  };

  const runAiMatch = async (appId) => {
    try {
      triggerToast("Running AI ATS Match...", "info");
      await DatabaseService.triggerAiMatch(appId);
      triggerToast("AI Match Complete!", "success");
      loadData();
    } catch (err) {
      triggerToast("AI Match Failed", "error");
    }
  };

  if (!selectedJobId) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Select a Job Requisition</h3>
        <p className="text-xs text-slate-400 mt-2 mb-6">You need to select a specific job to view its hiring pipeline.</p>
        <button onClick={() => setActiveTab('jobs')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Go to Jobs List</button>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Pipeline...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('jobs')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{job?.title} Pipeline</h2>
            <p className="text-xs text-slate-400 mt-0.5">{job?.location} • {job?.employmentType} • {applications.length} Candidates</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin max-w-full">
        {stages.map(stage => {
          const stageApps = applications.filter(a => a.stage === stage && a.candidate);
          return (
            <div key={stage} className="bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 min-w-[280px] w-[280px] shrink-0 min-h-[500px]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                  <span className="text-[10px] text-slate-450 font-bold bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                    {stageApps.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {stageApps.map(app => (
                  <div 
                    key={app._id} 
                    onClick={() => setSelectedCandidateApp(app)}
                    className="cursor-pointer bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-3 relative group hover:border-indigo-500/50 transition-colors"
                  >
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{app.candidate.firstName} {app.candidate.lastName}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mb-2">{app.candidate.experience} • {app.source}</p>
                    
                    {app.aiMatchScore !== undefined ? (
                      <div className="mt-2 text-[10px] font-bold p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800" title={app.aiMatchReason}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-500">ATS Match</span>
                          <span className={app.aiMatchScore > 80 ? "text-emerald-500" : app.aiMatchScore > 50 ? "text-amber-500" : "text-rose-500"}>
                            {app.aiMatchScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${app.aiMatchScore > 80 ? "bg-emerald-500" : app.aiMatchScore > 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{width: `${app.aiMatchScore}%`}}></div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); runAiMatch(app._id); }} className="mt-2 w-full text-[9px] font-bold py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition">
                        Run AI Match
                      </button>
                    )}

                    <div className="absolute top-2 right-2 hidden group-hover:block bg-white/90 dark:bg-slate-950/90 rounded backdrop-blur border border-slate-100 dark:border-slate-800">
                      <select 
                        value={app.stage} 
                        onChange={(e) => { e.stopPropagation(); moveCandidate(app._id, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[9px] bg-transparent font-bold px-2 py-1 text-indigo-600 outline-none cursor-pointer"
                      >
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Candidate to Pipeline">
        <form onSubmit={handleAddCandidate} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">First Name</label>
              <input required value={appForm.firstName} onChange={e=>setAppForm({...appForm, firstName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Last Name</label>
              <input required value={appForm.lastName} onChange={e=>setAppForm({...appForm, lastName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Email</label>
              <input required type="email" value={appForm.email} onChange={e=>setAppForm({...appForm, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Phone Number</label>
              <input type="text" value={appForm.phone} onChange={e=>setAppForm({...appForm, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Source</label>
              <select value={appForm.source} onChange={e=>setAppForm({...appForm, source: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <option value="LinkedIn Outbound">LinkedIn Outbound</option>
                <option value="Employee Referral">Employee Referral</option>
                <option value="Careers Portal">Careers Portal</option>
                <option value="Agency">Agency</option>
                <option value="Direct Application">Direct Application</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Resume (PDF)</label>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={e=>setAppForm({...appForm, resume: e.target.files[0]})} 
                className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Initial Notes</label>
              <textarea rows="3" value={appForm.notes} onChange={e=>setAppForm({...appForm, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl shadow-md">Add Candidate</button>
          </div>
        </form>
      </Modal>

      {/* Candidate Details Modal */}
      {selectedCandidateApp && (
        <Modal isOpen={!!selectedCandidateApp} onClose={() => setSelectedCandidateApp(null)} title="Candidate Details">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCandidateApp.candidate.firstName} {selectedCandidateApp.candidate.lastName}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{selectedCandidateApp.candidate.email} • {selectedCandidateApp.candidate.phone || "No phone provided"}</p>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Current Stage</label>
                <select 
                  value={selectedCandidateApp.stage} 
                  onChange={(e) => {
                    moveCandidate(selectedCandidateApp._id, e.target.value);
                    setSelectedCandidateApp({ ...selectedCandidateApp, stage: e.target.value });
                  }}
                  className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold px-3 py-2 rounded-xl outline-none text-xs border border-indigo-100 dark:border-indigo-800"
                >
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold text-slate-450 block uppercase">Experience</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedCandidateApp.candidate.experience || "Not specified"}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-450 block uppercase">Source</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{selectedCandidateApp.source}</span>
              </div>
            </div>

            {selectedCandidateApp.candidate.resumeUrl && (
              <div>
                <a 
                  href={selectedCandidateApp.candidate.resumeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  <FileText className="w-4 h-4" />
                  View Original Resume
                </a>
              </div>
            )}

            {selectedCandidateApp.aiMatchScore !== undefined && (
              <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 uppercase">AI ATS Match Score</span>
                  <span className={`text-lg font-black ${selectedCandidateApp.aiMatchScore > 80 ? "text-emerald-500" : selectedCandidateApp.aiMatchScore > 50 ? "text-amber-500" : "text-rose-500"}`}>
                    {selectedCandidateApp.aiMatchScore}%
                  </span>
                </div>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-200/70 font-medium leading-relaxed">
                  {selectedCandidateApp.aiMatchReason}
                </p>
              </div>
            )}

            {job?.voiceScreening?.enabled && (
              <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 uppercase">AI Voice Screening (Omnidimension)</span>
                  <span className="px-2 py-1 rounded text-[9px] font-bold bg-white/50 dark:bg-black/20 text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                    {selectedCandidateApp.aiVoiceScreening?.status || 'pending'}
                  </span>
                </div>

                {(!selectedCandidateApp.aiVoiceScreening || selectedCandidateApp.aiVoiceScreening.status === "pending" || selectedCandidateApp.aiVoiceScreening.status === "failed") && (
                  <button 
                    onClick={() => triggerVoiceScreening(selectedCandidateApp._id)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    Trigger Voice Screening Call
                  </button>
                )}

                {selectedCandidateApp.aiVoiceScreening?.status === "in_progress" && (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200 font-bold animate-pulse">Call is currently in progress...</p>
                    <button 
                      onClick={() => syncVoiceScreening(selectedCandidateApp._id)}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-blue-100 rounded-lg text-xs font-bold transition shadow-sm border border-blue-200 dark:border-blue-700"
                    >
                      Refresh Call Status
                    </button>
                  </div>
                )}

                {selectedCandidateApp.aiVoiceScreening?.status === "completed" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/60 dark:bg-black/20 p-2 rounded-lg text-center">
                        <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">Score</p>
                        <p className="text-xl font-black text-blue-900 dark:text-blue-100">{selectedCandidateApp.aiVoiceScreening.score}/100</p>
                      </div>
                      <div className="bg-white/60 dark:bg-black/20 p-2 rounded-lg text-center">
                        <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">Decision</p>
                        <p className={`text-sm font-black mt-1 ${selectedCandidateApp.aiVoiceScreening.recommendation === 'SHORTLIST' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {selectedCandidateApp.aiVoiceScreening.recommendation}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase mb-1">Gemini Evaluation Summary</p>
                      <p className="text-xs text-blue-900/80 dark:text-blue-100/70">{selectedCandidateApp.aiVoiceScreening.summary}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase mb-1">Raw Transcript</p>
                      <div className="bg-white/60 dark:bg-black/20 p-2 rounded-lg max-h-32 overflow-y-auto mb-2">
                        <p className="text-[10px] text-blue-900/80 dark:text-blue-100/70 whitespace-pre-wrap">{selectedCandidateApp.aiVoiceScreening.transcript}</p>
                      </div>
                    </div>
                    {selectedCandidateApp.aiVoiceScreening.recordingUrl && (
                      <div>
                        <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase mb-1">Call Recording</p>
                        <audio controls src={selectedCandidateApp.aiVoiceScreening.recordingUrl} className="w-full h-8" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedCandidateApp.notes && (
              <div>
                <span className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Recruiter Notes</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedCandidateApp.notes}
                </p>
              </div>
            )}

          </div>
        </Modal>
      )}
    </div>
  );
}
