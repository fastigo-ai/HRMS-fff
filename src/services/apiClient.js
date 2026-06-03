export const API_BASE_URL = "https://hrms-bb.onrender.com/api";

export const authenticatedFetch = async (url, options = {}) => {
  options.credentials = "include";

  if (!options.headers) {
    options.headers = {};
  }

  if (options.body && !(options.body instanceof FormData) && !options.headers["Content-Type"]) {
    options.headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("Fastigo X_token");
  if (token && !options.headers["Authorization"]) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(url, options);

  // Sync token if backend middleware silently refreshed it under the hood
  const newAccessToken = res.headers.get("x-new-access-token");
  if (newAccessToken) {
    localStorage.setItem("Fastigo X_token", newAccessToken);
  }

  // Catch 401 Unauthorized (Access Token expired) and perform automatic refresh under the hood
  if (res.status === 401 && !url.includes("/api/auth/refresh")) {
    console.log("Access token expired (401). Triggering silent session refresh...");
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const token = refreshData.token;
        const user = refreshData.data.user;

        localStorage.setItem("Fastigo X_auth", "true");
        localStorage.setItem("Fastigo X_token", token);
        localStorage.setItem("Fastigo X_profile", JSON.stringify(user));

        console.log("Session successfully renewed! Retrying original request...");
        // Retry the original query
        res = await fetch(url, options);
      } else {
        console.warn("Session refresh token is invalid/expired. Requiring login redirect.");
        localStorage.removeItem("Fastigo X_auth");
        localStorage.removeItem("Fastigo X_token");
        localStorage.removeItem("Fastigo X_profile");
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
export const getCached = (key, fallback) => {
  const cached = localStorage.getItem(`Fastigo X_${key}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return fallback;
    }
  }
  localStorage.setItem(`Fastigo X_${key}`, JSON.stringify(fallback));
  return fallback;
};

export const setCached = (key, data) => {
  localStorage.setItem(`Fastigo X_${key}`, JSON.stringify(data));
};

// Asynchronous simulator helper
export const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

export const initialUnifiedTasks = [
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
