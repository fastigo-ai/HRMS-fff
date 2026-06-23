import { delay, getCached, setCached, authenticatedFetch, API_BASE_URL } from './apiClient';
import { initialProfileData, initialPayslips, initialNotifications } from '../data/employeeData';

export const employeeService = {
  getProfile: async () => {
    await delay();
    return getCached('profile', initialProfileData);
  },

  updateProfile: async (updatedData) => {
    await delay(300);
    setCached('profile', updatedData);
    return updatedData;
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/auth/password`, {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }
      return data;
    } catch (err) {
      console.error("Failed to update password:", err);
      throw err;
    }
  },

  getTasks: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch tasks");
      }
      return data.data.tasks || [];
    } catch (err) {
      console.error("Failed to fetch tasks from backend:", err);
      return [];
    }
  },

  addTask: async (task) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        body: JSON.stringify(task),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create task");
      }
      return data.data.task;
    } catch (err) {
      console.error("Failed to add task on backend:", err);
      throw err;
    }
  },

  getPayslips: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/payroll/my`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch payslips");
      }
      return data.data.payslips || [];
    } catch (err) {
      console.error("Failed to fetch payslips from backend:", err);
      return [];
    }
  },

  getNotifications: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/notifications`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }
      return (data.data.notifications || []).map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        category: n.category || 'task',
        time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        priority: n.priority || 'normal',
        isRead: n.isRead || false
      }));
    } catch (err) {
      console.error("Failed to fetch notifications from backend:", err);
      return [];
    }
  },

  markNotificationsAsRead: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/notifications`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to mark notifications read");
      }
      return (data.data.notifications || []).map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        category: n.category || 'task',
        time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        priority: n.priority || 'normal',
        isRead: n.isRead || false
      }));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
      return [];
    }
  },

  startTask: async (taskId) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}/start`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to start task");
      }
      return data;
    } catch (err) {
      console.error("Failed to start task on backend:", err);
      throw err;
    }
  },

  addWorkReport: async (taskId, reportData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}/report`, {
        method: "POST",
        body: JSON.stringify(reportData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add work report");
      }
      return data;
    } catch (err) {
      console.error("Failed to add work report on backend:", err);
      throw err;
    }
  },

  completeTask: async (taskId, completionData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
        method: "PATCH",
        body: JSON.stringify({ notes: completionData.notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to complete task");
      }
      return data;
    } catch (err) {
      console.error("Failed to complete task on backend:", err);
      throw err;
    }
  },

  // WFH Requests
  getWFHRequests: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/wfh/my`);
      const data = await res.json();
      return data.data.requests || [];
    } catch (err) {
      console.error("Failed to fetch WFH requests:", err);
      return [];
    }
  },

  createWFHRequest: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/wfh/my`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.wfh;
    } catch (err) {
      console.error("Failed to create WFH request:", err);
      throw err;
    }
  },

  // Overtime Requests
  getOvertimeRequests: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/overtime/my`);
      const data = await res.json();
      return data.data.requests || [];
    } catch (err) {
      console.error("Failed to fetch Overtime requests:", err);
      return [];
    }
  },

  createOvertimeRequest: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/overtime/my`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.overtime;
    } catch (err) {
      console.error("Failed to create Overtime request:", err);
      throw err;
    }
  },

  // Attendance Regularization
  getRegularizations: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/regularizations/my`);
      const data = await res.json();
      return data.data.requests || [];
    } catch (err) {
      console.error("Failed to fetch regularizations:", err);
      return [];
    }
  },

  applyRegularization: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/regularizations/my`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.regularization;
    } catch (err) {
      console.error("Failed to apply regularization:", err);
      throw err;
    }
  },

  // Resignation & Separation
  getResignation: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/resignations/my`);
      const data = await res.json();
      return data.data.resignation;
    } catch (err) {
      console.error("Failed to fetch resignation status:", err);
      return null;
    }
  },

  submitResignation: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/resignations/my`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.resignation;
    } catch (err) {
      console.error("Failed to submit resignation:", err);
      throw err;
    }
  },

  // Onboarding
  getOnboardingTasks: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/onboarding/progress`);
      const data = await res.json();
      return data.data.onboarding;
    } catch (err) {
      console.error("Failed to fetch onboarding tasks:", err);
      return null;
    }
  },

  toggleOnboardingTask: async (taskKey, completed) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/onboarding/toggle`, {
        method: "POST",
        body: JSON.stringify({ taskKey, completed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.onboarding;
    } catch (err) {
      console.error("Failed to toggle onboarding task:", err);
      throw err;
    }
  }
};
