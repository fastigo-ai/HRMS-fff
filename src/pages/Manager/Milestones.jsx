import React, { useState } from 'react';
import {
  Milestone,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Search,
  Plus,
  User,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import Modal from '../../shared/ui/Modal';

export default function PMMilestones() {
  const initialRoadmapData = [
    {
      id: 'r1',
      project: 'Fastigo X Core Refactor',
      dept: 'Engineering',
      phases: [
        { name: 'Database API Migration', status: 'Completed', date: 'Oct 10', startCol: 1, spanCols: 3, assignee: 'Nolan Ryan', role: 'Database Engineer' },
        { name: 'Route Desegregation', status: 'Active', date: 'Oct 30', startCol: 4, spanCols: 4, assignee: 'Julia Roberts', role: 'Backend Lead' },
        { name: 'PM Panel Integration', status: 'Active', date: 'Nov 12', startCol: 8, spanCols: 3, assignee: 'Julian Day', role: 'Frontend Lead' },
        { name: 'Vite Production Vault Lock', status: 'Future', date: 'Dec 15', startCol: 11, spanCols: 2, assignee: 'Sophia Loren', role: 'DevOps Engineer' }
      ]
    },
    {
      id: 'r2',
      project: 'AI Recruitment Integration',
      dept: 'Product Engineering',
      phases: [
        { name: 'Model Token Handshake', status: 'Completed', date: 'Sep 24', startCol: 1, spanCols: 3, assignee: 'Julian Day', role: 'AI Specialist' },
        { name: 'Kanban Stage Sync', status: 'Completed', date: 'Oct 15', startCol: 4, spanCols: 4, assignee: 'Marcus Aurelius', role: 'Fullstack Dev' },
        { name: 'Sourcing Channels Sync', status: 'Delayed', date: 'Dec 01', startCol: 8, spanCols: 5, assignee: 'Julian Day', role: 'Product Manager' }
      ]
    },
    {
      id: 'r3',
      project: 'Global Payroll Vault',
      dept: 'Security & Compliance',
      phases: [
        { name: 'Cryptographic Salt Specs', status: 'Completed', date: 'Oct 05', startCol: 1, spanCols: 4, assignee: 'Linus Torvalds', role: 'Security Architect' },
        { name: 'Tax Withholding Cache', status: 'Active', date: 'Nov 20', startCol: 5, spanCols: 4, assignee: 'Grace Hopper', role: 'Compliance Officer' },
        { name: 'Vault Security Handshake', status: 'Future', date: 'Jan 10', startCol: 9, spanCols: 4, assignee: 'Alan Turing', role: 'Cryptographer' }
      ]
    }
  ];

  const [roadmap, setRoadmap] = useState(initialRoadmapData);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [hoveredPhase, setHoveredPhase] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Tooltip tracking state
  const [hoveredPhaseData, setHoveredPhaseData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [newRoadmap, setNewRoadmap] = useState({
    project: "",
    dept: "Engineering",
    phases: [
      { name: "", assignee: "", date: "", status: "Future", startCol: 1, spanCols: 3, role: "Phase Architect" },
      { name: "", assignee: "", date: "", status: "Future", startCol: 4, spanCols: 3, role: "Development Engineer" },
      { name: "", assignee: "", date: "", status: "Future", startCol: 7, spanCols: 3, role: "QA Engineer" },
      { name: "", assignee: "", date: "", status: "Future", startCol: 10, spanCols: 3, role: "Deployment Engineer" }
    ]
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-100 dark:border-emerald-900/40';
      case 'Active': return 'bg-violet-50 dark:bg-violet-950/40 text-violet-650 border-violet-100 dark:border-violet-900/40';
      case 'Delayed': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-100 dark:border-amber-900/40';
      default: return 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800';
    }
  };

  const handleMouseMove = (e, phase, project) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 100
    });
    setHoveredPhaseData({ ...phase, project });
  };

  const handleCreateRoadmap = (e) => {
    e.preventDefault();
    if (!newRoadmap.project) return;
    
    const projectWithId = {
      ...newRoadmap,
      id: `r_${Date.now()}`
    };
    
    setRoadmap([projectWithId, ...roadmap]);
    setIsAddModalOpen(false);
    // Reset form
    setNewRoadmap({
      project: "",
      dept: "Engineering",
      phases: [
        { name: "", assignee: "", date: "", status: "Future", startCol: 1, spanCols: 3, role: "Phase Architect" },
        { name: "", assignee: "", date: "", status: "Future", startCol: 4, spanCols: 3, role: "Development Engineer" },
        { name: "", assignee: "", date: "", status: "Future", startCol: 7, spanCols: 3, role: "QA Engineer" },
        { name: "", assignee: "", date: "", status: "Future", startCol: 10, spanCols: 3, role: "Deployment Engineer" }
      ]
    });
  };
  
  const handlePhaseChange = (index, field, value) => {
    const updatedPhases = [...newRoadmap.phases];
    updatedPhases[index][field] = value;
    setNewRoadmap({ ...newRoadmap, phases: updatedPhases });
  };

  const filteredRoadmaps = roadmap.filter((road) => {
    const matchesSearch = road.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      road.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      road.phases.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = deptFilter === "All" || road.dept === deptFilter;
    
    return matchesSearch && matchesDept;
  });

  const totalPhasesOnTrack = roadmap.reduce((acc, curr) => {
    return acc + curr.phases.filter(p => p.status === 'Completed' || p.status === 'Active').length;
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Milestone Gantt Roadmap</h3>
          <p className="text-xs text-slate-400">Quarterly project phase allocations and critical path markers</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/20 text-violet-650 dark:text-violet-400 text-xs font-bold rounded-xl border border-violet-100 dark:border-violet-900/40 shadow-xs">
            <TrendingUp className="w-4 h-4" /> {totalPhasesOnTrack} Phases On Track
          </div>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-black hover:bg-indigo-700 hover:text-white text-xs font-bold rounded-xl transition shadow shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      <div>
        <h1>Project</h1>
      </div>
     

      {/* Interactive Filtering Controls Bar */}
      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, phases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Department:
          </span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Engineering">Product Engineering</option>
            <option value="Security & Compliance">Security & Compliance</option>
          </select>
        </div>
      </div>

      {/* Gantt Timeline Board */}
      <div className="p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-8">
        
        {/* Timeline Header Quarters */}
        <div className="grid grid-cols-4 text-center border-b border-slate-100 dark:border-slate-900 pb-3 text-[10px] sm:text-xs font-bold text-slate-400">
          <span>Phase 1 (Kickoff)</span>
          <span>Phase 2 (Development)</span>
          <span>Phase 3 (Testing & QA)</span>
          <span>Phase 4 (Deployment)</span>
        </div>

        {/* Project Roadmaps */}
        <div className="space-y-8">
          {filteredRoadmaps.map((road) => (
            <div key={road.id} className="space-y-4">
              
              {/* Project Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{road.project}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{road.dept}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-150 dark:border-slate-850">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Sprints 12-16
                  </span>
                </div>
              </div>

              {/* Gantt Horizontal Bars */}
              <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900/60 rounded-2xl">
                
                {/* Horizontal tracks with background grid */}
                <div className="grid grid-cols-12 gap-1 w-full h-8 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-slate-200 dark:border-slate-900 relative">
                  
                  {/* Backdrop dashed dividers */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-full border-r border-dashed border-slate-200/50 dark:border-slate-800/40 ${
                          i === 11 ? 'border-none' : ''
                        }`} 
                      />
                    ))}
                  </div>

                  {/* Render phases */}
                  {road.phases.map((phase, idx) => {
                    const isHovered = hoveredPhase === phase.name;
                    return (
                      <div 
                        key={idx} 
                        className={`h-full rounded-lg opacity-90 transition-all duration-300 relative group cursor-pointer ${
                          isHovered ? 'ring-4 ring-indigo-500/30 scale-[1.02] shadow-md z-10' : ''
                        }`}
                        style={{ 
                          gridColumnStart: phase.startCol, 
                          gridColumnEnd: `span ${phase.spanCols}`,
                          backgroundColor: phase.status === 'Completed' ? '#10b981' : phase.status === 'Active' ? '#6366f1' : phase.status === 'Delayed' ? '#f59e0b' : '#94a3b8' 
                        }}
                        onMouseEnter={() => setHoveredPhase(phase.name)}
                        onMouseLeave={() => {
                          setHoveredPhase(null);
                          setHoveredPhaseData(null);
                        }}
                        onMouseMove={(e) => handleMouseMove(e, phase, road.project)}
                      >
                        {/* Pulse indicators on active blocks */}
                        {phase.status === 'Active' && (
                          <span className="absolute right-1 top-1 w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                        )}

                        {/* Custom hover tooltip */}
                        {hoveredPhaseData && isHovered && (
                          <div 
                            style={{ top: tooltipPos.y, left: tooltipPos.x }}
                            className="absolute z-40 w-52 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-850 p-3 rounded-xl shadow-xl space-y-1.5 pointer-events-none transition-all duration-100"
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                              <span>{hoveredPhaseData.project}</span>
                              <span className={`px-1.5 py-0.5 rounded-md ${getStatusBadge(hoveredPhaseData.status)}`}>
                                {hoveredPhaseData.status}
                              </span>
                            </div>
                            <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-tight">
                              {hoveredPhaseData.name}
                            </h4>
                            <div className="border-t border-slate-100 dark:border-slate-900 pt-1.5 space-y-1 text-[10px] text-slate-500">
                              <div className="flex justify-between">
                                <span>Owner:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-350">{hoveredPhaseData.assignee}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Role:</span>
                                <span className="font-semibold text-slate-655 dark:text-slate-400">{hoveredPhaseData.role}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Due Date:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-350">{hoveredPhaseData.date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span className="font-bold text-indigo-650 dark:text-indigo-400">{hoveredPhaseData.spanCols} Sprints</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend list of milestones (interactive cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
                  {road.phases.map((phase, idx) => {
                    const isHovered = hoveredPhase === phase.name;
                    return (
                      <div 
                        key={idx} 
                        onMouseEnter={() => setHoveredPhase(phase.name)}
                        onMouseLeave={() => setHoveredPhase(null)}
                        className={`p-3 bg-white dark:bg-slate-950 border rounded-xl space-y-1.5 hover:shadow-md transition cursor-pointer ${
                          isHovered 
                            ? 'border-indigo-500 dark:border-indigo-500 scale-[1.03] shadow-md z-10' 
                            : 'border-slate-100 dark:border-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-lg ${getStatusBadge(phase.status)}`}>
                            {phase.status}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" /> {phase.date}
                          </span>
                        </div>
                        <h5 className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                          {phase.name}
                        </h5>
                        <div className="flex items-center gap-1 pt-1 text-[9px] text-slate-400 font-bold border-t border-slate-50 dark:border-slate-900">
                          <User className="w-3 h-3 text-indigo-500" /> {phase.assignee}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          ))}

          {filteredRoadmaps.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-slate-400 italic">No roadmap items matched your filters.</p>
            </div>
          )}
        </div>

      </div>

      {/* Gantt advisory note */}
      <div className="p-5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5.5 h-5.5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-violet-900 dark:text-violet-400 uppercase tracking-wider">Critical Path Alert</h4>
          <p className="text-xs text-violet-750 dark:text-violet-500 leading-relaxed mt-1">
            The **AI Recruitment Integration** phase is currently delayed due to Sourcing Channel API handshakes. Resources can be reallocated using the Team slider view.
          </p>
        </div>
      </div>

      {/* Add Project Roadmap Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Project Roadmap"
        size="lg"
      >
        <form onSubmit={handleCreateRoadmap} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Project Name</label>
              <input 
                type="text"
                required
                placeholder="e.g. AI HR Assistant"
                value={newRoadmap.project}
                onChange={(e) => setNewRoadmap({ ...newRoadmap, project: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Department</label>
              <select
                value={newRoadmap.dept}
                onChange={(e) => setNewRoadmap({ ...newRoadmap, dept: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Engineering">Product Engineering</option>
                <option value="Security & Compliance">Security & Compliance</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Project Phases Configuration
            </h4>
            
            {newRoadmap.phases.map((phase, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 uppercase">Phase {idx + 1}</span>
                  <select
                    value={phase.status}
                    onChange={(e) => handlePhaseChange(idx, 'status', e.target.value)}
                    className="px-2 py-0.5 text-[9px] font-bold bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded text-slate-800 dark:text-white"
                  >
                    <option value="Future">Future</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block">Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Design Handshake"
                      value={phase.name}
                      onChange={(e) => handlePhaseChange(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-[10px] bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-855 rounded text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block">Owner</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Julian Day"
                      value={phase.assignee}
                      onChange={(e) => handlePhaseChange(idx, 'assignee', e.target.value)}
                      className="w-full px-2 py-1 text-[10px] bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-855 rounded text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block">Target Date</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Nov 15"
                      value={phase.date}
                      onChange={(e) => handlePhaseChange(idx, 'date', e.target.value)}
                      className="w-full px-2 py-1 text-[10px] bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-855 rounded text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-855 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow shadow-indigo-600/10"
            >
              Create Roadmap
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
