import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../../services/api';
import {
  CheckSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  X,
  User,
  Tags,
  AlertCircle
} from 'lucide-react';

export default function PMTasks() {
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    priority: 'Medium',
    status: 'Backlog',
    category: 'Engineering'
  });

  useEffect(() => {
    const loadTasksAndTeam = async () => {
      try {
        const sprintTasks = await DatabaseService.getManagerTasks();
        setTasks(sprintTasks);
        const directTeam = await DatabaseService.getManagerTeam();
        setTeam(directTeam);
        if (directTeam.length > 0) {
          setNewTask(prev => ({ ...prev, assignee: directTeam[0].name }));
        }
      } catch (err) {
        console.error('Failed to load tasks and team:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTasksAndTeam();
  }, []);

  const handleAdvanceStatus = async (taskId, currentStatus) => {
    const statusOrder = ['Backlog', 'In Progress', 'Review', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return;
    
    const nextStatus = statusOrder[currentIndex + 1];
    try {
      const updated = await DatabaseService.updateManagerTaskStatus(taskId, nextStatus);
      setTasks(updated);
    } catch (err) {
      console.error('Error shifting task status:', err);
    }
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const updated = await DatabaseService.addManagerTask(newTask);
      setTasks(updated);
      setModalOpen(false);
      setNewTask({
        title: '',
        assignee: team[0]?.name || '',
        priority: 'Medium',
        status: 'Backlog',
        category: 'Engineering'
      });
    } catch (err) {
      console.error('Task creation failed:', err);
    }
  };

  const columns = [
    { id: 'Backlog', title: 'Sprint Backlog', color: 'border-t-slate-400 bg-slate-50/40 dark:bg-slate-900/10' },
    { id: 'In Progress', title: 'In Development', color: 'border-t-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/5' },
    { id: 'Review', title: 'QA & Review', color: 'border-t-amber-500 bg-amber-50/10 dark:bg-amber-900/5' },
    { id: 'Done', title: 'Done / Verified', color: 'border-t-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/5' }
  ];

  const getPriorityBadge = (prio) => {
    if (prio === 'High') return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40';
    if (prio === 'Medium') return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40';
    return 'text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 border-slate-205 dark:border-slate-800';
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

  const completedCount = tasks.filter(t => t.status === 'Done').length;
  const completionPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Overview stats header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Sprint board</h3>
          <p className="text-xs text-slate-400">Track task progression and schedule upcoming backlog scopes</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-1.5 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/40 text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
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

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className={`glass-panel border-t-4 ${col.color} border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col min-h-[380px]`}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-900">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">{col.title}</span>
                <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-lg">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                    <CheckSquare className="w-6 h-6 stroke-1.5 opacity-60 mb-2" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Empty Lane</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const priorityStyle = getPriorityBadge(task.priority);
                    return (
                      <div 
                        key={task.id} 
                        className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs space-y-3 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-800 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-lg border border-violet-100/40">
                            {task.category}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-lg ${priorityStyle}`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/60">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-lg">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{task.assignee}</span>
                          </div>

                          {col.id !== 'Done' && (
                            <button 
                              onClick={() => handleAdvanceStatus(task.id, task.status)}
                              className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition"
                              title="Advance Status"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Task Creation Modal Wizard */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="glass-panel w-full max-w-md bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl p-6 relative animate-in fade-in-50 zoom-in-95 duration-200">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-650 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <CheckSquare className="w-5.5 h-5.5 text-violet-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Assign Sprint Task</h3>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">Task Deliverable Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Design responsive milestone chart widgets..."
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Assignee</label>
                  <select 
                    value={newTask.assignee}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-350 font-bold"
                  >
                    {team.map((member) => (
                      <option key={member.id} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Category</label>
                  <select 
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-350 font-bold"
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
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-350 font-bold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Initial Status</label>
                  <select 
                    value={newTask.status}
                    onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-850 rounded-xl focus:outline-none focus:border-violet-500 text-slate-700 dark:text-slate-350 font-bold"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
                <button 
                  type="submit" 
                  className="w-full py-3 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow-md shadow-violet-600/10"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
