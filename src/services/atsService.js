import { authenticatedFetch, API_BASE_URL } from './apiClient';

export const atsService = {
  // Jobs
  getJobs: async (status) => {
    let url = `${API_BASE_URL}/ats/jobs`;
    if (status) url += `?status=${status}`;
    const res = await authenticatedFetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  getJob: async (id) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/jobs/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  createJob: async (payload) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/jobs`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  
  updateJob: async (id, payload) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  createCandidate: async (payload) => {
    const isFormData = payload instanceof FormData;
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/candidates`, {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // Applications (Pipeline)
  createJobApplication: async (payload) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/applications`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  getJobApplications: async (jobId) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/applications?jobId=${jobId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  updateJobApplicationStage: async (id, stage) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/applications/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  triggerAiMatch: async (appId) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/applications/${appId}/match`, {
      method: "POST"
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  triggerVoiceScreening: async (applicationId) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/applications/${applicationId}/voice-start`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },
  syncVoiceScreening: async (applicationId) => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/applications/${applicationId}/voice-sync`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // Interviews
  getInterviews: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/interviews`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // Analytics
  getRecruitmentAnalytics: async () => {
    const res = await authenticatedFetch(`${API_BASE_URL}/ats/analytics`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  }
};
