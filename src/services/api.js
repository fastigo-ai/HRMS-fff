import { initialProfileData, initialEmployeeTasks, initialPayslips, initialNotifications } from '../data/employeeData';
import { initialHeatmapCells, initialAnomalies, initialAttendanceRecords } from '../data/attendanceData';
import { initialLeaveRequests, initialLeavePolicies, initialTeamCalendarStatus } from '../data/leavesData';
import { initialDepartments } from '../data/departmentsData';
import { initialCandidates, initialSourcingChannels, initialInterviews } from '../data/recruitmentData';
import { initialProjects, initialTeamMembers, initialTimesheets, initialManagerSprintTasks } from '../data/managerData';

export const authenticatedFetch = async (url, options = {}) => {
  options.credentials = "include";

  if (!options.headers) {
    options.headers = {};
  }

  if (options.body && !options.headers["Content-Type"]) {
    options.headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("worksphere_token");
  if (token && !options.headers["Authorization"]) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(url, options);

  // Catch 401 Unauthorized (Access Token expired) and perform automatic refresh under the hood
  if (res.status === 401 && !url.includes("/api/auth/refresh")) {
    console.log("Access token expired (401). Triggering silent session refresh...");
    try {
      const refreshRes = await fetch("http://localhost:8000/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const token = refreshData.token;
        const user = refreshData.data.user;

        localStorage.setItem("worksphere_auth", "true");
        localStorage.setItem("worksphere_token", token);
        localStorage.setItem("worksphere_profile", JSON.stringify(user));

        console.log("Session successfully renewed! Retrying original request...");
        // Retry the original query
        res = await fetch(url, options);
      } else {
        console.warn("Session refresh token is invalid/expired. Requiring login redirect.");
        localStorage.removeItem("worksphere_auth");
        localStorage.removeItem("worksphere_token");
        localStorage.removeItem("worksphere_profile");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } catch (err) {
      console.error("Silent token refresh failed to connect:", err);
    }
  }

  return res;
};

// Core Cache Initializer with LocalStorage fallbacks for full persistence!
const getCached = (key, fallback) => {
  const cached = localStorage.getItem(`worksphere_${key}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return fallback;
    }
  }
  localStorage.setItem(`worksphere_${key}`, JSON.stringify(fallback));
  return fallback;
};

const setCached = (key, data) => {
  localStorage.setItem(`worksphere_${key}`, JSON.stringify(data));
};

// Asynchronous simulator helper
const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

const initialUnifiedTasks = [
  {
    id: 1,
    title: 'Refactor HR recruitment dashboard UI',
    description: 'Polish the design layout, verify responsive breaks, and integrate dynamic employee cards.',
    priority: 'High',
    deadline: 'Today',
    assignee: 'Alex Johnson',
    category: 'Creative',
    status: 'In Progress',
    progress: 40,
    startTime: new Date().toISOString(),
    notes: 'Starting early, will require feedback on color system.',
    reports: [
      { id: 10, timestamp: new Date().toISOString(), dailyUpdate: 'Refactored CSS layout grid', workCompleted: 'Grid alignment complete, layout responsive on mobile.', issues: 'None', timeSpent: '4 hours' }
    ]
  },
  {
    id: 2,
    title: 'Establish global standard typography tokens',
    description: 'Audit existing layouts and define clear scale multipliers for HSL tailwind variables.',
    priority: 'Medium',
    deadline: 'Oct 28',
    assignee: 'Alex Johnson',
    category: 'Engineering',
    status: 'Approved',
    progress: 100,
    startTime: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Completed successfully.',
    reports: [],
    finalReport: 'Typography scale audit completed. Standardized font tokens exported successfully.'
  },
  {
    id: 3,
    title: 'Draft corporate hybrid remote framework audit',
    description: 'Aggregate hybrid attendance logs to write audit reports for remote work policy updates.',
    priority: 'Low',
    deadline: 'Nov 02',
    assignee: 'Alex Johnson',
    category: 'Product',
    status: 'Pending',
    progress: 0,
    startTime: null,
    notes: '',
    reports: []
  },
  {
    id: 501,
    title: 'Refactor central app routing controllers',
    description: 'Redesign main routing wrappers to speed up loading speed and implement pre-fetching.',
    priority: 'High',
    deadline: 'May 30, 2026',
    assignee: 'Sarah Wu',
    category: 'Engineering',
    status: 'In Progress',
    progress: 25,
    startTime: new Date().toISOString(),
    notes: 'Refactoring central routers.',
    reports: []
  },
  {
    id: 502,
    title: 'Create reusable timeline milestones Gantt',
    description: 'Build an interactive timeline widget that shows milestone progression using SVG.',
    priority: 'High',
    deadline: 'Jun 05, 2026',
    assignee: 'Julian Day',
    category: 'Creative',
    status: 'Pending',
    progress: 0,
    startTime: null,
    notes: '',
    reports: []
  },
  {
    id: 503,
    title: 'Set up redis cluster cache fallbacks',
    description: 'Ensure cache failure does not crash the database connection. Configure retry cycles.',
    priority: 'Medium',
    deadline: 'May 28, 2026',
    assignee: 'Marcus Thorne',
    category: 'Backend',
    status: 'Completed',
    progress: 100,
    startTime: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Testing setup.',
    reports: [],
    finalReport: 'Redis setup finished, retry cycles tested successfully.',
    completionNotes: 'All clusters up and running.'
  },
  {
    id: 504,
    title: 'Review feedback on onboarding prototypes',
    description: 'Collect QA feedback and prepare summaries for design refinements.',
    priority: 'Low',
    deadline: 'May 22, 2026',
    assignee: 'Elena Rodriguez',
    category: 'Product',
    status: 'Approved',
    progress: 100,
    startTime: new Date(Date.now() - 259200000).toISOString(),
    notes: 'Onboarding prototypes verified.',
    reports: []
  }
];

export const DatabaseService = {
  // ==========================================
  // EMPLOYEE PORTAL API HANDLERS
  // ==========================================
  
  getProfile: async () => {
    await delay();
    return getCached('profile', initialProfileData);
  },

  updateProfile: async (updatedData) => {
    await delay(300);
    setCached('profile', updatedData);
    return updatedData;
  },

  getTasks: async () => {
    await delay();
    const allTasks = getCached('tasks', initialUnifiedTasks);
    const profile = getCached('profile', initialProfileData);
    const userName = profile?.name || 'Alex Johnson';
    return allTasks.filter(t => t.assignee === userName);
  },

  addTask: async (task) => {
    await delay(200);
    const current = getCached('tasks', initialUnifiedTasks);
    const updated = [...current, { ...task, id: Date.now(), progress: 0, reports: [], status: 'Pending', startTime: null, notes: '' }];
    setCached('tasks', updated);
    return updated;
  },

  getPayslips: async () => {
    await delay();
    return getCached('payslips', initialPayslips);
  },

  getNotifications: async () => {
    await delay();
    return getCached('notifications', initialNotifications);
  },

  markNotificationsAsRead: async () => {
    await delay(100);
    const current = getCached('notifications', initialNotifications);
    const updated = current.map(n => ({ ...n, isRead: true }));
    setCached('notifications', updated);
    return updated;
  },

  // ==========================================
  // HRMS PORTAL API HANDLERS
  // ==========================================
  
  getHRDashboardStats: async () => {
    await delay();
    // Aggregated real-time metrics
    return {
      totalEmployees: 1248,
      activeToday: 1180,
      onLeaveToday: 12,
      presentToday: 1138,
      pendingLeaves: getCached('hr_leaves', initialLeaveRequests).length,
      openPositions: 8,
      monthlyPayroll: '₹4.82 Cr'
    };
  },

  getHRDepartments: async () => {
    await delay();
    return getCached('hr_departments', initialDepartments);
  },

  addDepartment: async (dept) => {
    await delay(300);
    const current = getCached('hr_departments', initialDepartments);
    const updated = [...current, { ...dept, id: Date.now(), efficiency: 100, trend: [80, 85, 90, 95, 100] }];
    setCached('hr_departments', updated);
    return updated;
  },

  getHRAttendanceLogs: async () => {
    await delay();
    return {
      cells: initialHeatmapCells,
      anomalies: getCached('hr_anomalies', initialAnomalies),
      records: getCached('hr_attendance_records', initialAttendanceRecords)
    };
  },

  resolveAnomaly: async (id) => {
    await delay(200);
    const current = getCached('hr_anomalies', initialAnomalies);
    const updated = current.filter(a => a.id !== id);
    setCached('hr_anomalies', updated);
    return updated;
  },

  getHRLeaves: async () => {
    try {
      const res = await authenticatedFetch("http://localhost:8000/api/leaves");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch leaves from DB");
      }
      
      const dbLeaves = data.data.leaves || [];
      // Filter for only 'Pending' leaves to match "Pending Requests" UI
      const pendingLeaves = dbLeaves.filter(req => req.status === "Pending");
      
      const requests = pendingLeaves.map(req => {
        const emp = req.employee || {};
        
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
        if (req.type === 'Sick Leave') badgeColor = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/60';
        else if (req.type === 'Casual Leave') badgeColor = 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:border-sky-900/60';
        else if (req.type === 'Paid Leave') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/60';
        
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        const dates = `${formatDate(req.startDate)} - ${formatDate(req.endDate)} (${req.totalDays} day${req.totalDays > 1 ? 's' : ''})`;

        return {
          id: req._id,
          name: emp.name || 'Unknown Employee',
          role: `${emp.position || 'Specialist'} • ${emp.department || 'Operations'}`,
          avatar: `https://images.unsplash.com/photo-${emp.role === 'manager' ? '1507003211169-0a1dd7228f2d' : '1500648767791-00dcc994a43e'}?auto=format&fit=crop&q=80&w=64&h=64`,
          type: req.type,
          badgeColor,
          dates,
          reason: req.reason,
          status: req.status,
          isUrgent: req.totalDays > 3,
          daysRemaining: req.totalDays > 3 ? 'Urgent Priority' : 'Standard compliance'
        };
      });

      return {
        requests,
        policies: getCached('hr_policies', initialLeavePolicies),
        calendarStatus: initialTeamCalendarStatus
      };
    } catch (err) {
      console.error("Failed to fetch HR leaves from backend:", err);
      return {
        requests: getCached('hr_leaves', initialLeaveRequests),
        policies: getCached('hr_policies', initialLeavePolicies),
        calendarStatus: initialTeamCalendarStatus
      };
    }
  },

  resolveLeaveRequest: async (id, status) => {
    try {
      const backendStatus = status === 'approve' ? 'Approved' : 'Rejected';
      const res = await authenticatedFetch(`http://localhost:8000/api/leaves/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status: backendStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resolve leave request");
      }
      return data;
    } catch (err) {
      console.error("Failed to resolve leave request:", err);
      throw err;
    }
  },

  addLeavePolicy: async (policy) => {
    await delay(250);
    const current = getCached('hr_policies', initialLeavePolicies);
    const updated = [...current, { ...policy, id: Date.now() }];
    setCached('hr_policies', updated);
    return updated;
  },

  getHRRecruitment: async () => {
    await delay();
    return {
      candidates: getCached('hr_candidates', initialCandidates),
      sourcingChannels: initialSourcingChannels,
      interviews: initialInterviews
    };
  },

  updateCandidateStage: async (id, nextStage) => {
    await delay(150);
    const current = getCached('hr_candidates', initialCandidates);
    const updated = current.map(c => c.id === id ? { ...c, stage: nextStage } : c);
    setCached('hr_candidates', updated);
    return updated;
  },

  addCandidate: async (candidate) => {
    await delay(250);
    const current = getCached('hr_candidates', initialCandidates);
    const updated = [...current, { ...candidate, id: Date.now() }];
    setCached('hr_candidates', updated);
    return updated;
  },

  // ==========================================
  // PROJECT MANAGER PORTAL API HANDLERS
  // ==========================================
  
  getManagerDashboardStats: async () => {
    await delay();
    const projects = getCached('pm_projects', initialProjects);
    const team = getCached('pm_team', initialTeamMembers);
    const timesheets = getCached('pm_timesheets', initialTimesheets);
    
    const activeProjectsCount = projects.filter(p => p.status === 'In Progress').length;
    const delayedProjectsCount = projects.filter(p => p.status === 'Delayed').length;
    const averageAllocation = Math.round(team.reduce((acc, curr) => acc + curr.allocation, 0) / team.length);
    const pendingTimesheetsCount = timesheets.filter(t => t.status === 'Pending').length;

    return {
      activeProjects: activeProjectsCount,
      delayedProjects: delayedProjectsCount,
      teamUtilization: averageAllocation,
      pendingApprovals: pendingTimesheetsCount,
      totalBudget: '$252K',
      sprintProgress: 68
    };
  },

  getManagerProjects: async () => {
    await delay();
    return getCached('pm_projects', initialProjects);
  },

  getManagerTeam: async () => {
    await delay();
    return getCached('pm_team', initialTeamMembers);
  },

  reallocateResource: async (empId, allocation) => {
    await delay(200);
    const current = getCached('pm_team', initialTeamMembers);
    const updated = current.map(member => 
      member.id === empId ? { ...member, allocation: parseInt(allocation) } : member
    );
    setCached('pm_team', updated);
    return updated;
  },

  getManagerTimesheets: async () => {
    await delay();
    return getCached('pm_timesheets', initialTimesheets);
  },

  resolveTimesheet: async (id, newStatus) => {
    await delay(250);
    const current = getCached('pm_timesheets', initialTimesheets);
    const updated = current.map(sheet => 
      sheet.id === id ? { ...sheet, status: newStatus } : sheet
    );
    setCached('pm_timesheets', updated);
    return updated;
  },

  getManagerTasks: async () => {
    await delay();
    return getCached('tasks', initialUnifiedTasks);
  },

  updateManagerTaskStatus: async (taskId, nextStatus) => {
    await delay(150);
    const current = getCached('tasks', initialUnifiedTasks);
    const updated = current.map(task => 
      task.id === taskId ? { ...task, status: nextStatus } : task
    );
    setCached('tasks', updated);
    return updated;
  },

  addManagerTask: async (task) => {
    await delay(200);
    const current = getCached('tasks', initialUnifiedTasks);
    const updated = [...current, { 
      id: Date.now(), 
      progress: 0, 
      reports: [], 
      status: 'Pending', 
      startTime: null,
      notes: '',
      ...task 
    }];
    setCached('tasks', updated);
    return updated;
  },

  startTask: async (taskId) => {
    await delay(150);
    const current = getCached('tasks', initialUnifiedTasks);
    const updated = current.map(task => 
      task.id === taskId ? { ...task, status: 'In Progress', startTime: new Date().toISOString() } : task
    );
    setCached('tasks', updated);
    return updated;
  },

  addWorkReport: async (taskId, reportData) => {
    await delay(200);
    const current = getCached('tasks', initialUnifiedTasks);
    const updated = current.map(task => {
      if (task.id === taskId) {
        const reports = task.reports || [];
        const nextReport = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...reportData
        };
        const nextProg = Math.min(task.progress + 10, 100);
        return {
          ...task,
          progress: nextProg,
          reports: [...reports, nextReport]
        };
      }
      return task;
    });
    setCached('tasks', updated);
    return updated;
  },

  completeTask: async (taskId, completionData) => {
    await delay(200);
    const current = getCached('tasks', initialUnifiedTasks);
    const updated = current.map(task => 
      task.id === taskId ? { 
        ...task, 
        status: 'Completed', 
        progress: 100, 
        completionNotes: completionData.notes,
        completionAttachments: completionData.attachments || [],
        finalReport: completionData.notes
      } : task
    );
    setCached('tasks', updated);
    return updated;
  },

  reviewTask: async (taskId, status, feedbackNotes) => {
    await delay(200);
    const current = getCached('tasks', initialUnifiedTasks);
    const updated = current.map(task => 
      task.id === taskId ? { 
        ...task, 
        status: status, 
        managerFeedback: feedbackNotes,
        progress: status === 'Reopened' ? 90 : task.progress
      } : task
    );
    setCached('tasks', updated);
    return updated;
  }
};
