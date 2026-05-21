import React from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Play
} from 'lucide-react';

export default function Tasks({
  tasks,
  updateTaskStatus,
  incrementTaskProgress,
  triggerToast
}) {
  
  const columns = ['To Do', 'In Progress', 'Completed'];

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'High': return 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400';
      case 'Medium': return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400';
      default: return 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assigned Tasks & Goals</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Track and advance your active performance targets</p>
        </div>
        
        <button 
          onClick={() => triggerToast('Creating a new task is restricted in Employee View', 'error')}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Propose Task
        </button>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {columns.map((col, idx) => {
          const colTasks = tasks.filter(t => t.status === col);
          
          return (
            <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-4 min-h-[450px] flex flex-col">
              
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-900 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{col}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-500">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map(task => (
                  <div key={task.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition">
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getUrgencyColor(task.urgency)}`}>
                          {task.urgency} Priority
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{task.dueDate}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-normal">{task.title}</h4>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>Sprint Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-50 dark:border-slate-900">
                      {col !== 'Completed' ? (
                        <>
                          <button 
                            onClick={() => incrementTaskProgress(task.id)}
                            className="flex items-center gap-1 text-[9px] font-bold text-indigo-500 hover:text-indigo-600 uppercase"
                          >
                            <Play className="w-3 h-3 fill-indigo-500" /> +10%
                          </button>
                          
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'Completed')}
                            className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                          >
                            Mark Done
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Completed
                        </div>
                      )}
                    </div>

                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-full flex items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                    <span className="text-[10px] text-slate-400 font-semibold">No tasks in this stage</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}
