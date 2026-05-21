export const initialCandidates = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    role: 'Senior Product Designer',
    stage: 'applied',
    statusTag: 'New Application',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256'
  },
  {
    id: 2,
    name: 'Marcus Knight',
    role: 'Senior Java Architect',
    stage: 'applied',
    statusTag: 'Review Pending',
    tagColor: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256'
  },
  {
    id: 3,
    name: 'James Wilson',
    role: 'Senior QA Engineer',
    stage: 'screening',
    statusTag: 'Phone Screen',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256&h=256',
    schedule: 'Today at 2:00 PM'
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    role: 'Tech Lead React',
    stage: 'interview',
    statusTag: 'Panel Round 2',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256',
    schedule: 'Oct 24 at 10:30 AM'
  }
];

export const initialSourcingChannels = [
  { name: 'LinkedIn Professional', percentage: 42, color: 'bg-indigo-650' },
  { name: 'Employee Referrals', percentage: 31, color: 'bg-indigo-400' },
  { name: 'Direct Careers Portal', percentage: 27, color: 'bg-indigo-300' }
];

export const initialInterviews = [
  { id: 101, title: 'Technical Interview', candidate: 'Elena Rodriguez', date: 'Oct 24', time: '10:30 AM', type: 'Video Panel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64' },
  { id: 102, title: 'Culture Fit Assessment', candidate: 'Marcus Knight', date: 'Oct 25', time: '02:00 PM', type: 'Onsite Group', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64' }
];
