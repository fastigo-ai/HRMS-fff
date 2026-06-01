export const initialProfileData = {
  name: 'Alex Johnson',
  position: 'Senior Developer',
  department: 'Engineering & SaaS Architecture',
  empId: 'WS-88402',
  joinDate: 'Jan 15, 2023',
  email: 'alex.johnson@Fastigo X.io',
  phone: '+1 (555) 382-9029',
  address: '422 Willow Lane, Austin, TX 78701',
  skills: ['React / Next.js', 'Tailwind CSS v4', 'NodeJS / Express', 'Enterprise RBAC Architectures', 'Geofencing APIs'],
  bankDetails: {
    bankName: 'Silicon Valley Clearing Bank',
    accountNo: '•••• •••• 9840',
    panNumber: 'AAAPJ9082F',
    ifscCode: 'SVCB0008842'
  }
};

export const initialEmployeeTasks = [
  { id: 1, title: 'Refactor HR recruitment dashboard UI', dept: 'Creative Design', priority: 'High', deadline: 'Today', status: 'In Progress', progress: 40 },
  { id: 2, title: 'Establish global standard typography tokens', dept: 'Engineering Integration', priority: 'Medium', deadline: 'Oct 28', status: 'Completed', progress: 100 },
  { id: 3, title: 'Draft corporate hybrid remote framework audit', dept: 'Operations Management', priority: 'Low', deadline: 'Nov 02', status: 'Pending', progress: 0 }
];

export const initialPayslips = [
  { id: 1, period: 'October 2023', baseSalary: '₹85,000', taxWithheld: '₹12,750', netPay: '₹72,250', status: 'Disbursed' },
  { id: 2, period: 'September 2023', baseSalary: '₹85,000', taxWithheld: '₹12,750', netPay: '₹72,250', status: 'Disbursed' },
  { id: 3, period: 'August 2023', baseSalary: '₹85,000', taxWithheld: '₹12,750', netPay: '₹72,250', status: 'Disbursed' }
];

export const initialNotifications = [
  {
    id: 1,
    title: 'New Company Policy: Remote Work V2.0',
    message: 'Please review the updated guidelines regarding hybrid work schedules and mandatory office presence days starting next month.',
    category: 'announcement',
    time: '10:30 AM',
    priority: 'high',
    isRead: false
  },
  {
    id: 2,
    title: 'Monthly Payslip Generated',
    message: 'Your salary receipt for the active month is now ready. Review breakdowns inside the Payroll panel.',
    category: 'payroll',
    time: 'Yesterday',
    priority: 'normal',
    isRead: false
  }
];
