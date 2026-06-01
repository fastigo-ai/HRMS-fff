import { authenticatedFetch, API_BASE_URL } from './apiClient';

export const salesService = {
  fetchLeads: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/leads`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch leads");
      }
      return data.data.leads || [];
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      return [];
    }
  },

  registerLead: async (leadData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to register lead");
      }
      return data.data.lead;
    } catch (err) {
      console.error("Failed to register lead:", err);
      throw err;
    }
  },

  advanceLead: async (leadId, status) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update lead status");
      }
      return data.data.lead;
    } catch (err) {
      console.error("Failed to update lead status:", err);
      throw err;
    }
  },

  fetchActivities: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/activities`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch sales activities");
      }
      return data.data.activities || [];
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      return [];
    }
  },

  logActivity: async (actData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to log sales activity");
      }
      return data.data.activity;
    } catch (err) {
      console.error("Failed to log activity:", err);
      throw err;
    }
  },

  fetchDwrs: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/dwrs`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch Daily Work Reports");
      }
      return data.data.dwrs || [];
    } catch (err) {
      console.error("Failed to fetch DWRs:", err);
      return [];
    }
  },

  submitDwr: async (dwrData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/dwrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dwrData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit Daily Work Report");
      }
      return data.data.dwr;
    } catch (err) {
      console.error("Failed to submit DWR:", err);
      throw err;
    }
  },

  fetchSalesPerformance: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/performance`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch sales performance metrics");
      }
      return data.data.performance || [];
    } catch (err) {
      console.error("Failed to fetch sales performance metrics:", err);
      return [];
    }
  },

  changeSalesRole: async (empId, position) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/role/${empId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update employee's sales position");
      }
      return data.data.user;
    } catch (err) {
      console.error("Failed to update sales position:", err);
      throw err;
    }
  }
};
