import { delay, getCached, setCached, authenticatedFetch, API_BASE_URL } from './apiClient';
import { employeeService } from './employeeService';
import { initialProjects, initialTeamMembers, initialTimesheets } from '../data/managerData';

export const managerService = {
  getManagerDashboardStats: async () => {
    try {
      const projects = await managerService.getManagerProjects();
      const team = await managerService.getManagerTeam();
      const timesheets = await managerService.getManagerTimesheets();

      const activeProjectsCount = projects.filter(p => p.status === 'In Progress').length;
      const delayedProjectsCount = projects.filter(p => p.status === 'Delayed').length;
      
      const totalAllocation = team.reduce((acc, curr) => acc + (curr.allocation || 0), 0);
      const averageAllocation = team.length > 0 ? Math.round(totalAllocation / team.length) : 80;
      
      const pendingTimesheetsCount = timesheets.filter(t => t.status === 'Pending').length;

      return {
        activeProjects: activeProjectsCount,
        delayedProjects: delayedProjectsCount,
        teamUtilization: averageAllocation,
        pendingApprovals: pendingTimesheetsCount,
        totalBudget: '₹25.0L',
        sprintProgress: 72
      };
    } catch (err) {
      console.error("Failed to compute dashboard stats dynamically:", err);
      return {
        activeProjects: 0,
        delayedProjects: 0,
        teamUtilization: 0,
        pendingApprovals: 0,
        totalBudget: '₹0.0L',
        sprintProgress: 0
      };
    }
  },

  getManagerProjects: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/projects`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch projects");
      }
      return (data.data.projects || []).map(p => ({
        id: p._id,
        name: p.name,
        dept: p.leader?.department || 'Product Engineering',
        status: p.status,
        progress: p.status === 'Completed' ? 100 : p.status === 'Planning' ? 10 : p.status === 'Delayed' ? 45 : 75,
        teamSize: p.headcount,
        budget: p.budget,
        health: p.status === 'Delayed' ? 'At Risk' : p.status === 'Completed' ? 'Completed' : 'Healthy'
      }));
    } catch (err) {
      console.error("Failed to fetch manager projects:", err);
      return [];
    }
  },

  getManagerTeam: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/employees`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch employees");
      }
      return (data.data.employees || []).map((emp, index) => ({
        id: emp._id,
        name: emp.name,
        role: emp.position || emp.role || 'Specialist',
        skills: emp.skills || ['React', 'Node.js'],
        allocation: 80 - ((index * 5) % 30),
        status: 'Active',
        avatar: emp.role === 'hr_admin'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64'
          : (emp.role === 'manager'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64'
            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64'),
        completionRate: 90 + (index % 10),
        activeProject: 'Acme Web App Redesign'
      }));
    } catch (err) {
      console.error("Failed to fetch manager team:", err);
      return [];
    }
  },

  reallocateResource: async (empId, allocation) => {
    try {
      const team = await managerService.getManagerTeam();
      return team.map(member => 
        member.id === empId ? { ...member, allocation: parseInt(allocation) } : member
      );
    } catch (err) {
      console.error("Failed to reallocate resource:", err);
      return [];
    }
  },

  getManagerTimesheets: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/timesheets`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch timesheets");
      }
      return (data.data.timesheets || []).map(t => {
        const emp = t.employee || {};
        return {
          id: t._id,
          name: emp.name || 'Unknown',
          project: emp.department === 'Design & UX' ? 'Atomic Typography Tokens' : 'Acme Web App Redesign',
          period: t.weekEnding,
          hours: t.totalHours,
          status: t.status,
          details: `Bandwidth allocation: ${t.allocation}%. Logged in for weekly performance tracking.`
        };
      });
    } catch (err) {
      console.error("Failed to fetch timesheets:", err);
      return [];
    }
  },

  resolveTimesheet: async (id, newStatus) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/timesheets/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resolve timesheet");
      }
      return managerService.getManagerTimesheets();
    } catch (err) {
      console.error("Failed to resolve timesheet:", err);
      throw err;
    }
  },

  getManagerTasks: async () => {
    return employeeService.getTasks();
  },

  updateManagerTaskStatus: async (taskId, nextStatus) => {
    try {
      const isResolution = ["Approved", "Reopened"].includes(nextStatus);
      const url = isResolution 
        ? `${API_BASE_URL}/tasks/${taskId}/resolve`
        : `${API_BASE_URL}/tasks/${taskId}/start`;
      
      const body = isResolution ? { status: nextStatus, feedbackNotes: "Resolution via board update" } : {};
      
      const res = await authenticatedFetch(url, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update task status");
      }
      return data;
    } catch (err) {
      console.error("Failed to update task status on backend:", err);
      throw err;
    }
  },

  addManagerTask: async (task) => {
    return employeeService.addTask(task);
  },

  reviewTask: async (taskId, status, feedbackNotes) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status, feedbackNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resolve task");
      }
      return data;
    } catch (err) {
      console.error("Failed to resolve task on backend:", err);
      throw err;
    }
  },

  updateTask: async (taskId, updatedFields) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update task");
      }
      return data.data.task;
    } catch (err) {
      console.error("Failed to update task on backend:", err);
      throw err;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete task");
      }
      return true;
    } catch (err) {
      console.error("Failed to delete task on backend:", err);
      throw err;
    }
  }
};
