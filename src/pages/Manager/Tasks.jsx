import React, { useState, useEffect } from 'react';
import { useManagerStore } from '../../store/managerStore';
import {
  CheckSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  X,
  User,
  Tags,
  AlertCircle,
  FileText,
  Clock,
  AlertTriangle,
  FolderKanban,
  CheckCircle,
  RotateCcw,
  Ban,
  Calendar,
  Layers,
  ChevronRight,
  Upload,
  MessageSquareCode
} from 'lucide-react';

export default function PMTasks({ triggerToast }) {
  const {
    tasks = [],
    team = [],
    loading,
    fetchPMData,
    addManagerTask,
    updateTaskStatus,
    reviewTask,
    editManagerTask,
    deleteManagerTask
  } = useManagerStore();

  const [activeViewTab, setActiveViewTab] = useState('board'); // 'board' | 'review'
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Review feedback state
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Task creation state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: 'Alex Johnson',
    priority: 'Medium',
    status: 'Pending',
    category: 'Engineering',
    deadline: ''
  });

  // Task edit state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState({
    id: '',
    title: '',
    description: '',
    assignee: 'Alex Johnson',
    priority: 'Medium',
    status: 'Pending',
    category: 'Engineering',
    deadline: ''
  });

  const handleStartEdit = (task) => {
    setEditTaskData({
      id: task.id || task._id,
      title: task.title || '',
      description: task.description || '',
      assignee: task.assignee || 'Alex Johnson',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      category: task.category || 'Engineering',
      deadline: task.deadline || ''
    });
    setEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this sprint task? This operation cannot be undone.")) {
      try {
        await deleteManagerTask(taskId, triggerToast);
        setSelectedTask(null);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    if (!editTaskData.title.trim()) {
      triggerToast('Task title is required', 'error');
      return;
    }

    try {
      await editManagerTask(editTaskData.id, {
        title: editTaskData.title,
        description: editTaskData.description,
        assignee: editTaskData.assignee,
        priority: editTaskData.priority,
        status: editTaskData.status,
        category: editTaskData.category,
        deadline: editTaskData.deadline
      }, triggerToast);
      
      setEditModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Task update failed:', err);
    }
  };

  useEffect(() => {
    fetchPMData();
  }, []);

  // Update default assignee once team loads
  useEffect(() => {
    if (team.length > 0 && !newTask.assignee) {
      setNewTask(prev => ({ ...prev, assignee: 'Alex Johnson' }));
    }
  }, [team]);

  const handleAdvanceStatus = async (taskId, currentStatus) => {
    const statusOrder = ['Pending', 'In Progress', 'Completed', 'Approved'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return;
    
    const nextStatus = statusOrder[currentIndex + 1];
    try {
      await updateTaskStatus(taskId, nextStatus, triggerToast);
    } catch (err) {
      console.error('Error shifting task status:', err);
    }
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      triggerToast('Task title is required', 'error');
      return;
    }

    try {
      await addManagerTask(newTask, triggerToast);
      setModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        assignee: 'Alex Johnson',
        priority: 'Medium',
        status: 'Pending',
        category: 'Engineering',
        deadline: ''
      });
    } catch (err) {
      console.error('Task creation failed:', err);
    }
  };

  const handleReviewAction = async (taskId, decision) => {
    if (!reviewFeedback.trim() && (decision === 'Reopened' || decision === 'Rejected')) {
      triggerToast('Please provide review feedback notes to clarify changes needed', 'error');
      return;
    }

    try {
      await reviewTask(taskId, decision, reviewFeedback, triggerToast);
      setSelectedTask(null);
      setReviewFeedback('');
    } catch (err) {
      console.error('Review resolution failed:', err);
    }
  };

  // Combine Alex Johnson and the database team members
  const completeTeamOptions = [
    { name: 'Alex Johnson', role: 'Senior Developer' },
    ...team
  ];

  // Column definitions for Kanban board
  const columns = [
    { id: 'Pending', title: 'Sprint Backlog', color: 'border-t-slate-400 bg-slate-50/40 dark:bg-slate-900/10' },
    { id: 'In Progress', title: 'In Development', color: 'border-t-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/5' },
    { id: 'Completed', title: 'QA & Review', color: 'border-t-amber-500 bg-amber-50/10 dark:bg-amber-900/5' },
    { id: 'Approved', title: 'Done / Verified', color: 'border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/5' }
  ];

  const getPriorityBadge = (prio) => {
    if (prio === 'High') return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40';
    if (prio === 'Medium') return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40';
    return 'text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-800';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-slate-100 dark:bg-slate-900 text-slate-550 border-slate-200';
      case 'In Progress': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border-indigo-100';
      case 'Completed': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-100';
      case 'Approved': return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100';
      case 'Reopened': return 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 border-orange-100';
      case 'Rejected': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-100';
      default: return 'bg-slate-150 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-900 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'Approved' || t.status === 'Done').length;
  const completionPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  
  // Filter tasks pending review (status Completed)
  const reviewTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Navigation Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-violet-500" />
            Sprint Tasks Dashboard
          </h2>
          <p className="text-xs text-slate-400">Assign sprint deliverables and verify completed employee packages.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setActiveViewTab('board')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeViewTab === 'board' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
            >
              Sprint Board
            </button>
            <button 
              onClick={() => setActiveViewTab('review')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${activeViewTab === 'review' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
            >
              Review Hub
              {reviewTasks.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping"></span>
              )}
            </button>
          </div>

          <div className="px-3 py-1.5 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/40 text-xs font-bold text-violet-650 dark:text-violet-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> {completionPercent}% Completed
          </div>

          <button 
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-violet-600/10"
          >
            <Plus className="w-4 h-4" /> Assign Sprint Task
          </button>
        </div>
      </div>

      {/* VIEW: BOARD VIEW */}
      {activeViewTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => {
            // Group 'Reopened' in 'In Progress', 'Rejected' in 'Pending', and 'Done' in 'Approved'
            const colTasks = tasks.filter(t => {
              if (col.id === 'Pending') return t.status === 'Pending' || t.status === 'Rejected';
              if (col.id === 'In Progress') return t.status === 'In Progress' || t.status === 'Reopened';
              if (col.id === 'Approved') return t.status === 'Approved' || t.status === 'Done';
              return t.status === col.id;
            });

            return (
              <div 
                key={col.id} 
                className={`glass-panel border-t-4 ${col.color} border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col min-h-[450px]`}
              >
                {/* Lane Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-150 dark:border-slate-900">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{col.title}</span>
                  <span className="text-[10px] font-extrabold text-slate-550 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-lg">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks Lane list */}
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <CheckSquare className="w-6 h-6 stroke-1.5 opacity-50 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Empty Lane</span>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priorityStyle = getPriorityBadge(task.priority);
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)}
                          className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shadow-xs space-y-3 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-800 transition cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-lg border border-violet-100/40">
                              {task.category || 'Sprint'}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-lg ${priorityStyle}`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-relaxed group-hover:text-violet-650 transition">
                            {task.title}
                          </h4>

                          {/* Quick Progress Bar */}
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${task.progress || 0}%` }}></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/60 text-[10px] text-slate-450 font-bold">
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-lg">
                                <User className="w-3 h-3 text-indigo-500" />
                              </div>
                              <span>{task.assignee}</span>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${getStatusBadge(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: REVIEW HUB VIEW */}
      {activeViewTab === 'review' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-amber-850 dark:text-amber-400 uppercase tracking-wider mb-0.5">Tasks Awaiting Action ({reviewTasks.length})</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                The staff members listed below have flagged their deliverables as complete. Open their reports, review their final artifacts, and approve, reopen, or reject their deliverables.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewTasks.map((task) => (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm space-y-4 hover:shadow-md hover:border-slate-200 transition cursor-pointer relative"
              >
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-amber-550 animate-ping"></div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/40">
                      {task.category}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      Due: {task.deadline}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {task.title}
                  </h4>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-xl space-y-2">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Staff Completion Notes</span>
                  <p className="text-xs text-slate-650 dark:text-slate-350 line-clamp-3 italic leading-relaxed font-medium">
                    "{task.completionNotes || 'No notes submitted'}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-900 text-[10px] text-slate-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64"
                      alt={task.assignee} 
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-violet-500/10"
                    />
                    <span>{task.assignee}</span>
                  </div>
                  <span className="text-indigo-550 flex items-center">
                    Inspect Deliverables <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}

            {reviewTasks.length === 0 && (
              <div className="lg:col-span-3 text-center py-16 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-10 h-10 text-emerald-500 stroke-1.5 mx-auto mb-2" />
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">All Clear!</h4>
                <p className="text-[11px] text-slate-400 mt-1">No employee task submissions are currently pending your approval.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Drawer details / Deliverables Inspector */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-950 border-l border-slate-150 dark:border-slate-850 shadow-2xl p-6 flex flex-col h-full animate-in slide-in-from-right duration-250">
            
            {/* Header section */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-900">
              <div className="space-y-1.5 flex-1 mr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-0.5 rounded-lg border border-violet-100/40">
                    {selectedTask.category || 'Agile'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg ${getPriorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority} Priority
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg ${getStatusBadge(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                  {selectedTask.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-900/60">
                  <button
                    onClick={() => handleStartEdit(selectedTask)}
                    className="px-2.5 py-1 text-[10px] font-extrabold text-violet-600 hover:text-white hover:bg-violet-600 border border-violet-200 dark:border-violet-850 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="px-2.5 py-1 text-[10px] font-extrabold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-950 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              
              {/* Task Details */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">Agile Deliverable Instructions</h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900 rounded-xl">
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                    {selectedTask.description || 'No description instructions detailed.'}
                  </p>
                </div>
              </div>

              {/* Assignment details table */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Assigned Staff</span>
                  <span className="text-xs font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-violet-500" />
                    {selectedTask.assignee}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Due Date</span>
                  <span className="text-xs font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    {selectedTask.deadline}
                  </span>
                </div>
              </div>

              {/* Work Reports logs / Activity Timeline */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">Agile Progress timeline</h4>
                <div className="space-y-4 pl-3 border-l border-indigo-100 dark:border-indigo-900/60 ml-2">
                  {selectedTask.startTime && (
                    <div className="relative">
                      <span className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-950"></span>
                      <div className="pl-4 text-xs">
                        <span className="text-[10px] text-slate-400 font-bold block">
                          {new Date(selectedTask.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • Started by {selectedTask.assignee}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedTask.reports && selectedTask.reports.map((rep, rIdx) => (
                    <div key={rep.id || rIdx} className="relative">
                      <span className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-400 ring-4 ring-white dark:ring-slate-950"></span>
                      <div className="pl-4 space-y-1 text-xs">
                        <span className="text-[10px] text-slate-400 font-bold block">
                          Report filed on {new Date(rep.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100/60 dark:border-slate-800 p-3 rounded-xl space-y-1">
                          <p className="text-slate-800 dark:text-slate-200"><strong>Daily Update:</strong> {rep.dailyUpdate}</p>
                          <p className="text-slate-650 dark:text-slate-350"><strong>Work Completed:</strong> {rep.workCompleted}</p>
                          {rep.issues !== 'None' && rep.issues !== 'None reported' && (
                            <p className="text-amber-600 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" /> Blockers: {rep.issues}
                            </p>
                          )}
                          <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold">
                            <span>Hours Spent: {rep.timeSpent}</span>
                            {rep.attachment && (
                              <span className="flex items-center gap-0.5 text-violet-500">
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
                      <div className="pl-4 space-y-2 text-xs">
                        <span className="text-[10px] text-slate-400 font-bold block">Final deliverables submitted</span>
                        <div className="bg-amber-50/20 dark:bg-slate-900 border border-amber-100/60 dark:border-slate-800 p-4 rounded-xl space-y-3">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Final Completion Report</span>
                            <p className="text-slate-800 dark:text-slate-200 italic font-bold leading-relaxed">
                              "{selectedTask.completionNotes || selectedTask.finalReport || 'No final report summary supplied.'}"
                            </p>
                          </div>

                          {selectedTask.completionAttachments && selectedTask.completionAttachments.length > 0 && (
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Attached Artifacts</span>
                              <div className="flex flex-wrap gap-2">
                                {selectedTask.completionAttachments.map((att, aIdx) => (
                                  <div key={aIdx} className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-350">
                                    <FileText className="w-3.5 h-3.5 text-violet-500" />
                                    <span>{att.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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

              {/* Review Input Box (Active only on Completed status) */}
              {selectedTask.status === 'Completed' && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-900 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">Review Comments & Sign-off notes</label>
                    <textarea 
                      rows={3}
                      value={reviewFeedback}
                      onChange={e => setReviewFeedback(e.target.value)}
                      placeholder="Add design feedback, requested modifications, or approval congratulations notes..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-violet-500 font-medium text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Actions buttons row */}
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleReviewAction(selectedTask.id, 'Approved')}
                      className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button 
                      onClick={() => handleReviewAction(selectedTask.id, 'Reopened')}
                      className="py-3 bg-amber-500 hover:bg-amber-650 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reopen
                    </button>
                    <button 
                      onClick={() => handleReviewAction(selectedTask.id, 'Rejected')}
                      className="py-3 bg-rose-600 hover:bg-rose-750 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Display Manager Feedback if already reviewed */}
              {(selectedTask.status === 'Approved' || selectedTask.status === 'Reopened' || selectedTask.status === 'Rejected') && selectedTask.managerFeedback && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1.5 text-xs">
                  <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">Manager Review Sign-off</span>
                  <p className="text-slate-800 dark:text-slate-200 font-bold italic leading-relaxed">
                    "{selectedTask.managerFeedback}"
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Task Creation Modal Wizard */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="glass-panel w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-6 relative animate-in fade-in-50 zoom-in-95 duration-200">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <CheckSquare className="w-5.5 h-5.5 text-violet-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Assign Sprint Deliverable</h3>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Design responsive milestone chart widgets..."
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Detailed Instructions / Description</label>
                <textarea 
                  rows={3}
                  placeholder="Detail step-by-step instructions, design files location, and test parameters..."
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Assignee Staff</label>
                  <select 
                    value={newTask.assignee}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    {completeTeamOptions.map((member, mIdx) => (
                      <option key={member.id || mIdx} value={member.name}>{member.name} ({member.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Category</label>
                  <select 
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Creative">Creative</option>
                    <option value="Backend">Backend</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Deadline / Due Date</label>
                  <input 
                    type="text"
                    placeholder="e.g. May 30, 2026"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-750 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
                <button 
                  type="submit" 
                  className="w-full py-3.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-md shadow-violet-650/10 cursor-pointer"
                >
                  Confirm & Assign Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Edit Modal Wizard */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="glass-panel w-full max-w-lg bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-6 relative animate-in fade-in-50 zoom-in-95 duration-200">
            <button 
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <CheckSquare className="w-5.5 h-5.5 text-violet-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Sprint Deliverable</h3>
            </div>

            <form onSubmit={handleEditTaskSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Design responsive milestone chart widgets..."
                  value={editTaskData.title}
                  onChange={(e) => setEditTaskData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Detailed Instructions / Description</label>
                <textarea 
                  rows={3}
                  placeholder="Detail step-by-step instructions, design files location, and test parameters..."
                  value={editTaskData.description}
                  onChange={(e) => setEditTaskData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Assignee Staff</label>
                  <select 
                    value={editTaskData.assignee}
                    onChange={(e) => setEditTaskData(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    {completeTeamOptions.map((member, mIdx) => (
                      <option key={member.id || mIdx} value={member.name}>{member.name} ({member.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Category</label>
                  <select 
                    value={editTaskData.category}
                    onChange={(e) => setEditTaskData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Creative">Creative</option>
                    <option value="Backend">Backend</option>
                    <option value="Product">Product</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Priority</label>
                  <select 
                    value={editTaskData.priority}
                    onChange={(e) => setEditTaskData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Deadline / Due Date</label>
                  <input 
                    type="text"
                    placeholder="e.g. May 30, 2026"
                    value={editTaskData.deadline}
                    onChange={(e) => setEditTaskData(prev => ({ ...prev, deadline: e.target.value }))}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-750 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1.5 uppercase tracking-wider font-extrabold text-[10px]">Task Status Column</label>
                  <select 
                    value={editTaskData.status}
                    onChange={(e) => setEditTaskData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    <option value="Pending">Pending / Backlog</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed / In Review</option>
                    <option value="Approved">Approved / Done</option>
                    <option value="Reopened">Reopened / Rework</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
                <button 
                  type="submit" 
                  className="w-full py-3.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-md shadow-violet-650/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
