import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  FileText,
  Calendar,
  Layers,
  Send,
  X,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Upload,
  User,
  CheckCircle2,
  ListTodo
} from 'lucide-react';

export default function Tasks({
  tasks = [],
  startTask,
  addWorkReport,
  completeTask,
  triggerToast
}) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'report' | 'complete'
  
  // Form states for work report
  const [reportForm, setReportForm] = useState({
    dailyUpdate: '',
    workCompleted: '',
    issues: '',
    timeSpent: '',
    fileName: ''
  });

  // Form states for final completion
  const [completionForm, setCompletionForm] = useState({
    notes: '',
    fileName: ''
  });

  // Categorize columns
  const columns = [
    { id: 'Pending', title: 'Pending Tasks', color: 'border-t-slate-400 bg-slate-50/50 dark:bg-slate-900/10' },
    { id: 'In Progress', title: 'Active In-Progress', color: 'border-t-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/5' },
    { id: 'Completed', title: 'Under Review', color: 'border-t-amber-500 bg-amber-50/10 dark:bg-amber-900/5' },
    { id: 'Approved', title: 'Verified / Done', color: 'border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/5' }
  ];

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400';
      case 'Medium': return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400';
      default: return 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200';
      case 'In Progress': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100';
      case 'Completed': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-455 border-amber-100';
      case 'Approved': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100';
      case 'Reopened': return 'bg-orange-50 dark:bg-orange-950/30 text-orange-650 dark:text-orange-400 border-orange-100';
      case 'Rejected': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border-rose-100';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setActiveTab('details');
    // Clear forms
    setReportForm({ dailyUpdate: '', workCompleted: '', issues: '', timeSpent: '', fileName: '' });
    setCompletionForm({ notes: '', fileName: '' });
  };

  const handleStart = async (taskId) => {
    if (startTask) {
      await startTask(taskId, triggerToast);
      // Sync selected task locally
      const updated = tasks.find(t => t.id === taskId);
      setSelectedTask(prev => ({ ...prev, status: 'In Progress', startTime: new Date().toISOString() }));
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.dailyUpdate.trim() || !reportForm.workCompleted.trim()) {
      triggerToast('Please describe your daily update and completed work', 'error');
      return;
    }

    if (addWorkReport) {
      await addWorkReport(selectedTask.id, {
        dailyUpdate: reportForm.dailyUpdate,
        workCompleted: reportForm.workCompleted,
        issues: reportForm.issues || 'None reported',
        timeSpent: reportForm.timeSpent || '1h',
        attachment: reportForm.fileName ? { name: reportForm.fileName } : null
      }, triggerToast);

      // Update locally selected task view
      setSelectedTask(prev => {
        const nextProgress = Math.min((prev.progress || 0) + 10, 100);
        return {
          ...prev,
          progress: nextProgress,
          reports: [
            ...(prev.reports || []),
            {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              dailyUpdate: reportForm.dailyUpdate,
              workCompleted: reportForm.workCompleted,
              issues: reportForm.issues || 'None reported',
              timeSpent: reportForm.timeSpent || '1h',
              attachment: reportForm.fileName ? { name: reportForm.fileName } : null
            }
          ]
        };
      });

      // Clear report fields
      setReportForm({ dailyUpdate: '', workCompleted: '', issues: '', timeSpent: '', fileName: '' });
      setActiveTab('details');
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completionForm.notes.trim()) {
      triggerToast('Please provide completion notes for final verification', 'error');
      return;
    }

    if (completeTask) {
      await completeTask(selectedTask.id, {
        notes: completionForm.notes,
        attachments: completionForm.fileName ? [{ name: completionForm.fileName }] : []
      }, triggerToast);

      setSelectedTask(prev => ({
        ...prev,
        status: 'Completed',
        progress: 100,
        completionNotes: completionForm.notes,
        finalReport: completionForm.notes
      }));

      setCompletionForm({ notes: '', fileName: '' });
      setActiveTab('details');
    }
  };

  const handleResumeTask = async (taskId) => {
    if (startTask) {
      await startTask(taskId, triggerToast);
      setSelectedTask(prev => ({ ...prev, status: 'In Progress' }));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            Assigned Tasks & Sprint Goals
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Track and advance your active performance targets</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-950 px-4 py-2 border border-slate-100 dark:border-slate-900 rounded-xl shadow-xs">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
            Active Sprint: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">WS-SP44</span>
          </span>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {columns.map((col) => {
          // Include 'Reopened' in 'In Progress' and 'Rejected' in 'Pending' for simple columns mapping
          const colTasks = tasks.filter(t => {
            if (col.id === 'Pending') return t.status === 'Pending' || t.status === 'Rejected';
            if (col.id === 'In Progress') return t.status === 'In Progress' || t.status === 'Reopened';
            return t.status === col.id;
          });
          
          return (
            <div 
              key={col.id} 
              className={`glass-panel border-t-4 ${col.color} border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col min-h-[480px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-900 shrink-0">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{col.title}</span>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-550">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards list */}
              <div className="space-y-4 flex-1 overflow-y-auto mt-4">
                {colTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => handleTaskClick(task)}
                    className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-xs space-y-4 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800 transition cursor-pointer relative group"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-lg ${getUrgencyColor(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-lg ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                        {task.description || 'No instruction details provided. Open details to view more.'}
                      </p>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>Sprint Progress</span>
                        <span>{task.progress || 0}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Details */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 dark:border-slate-900/60 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {task.deadline || 'No due date'}
                      </span>
                      <span className="text-indigo-500 group-hover:translate-x-1 transition-transform flex items-center">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-44 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                    <ListTodo className="w-6 h-6 stroke-1.5 opacity-60 text-slate-400 mb-2" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Empty stage</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}

      </div>

      {/* Task Drawer details / interactive workflow */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 border-l border-slate-150 dark:border-slate-850 shadow-2xl p-6 flex flex-col h-full animate-in slide-in-from-right duration-250">
            
            {/* Header section */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-900">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg border border-indigo-100/40">
                    {selectedTask.category || 'Agile'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg ${getUrgencyColor(selectedTask.priority)}`}>
                    {selectedTask.priority} Priority
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg ${getStatusBadge(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                  {selectedTask.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Navigation Tabs */}
            {selectedTask.status === 'In Progress' && (
              <div className="flex border-b border-slate-100 dark:border-slate-900 mt-4">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${activeTab === 'details' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
                >
                  Task Info
                </button>
                <button 
                  onClick={() => setActiveTab('report')}
                  className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${activeTab === 'report' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
                >
                  Daily Report
                </button>
                <button 
                  onClick={() => setActiveTab('complete')}
                  className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${activeTab === 'complete' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400'}`}
                >
                  Submit Completion
                </button>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              
              {activeTab === 'details' && (
                <>
                  {/* Instructions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">Instructions & Description</h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-xl">
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                        {selectedTask.description || 'No additional instructions provided for this sprint deliverable.'}
                      </p>
                    </div>
                  </div>

                  {/* General details list */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Deadline Date</span>
                      <span className="text-xs font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        {selectedTask.deadline || 'No schedule set'}
                      </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Time Tracked</span>
                      <span className="text-xs font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        {selectedTask.startTime ? 'Geofenced Active' : 'Not Started'}
                      </span>
                    </div>
                  </div>

                  {/* Manager Feedback for Reopened / Rejected Tasks */}
                  {selectedTask.managerFeedback && (
                    <div className="p-4 bg-rose-50 border border-rose-150 dark:bg-rose-950/20 dark:border-rose-900/40 rounded-xl space-y-2">
                      <h5 className="text-xs font-extrabold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 uppercase">
                        <AlertTriangle className="w-4 h-4" /> Manager Revision Feedback
                      </h5>
                      <p className="text-xs text-rose-700 dark:text-rose-350 leading-relaxed font-bold italic">
                        "{selectedTask.managerFeedback}"
                      </p>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-xl">
                    <div className="flex justify-between text-xs font-extrabold text-slate-650 dark:text-slate-350">
                      <span className="uppercase tracking-wider">Overall Completion Progress</span>
                      <span>{selectedTask.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${selectedTask.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Work Timeline / Daily Reports */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">Sprint Activity Timeline</h4>
                    <div className="space-y-3.5 pl-3 border-l border-indigo-100 dark:border-indigo-900/60 ml-2">
                      {selectedTask.startTime && (
                        <div className="relative">
                          <span className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-950"></span>
                          <div className="pl-4">
                            <span className="text-[10px] text-slate-400 font-bold block">
                              {new Date(selectedTask.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Task Started
                            </span>
                            <p className="text-xs text-slate-500 mt-0.5">Activated geofence shift timers.</p>
                          </div>
                        </div>
                      )}

                      {selectedTask.reports && selectedTask.reports.map((rep, rIdx) => (
                        <div key={rep.id || rIdx} className="relative">
                          <span className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-550 ring-4 ring-white dark:ring-slate-950"></span>
                          <div className="pl-4 space-y-1">
                            <span className="text-[10px] text-slate-450 font-bold block">
                              {new Date(rep.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Work Report
                            </span>
                            <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100/60 dark:border-slate-800/80 p-3 rounded-xl space-y-1 text-xs">
                              <p className="text-slate-800 dark:text-slate-200"><strong className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">Daily Update:</strong> {rep.dailyUpdate}</p>
                              <p className="text-slate-650 dark:text-slate-350"><strong className="font-bold text-[10px] uppercase text-slate-400 block mb-0.5">Work Completed:</strong> {rep.workCompleted}</p>
                              {rep.issues !== 'None' && rep.issues !== 'None reported' && (
                                <p className="text-amber-650 font-bold flex items-center gap-1 mt-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Blockers: {rep.issues}
                                </p>
                              )}
                              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold">
                                <span>Time Spent: {rep.timeSpent}</span>
                                {rep.attachment && (
                                  <span className="flex items-center gap-0.5 text-indigo-500">
                                    <FileText className="w-3 h-3" /> {rep.attachment.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {selectedTask.status === 'Completed' && (
                        <div className="relative">
                          <span className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-950"></span>
                          <div className="pl-4">
                            <span className="text-[10px] text-slate-400 font-bold block">Awaiting Verification</span>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">Submitted completed deliverables package to manager review.</p>
                          </div>
                        </div>
                      )}

                      {!selectedTask.startTime && (
                        <div className="text-center py-6 text-slate-400">
                          <Clock className="w-8 h-8 stroke-1.5 mx-auto opacity-50 mb-2" />
                          <p className="text-[11px] font-bold uppercase tracking-wider">No workflow history recorded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary context Action triggers */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-900">
                    {selectedTask.status === 'Pending' && (
                      <button 
                        onClick={() => handleStart(selectedTask.id)}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-650/10 cursor-pointer hover:shadow-lg transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" /> Start Agile Task Workflow
                      </button>
                    )}

                    {selectedTask.status === 'Reopened' && (
                      <button 
                        onClick={() => handleResumeTask(selectedTask.id)}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-650/10 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" /> Resume Workspace Task
                      </button>
                    )}

                    {selectedTask.status === 'In Progress' && (
                      <div className="text-center p-3.5 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/40 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        Task active! Use the tabs at the top to submit daily reports or mark as complete.
                      </div>
                    )}

                    {selectedTask.status === 'Completed' && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                        <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold uppercase text-[10px] tracking-wider mb-0.5">Task Under Review</p>
                          <p className="font-medium text-slate-550 dark:text-slate-350">Manager David Miller is reviewing your submitted completion report and attachments. You will receive a notification once resolved.</p>
                        </div>
                      </div>
                    )}

                    {selectedTask.status === 'Approved' && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-700 dark:text-emerald-450 flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                        <div>
                          <p className="font-extrabold uppercase text-[10px] tracking-wider mb-0.5 text-emerald-600 dark:text-emerald-400">Task Approved & Verified</p>
                          <p className="font-bold mb-1.5">Deliverables signed off by David Miller.</p>
                          {selectedTask.managerFeedback && (
                            <p className="text-[11px] font-medium text-slate-550 dark:text-slate-350 italic">" {selectedTask.managerFeedback} "</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB: DAILY REPORT FORM */}
              {activeTab === 'report' && selectedTask.status === 'In Progress' && (
                <form onSubmit={handleReportSubmit} className="space-y-4 font-semibold text-xs text-slate-500">
                  <div className="p-4 bg-indigo-50/20 border border-indigo-100/50 rounded-xl mb-2">
                    <p className="text-[11px] font-medium leading-relaxed text-indigo-700 dark:text-indigo-400">
                      Submit regular daily reports to keep your manager updated. Each report submitted increments progress by <strong className="font-extrabold">+10%</strong>.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">Daily Progress Update</label>
                    <textarea 
                      required
                      rows={3}
                      value={reportForm.dailyUpdate}
                      onChange={e => setReportForm({ ...reportForm, dailyUpdate: e.target.value })}
                      placeholder="What progress did you make on this task today?"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">Work Completed Details</label>
                    <input 
                      type="text"
                      required
                      value={reportForm.workCompleted}
                      onChange={e => setReportForm({ ...reportForm, workCompleted: e.target.value })}
                      placeholder="e.g. Completed layout coding, set up sidebar tests..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">Issues / Blockers</label>
                      <input 
                        type="text"
                        value={reportForm.issues}
                        onChange={e => setReportForm({ ...reportForm, issues: e.target.value })}
                        placeholder="None"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">Time Spent</label>
                      <input 
                        type="text"
                        required
                        value={reportForm.timeSpent}
                        onChange={e => setReportForm({ ...reportForm, timeSpent: e.target.value })}
                        placeholder="e.g. 3.5 hours"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">Upload Progress Capture (Optional)</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30">
                      <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                      <span className="text-[10px] font-bold text-slate-450 mb-1">Click to browse mock files</span>
                      <input 
                        type="text"
                        placeholder="e.g. progress_screenshot.png"
                        value={reportForm.fileName}
                        onChange={e => setReportForm({ ...reportForm, fileName: e.target.value })}
                        className="px-2.5 py-1 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <Send className="w-4 h-4" /> Submit Progress Report
                  </button>
                </form>
              )}

              {/* TAB: SUBMIT COMPLETION FORM */}
              {activeTab === 'complete' && selectedTask.status === 'In Progress' && (
                <form onSubmit={handleCompleteSubmit} className="space-y-4 font-semibold text-xs text-slate-500">
                  <div className="p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-xl mb-2">
                    <p className="text-[11px] font-medium leading-relaxed text-emerald-800 dark:text-emerald-450">
                      Ready to deliver? Submitting this form changes the task status to <strong className="font-extrabold uppercase">Completed</strong> and sends your deliverables package to your manager's review panel.
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">Final Deliverables Report</label>
                    <textarea 
                      required
                      rows={4}
                      value={completionForm.notes}
                      onChange={e => setCompletionForm({ ...completionForm, notes: e.target.value })}
                      placeholder="Summarize the work completed, link to documentation, and details of the final artifact build..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">Upload Final Attachments / Screenshots</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30">
                      <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                      <span className="text-[10px] font-bold text-slate-450 mb-1">Upload screenshots, PDFs or design files</span>
                      <input 
                        type="text"
                        placeholder="e.g. final_deliverable_v1.zip"
                        value={completionForm.fileName}
                        onChange={e => setCompletionForm({ ...completionForm, fileName: e.target.value })}
                        className="px-2.5 py-1 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle className="w-4 h-4" /> Submit Completed Deliverables
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
