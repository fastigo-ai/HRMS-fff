export const initialProjects = [
  { id: 'p1', name: 'WorkSphere Core Refactor', dept: 'Engineering', status: 'In Progress', progress: 76, teamSize: 5, budget: '₹8.5L', health: 'Healthy' },
  { id: 'p2', name: 'AI Recruitment Integration', dept: 'Product Engineering', status: 'In Progress', progress: 42, teamSize: 3, budget: '₹4.2L', health: 'Healthy' },
  { id: 'p3', name: 'Global Payroll Vault', dept: 'Security & Compliance', status: 'Delayed', progress: 18, teamSize: 4, budget: '₹11L', health: 'At Risk' },
  { id: 'p4', name: 'Atomic Typography Tokens', dept: 'Experience Design', status: 'Completed', progress: 100, teamSize: 2, budget: '₹1.5L', health: 'Completed' }
];

export const initialTeamMembers = [
  { 
    id: 1, 
    name: 'Sarah Wu', 
    role: 'Senior Frontend Developer', 
    skills: ['React/Next.js', 'Vite', 'TailwindCSS'], 
    allocation: 80, 
    status: 'Active', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64', 
    completionRate: 92, 
    activeProject: 'WorkSphere Core Refactor' 
  },
  { 
    id: 2, 
    name: 'Julian Day', 
    role: 'UI/UX Specialist', 
    skills: ['Figma Prototyping', 'Design System Strategy'], 
    allocation: 60, 
    status: 'WFH', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64', 
    completionRate: 88, 
    activeProject: 'Atomic Typography Tokens' 
  },
  { 
    id: 3, 
    name: 'Marcus Thorne', 
    role: 'Backend Architect', 
    skills: ['Node.js', 'Postgres', 'Redis Caching'], 
    allocation: 95, 
    status: 'Active', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64', 
    completionRate: 96, 
    activeProject: 'Global Payroll Vault' 
  },
  { 
    id: 4, 
    name: 'Elena Rodriguez', 
    role: 'Product Manager Associate', 
    skills: ['Agile Scrum', 'Milestone Auditing'], 
    allocation: 50, 
    status: 'On Leave', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64', 
    completionRate: 85, 
    activeProject: 'AI Recruitment Integration' 
  }
];

export const initialTimesheets = [
  { id: 201, name: 'Sarah Wu', project: 'WorkSphere Core Refactor', period: 'Oct 12 - Oct 18, 2026', hours: 42, status: 'Pending', details: 'Refactored React hooks, modularized custom sidebar and routing panels.' },
  { id: 202, name: 'Marcus Thorne', project: 'Global Payroll Vault', period: 'Oct 12 - Oct 18, 2026', hours: 48, status: 'Pending', details: 'Engineered cryptographic salting algorithms and tax withhold cache triggers.' },
  { id: 203, name: 'Julian Day', project: 'Atomic Typography Tokens', period: 'Oct 12 - Oct 18, 2026', hours: 35, status: 'Approved', details: 'Reviewed letter spacing ratios and established visual tokens layout.' }
];

export const initialManagerSprintTasks = [
  { id: 501, title: 'Refactor central app routing controllers', assignee: 'Sarah Wu', priority: 'High', status: 'In Progress', category: 'Engineering' },
  { id: 502, title: 'Create reusable timeline milestones Gantt', assignee: 'Julian Day', priority: 'High', status: 'Backlog', category: 'Creative' },
  { id: 503, title: 'Set up redis cluster cache fallbacks', assignee: 'Marcus Thorne', priority: 'Medium', status: 'Review', category: 'Backend' },
  { id: 504, title: 'Review feedback on onboarding prototypes', assignee: 'Elena Rodriguez', priority: 'Low', status: 'Done', category: 'Product' }
];
