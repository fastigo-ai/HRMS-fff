import { initialProfileData, initialEmployeeTasks, initialPayslips, initialNotifications } from '../data/employeeData';
import { initialHeatmapCells, initialAnomalies, initialAttendanceRecords } from '../data/attendanceData';
import { initialLeaveRequests, initialLeavePolicies, initialTeamCalendarStatus } from '../data/leavesData';
import { initialDepartments } from '../data/departmentsData';
import { initialCandidates, initialSourcingChannels, initialInterviews } from '../data/recruitmentData';
import { initialProjects, initialTeamMembers, initialTimesheets, initialManagerSprintTasks } from '../data/managerData';

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
    return getCached('tasks', initialEmployeeTasks);
  },

  addTask: async (task) => {
    await delay(200);
    const current = getCached('tasks', initialEmployeeTasks);
    const updated = [...current, { ...task, id: Date.now() }];
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
    await delay();
    return {
      requests: getCached('hr_leaves', initialLeaveRequests),
      policies: getCached('hr_policies', initialLeavePolicies),
      calendarStatus: initialTeamCalendarStatus
    };
  },

  resolveLeaveRequest: async (id, status) => {
    await delay(300);
    const current = getCached('hr_leaves', initialLeaveRequests);
    const updated = current.filter(r => r.id !== id);
    setCached('hr_leaves', updated);
    return updated;
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
    return getCached('pm_tasks', initialManagerSprintTasks);
  },

  updateManagerTaskStatus: async (taskId, nextStatus) => {
    await delay(150);
    const current = getCached('pm_tasks', initialManagerSprintTasks);
    const updated = current.map(task => 
      task.id === taskId ? { ...task, status: nextStatus } : task
    );
    setCached('pm_tasks', updated);
    return updated;
  },

  addManagerTask: async (task) => {
    await delay(200);
    const current = getCached('pm_tasks', initialManagerSprintTasks);
    const updated = [...current, { ...task, id: Date.now(), progress: 0 }];
    setCached('pm_tasks', updated);
    return updated;
  }
};
