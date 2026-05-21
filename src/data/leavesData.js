export const initialLeaveRequests = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Product Designer • Creative Team',
    type: 'Annual Leave',
    dates: 'Oct 12 - Oct 15, 2023 (4 Days)',
    daysRemaining: '14 Days Remaining',
    reason: 'Family vacation planned since January. All sprint tasks for week 41 are pre-assigned.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'Lead Developer • Engineering',
    type: 'Sick Leave',
    dates: 'Today (1 Day)',
    daysRemaining: 'Urgent: Auto-filling',
    isUrgent: true,
    reason: 'Woke up with severe flu symptoms. Will check emails intermittently if possible.',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256'
  }
];

export const initialLeavePolicies = [
  { id: 1, name: 'Annual Accrual', desc: 'Standard Corporate', val: '2.1', unit: 'days/mo' },
  { id: 2, name: 'Carry-Forward', desc: 'Annual Reset', val: '5', unit: 'days max' },
  { id: 3, name: 'Sick Leave', desc: 'Full Pay Benefit', val: '10', unit: 'days/yr' }
];

export const initialTeamCalendarStatus = {
  3: 'pending',
  8: 'today',
  12: 'out',
  13: 'out',
  14: 'out',
  15: 'out'
};
