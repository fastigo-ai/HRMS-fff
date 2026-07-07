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
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/leads/${leadId}/status`, {
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

  updateLead: async (leadId, leadData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update lead");
      }
      return data.data.lead;
    } catch (err) {
      console.error("Failed to update lead:", err);
      throw err;
    }
  },

  deleteLead: async (leadId) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/leads/${leadId}`, {
        method: 'DELETE',
      });
      if (res.status === 204) return true;
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete lead");
      }
      return true;
    } catch (err) {
      console.error("Failed to delete lead:", err);
      throw err;
    }
  },

  generateQuote: async (quoteData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate quotation");
      }
      return data.data.quotation;
    } catch (err) {
      console.error("Failed to generate quote:", err);
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

  addActivity: async (activityData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add activity");
      }
      return data.data.activity;
    } catch (err) {
      console.error("Failed to add activity:", err);
      throw err;
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

  fetchAnalytics: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/analytics`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch analytics");
      }
      return data.data;
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      return null;
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
  },

  fetchQuotations: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/quotations`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch quotations");
      return data.data.quotations;
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
      throw err;
    }
  },

  updateQuotation: async (id, quoteData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/quotations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update quotation");
      return data.data.quotation;
    } catch (err) {
      console.error("Failed to update quotation:", err);
      throw err;
    }
  },

  deleteQuotation: async (id) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/sales/quotations/${id}`, {
        method: 'DELETE',
      });
      if (res.status === 204) return true;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete quotation");
      return true;
    } catch (err) {
      console.error("Failed to delete quotation:", err);
      throw err;
    }
  }
};
