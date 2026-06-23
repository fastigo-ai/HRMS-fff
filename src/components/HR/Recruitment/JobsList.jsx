import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Users, FileText, Settings, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import Modal from '../../../shared/ui/Modal';
import { DatabaseService } from '../../../services/api';

export default function JobsList({ triggerToast, setActiveTab, setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    employmentType: 'Full-time',
    location: '',
    experience: '0-2 Years',
    salaryRange: '',
    openings: 1,
    skills: '',
    description: '',
    rounds: [{ name: 'Screening', details: '' }],
    voiceScreening: {
      enabled: false,
      autoRejectThreshold: 70,
      questions: [{ question: '', weight: 1, expectedKeywords: '' }]
    }
  });

  const loadJobs = async () => {
    try {
      const res = await DatabaseService.getJobs();
      setJobs(res.data?.jobs || []);
    } catch (err) {
      triggerToast("Failed to load jobs", "error");
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...jobForm,
        skills: jobForm.skills.split(',').map(s => s.trim()),
        voiceScreening: {
          ...jobForm.voiceScreening,
          questions: jobForm.voiceScreening.questions.map(q => ({
            ...q,
            expectedKeywords: typeof q.expectedKeywords === 'string' ? q.expectedKeywords.split(',').map(k => k.trim()) : q.expectedKeywords
          }))
        }
      };
      await DatabaseService.createJob(payload);
      triggerToast(`Job "${jobForm.title}" created successfully!`);
      setIsAddModalOpen(false);
      setJobForm({
        title: '', employmentType: 'Full-time', location: '', experience: '0-2 Years', salaryRange: '', openings: 1, skills: '', description: '', rounds: [{ name: 'Screening', details: '' }],
        voiceScreening: {
          enabled: false,
          autoRejectThreshold: 70,
          questions: [{ question: '', weight: 1, expectedKeywords: '' }]
        }
      });
      loadJobs();
    } catch (err) {
      triggerToast("Failed to create job", "error");
    }
  };

  const updateJobStatus = async (id, status) => {
    try {
      await DatabaseService.updateJob(id, { status });
      triggerToast(`Job status updated to ${status}`);
      loadJobs();
    } catch (err) {
      triggerToast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job Requisitions</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage open positions and publish to careers page.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job._id} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{job.title}</h3>
                <p className="text-xs text-slate-500 font-semibold">{job.location} • {job.employmentType}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                job.status === 'Published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                job.status === 'Closed' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' :
                'bg-slate-100 text-slate-600 dark:bg-slate-900'
              }`}>
                {job.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{job.openings} Openings</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-indigo-600">{job.applicationsCount} Apps</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
              <button 
                onClick={() => {
                  setSelectedJobId(job._id);
                  setActiveTab('pipeline');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View Pipeline &rarr;
              </button>

              <div className="flex gap-2">
                {job.status !== 'Published' && (
                  <button onClick={() => updateJobStatus(job._id, 'Published')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><CheckCircle2 className="w-4 h-4" /></button>
                )}
                {job.status !== 'Closed' && (
                  <button onClick={() => updateJobStatus(job._id, 'Closed')} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"><XCircle className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="col-span-full p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold">
            No active job requisitions. Create one to start hiring.
          </div>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Job Requisition" size="lg">
        <form onSubmit={handleAddJob} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Job Title</label>
              <input required type="text" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Employment Type</label>
              <select value={jobForm.employmentType} onChange={e => setJobForm({...jobForm, employmentType: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <option>Full-time</option><option>Contract</option><option>Internship</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Location</label>
              <input required type="text" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Experience Required</label>
              <input required type="text" value={jobForm.experience} onChange={e => setJobForm({...jobForm, experience: e.target.value})} placeholder="e.g. 2-4 Years" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">No. of Openings</label>
              <input required type="number" min="1" value={jobForm.openings} onChange={e => setJobForm({...jobForm, openings: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Skills (comma separated)</label>
              <input type="text" value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} placeholder="React, Node.js, MongoDB" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Job Description</label>
              <textarea required rows="4" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-extrabold text-slate-450 block uppercase">Custom Interview Rounds</label>
                <button 
                  type="button" 
                  onClick={() => setJobForm({...jobForm, rounds: [...jobForm.rounds, { name: '', details: '' }]})}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded"
                >
                  + Add Round
                </button>
              </div>
              <div className="space-y-3">
                {jobForm.rounds.map((round, index) => (
                  <div key={index} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex-1 space-y-2">
                      <input 
                        required
                        type="text" 
                        placeholder="Round Name (e.g. Assessment 1)" 
                        value={round.name}
                        onChange={e => {
                          const newRounds = [...jobForm.rounds];
                          newRounds[index].name = e.target.value;
                          setJobForm({...jobForm, rounds: newRounds});
                        }}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                      <textarea 
                        placeholder="Instructions / Details (Will be emailed to candidate)" 
                        rows="2"
                        value={round.details}
                        onChange={e => {
                          const newRounds = [...jobForm.rounds];
                          newRounds[index].details = e.target.value;
                          setJobForm({...jobForm, rounds: newRounds});
                        }}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                    {jobForm.rounds.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => {
                          const newRounds = jobForm.rounds.filter((_, i) => i !== index);
                          setJobForm({...jobForm, rounds: newRounds});
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-450 block uppercase">AI Voice Screening (Omnidimension)</label>
                  <p className="text-[9px] text-slate-400 mt-0.5">Automatically trigger an AI phone interview after the candidate applies.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={jobForm.voiceScreening.enabled}
                    onChange={e => setJobForm({...jobForm, voiceScreening: {...jobForm.voiceScreening, enabled: e.target.checked}})}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-100 border-slate-300 focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Enable</span>
                </label>
              </div>

              {jobForm.voiceScreening.enabled && (
                <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-450 block uppercase mb-1">Auto-Reject Threshold (Score 0-100)</label>
                    <input 
                      type="number" min="0" max="100"
                      value={jobForm.voiceScreening.autoRejectThreshold}
                      onChange={e => setJobForm({...jobForm, voiceScreening: {...jobForm.voiceScreening, autoRejectThreshold: Number(e.target.value)}})}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-slate-450 block uppercase">Screening Questions</label>
                      <button 
                        type="button" 
                        onClick={() => setJobForm({
                          ...jobForm, 
                          voiceScreening: {
                            ...jobForm.voiceScreening, 
                            questions: [...jobForm.voiceScreening.questions, { question: '', weight: 1, expectedKeywords: '' }]
                          }
                        })}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        + Add Question
                      </button>
                    </div>
                    {jobForm.voiceScreening.questions.map((q, index) => (
                      <div key={index} className="space-y-2 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <textarea 
                          required
                          placeholder="Question (e.g. Tell me about your experience with React)"
                          rows="2"
                          value={q.question}
                          onChange={e => {
                            const newQuestions = [...jobForm.voiceScreening.questions];
                            newQuestions[index].question = e.target.value;
                            setJobForm({...jobForm, voiceScreening: {...jobForm.voiceScreening, questions: newQuestions}});
                          }}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-xs"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Expected Keywords (comma separated)"
                            value={q.expectedKeywords}
                            onChange={e => {
                              const newQuestions = [...jobForm.voiceScreening.questions];
                              newQuestions[index].expectedKeywords = e.target.value;
                              setJobForm({...jobForm, voiceScreening: {...jobForm.voiceScreening, questions: newQuestions}});
                            }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-xs"
                          />
                          <input 
                            type="number" min="1" max="10" placeholder="Weight" title="Weight (1-10)"
                            value={q.weight}
                            onChange={e => {
                              const newQuestions = [...jobForm.voiceScreening.questions];
                              newQuestions[index].weight = Number(e.target.value);
                              setJobForm({...jobForm, voiceScreening: {...jobForm.voiceScreening, questions: newQuestions}});
                            }}
                            className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-xs"
                          />
                          {jobForm.voiceScreening.questions.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => {
                                const newQuestions = jobForm.voiceScreening.questions.filter((_, i) => i !== index);
                                setJobForm({...jobForm, voiceScreening: {...jobForm.voiceScreening, questions: newQuestions}});
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-xl">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Save & Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
