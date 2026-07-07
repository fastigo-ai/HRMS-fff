import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout shells
import EmployeeLayout from '../shared/layouts/EmployeeLayout';
import HRLayout from '../shared/layouts/HRLayout';
import ManagerLayout from '../shared/layouts/ManagerLayout';

// Guard boundaries
import ProtectedRoute from '../modules/auth/ProtectedRoute';
import RoleGuard from '../modules/auth/RoleGuard';
import Loader from '../shared/ui/Loader';
import { useAuthStore } from '../store/authStore';

// Helper to safely load chunks, retrying via page reload on deployment updates
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      const isChunkLoadFailed = error.message && (
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed')
      );
      if (isChunkLoadFailed) {
        console.warn('Chunk load failed. Reloading page...');
        window.location.reload();
      }
      throw error;
    }
  });

// Code splitting / Lazy-loaded components
const LazyLogin = lazyWithRetry(() => import('../modules/auth/pages/Login'));
const LazyRegister = lazyWithRetry(() => import('../modules/auth/pages/Register'));

const LazyEmployeeDashboard = lazyWithRetry(() => import('../modules/employee/pages/Dashboard'));
const LazyEmployeeProfile = lazyWithRetry(() => import('../modules/employee/pages/Profile'));
const LazyEmployeeAttendance = lazyWithRetry(() => import('../modules/employee/pages/Attendance'));
const LazyEmployeeWFHRequest = lazyWithRetry(() => import('../modules/employee/pages/WFHRequest'));
const LazyEmployeeLeaves = lazyWithRetry(() => import('../modules/employee/pages/Leaves'));
const LazyEmployeePayroll = lazyWithRetry(() => import('../modules/employee/pages/Payroll'));
const LazyEmployeeTasks = lazyWithRetry(() => import('../modules/employee/pages/Tasks'));
const LazyEmployeeNotifications = lazyWithRetry(() => import('../modules/employee/pages/Notifications'));
const LazyEmployeeSettings = lazyWithRetry(() => import('../modules/employee/pages/Settings'));
const LazyEmployeeSalesCRM = lazyWithRetry(() => import('../modules/employee/pages/SalesCRM'));

const LazyHRDashboard = lazyWithRetry(() => import('../modules/hr/pages/Dashboard'));
const LazyHREmployees = lazyWithRetry(() => import('../modules/hr/pages/Employees'));
const LazyHRDepartments = lazyWithRetry(() => import('../modules/hr/pages/Departments'));
const LazyHRAttendance = lazyWithRetry(() => import('../modules/hr/pages/Attendance'));
const LazyHRLeaves = lazyWithRetry(() => import('../modules/hr/pages/Leaves'));
const LazyHRPayroll = lazyWithRetry(() => import('../modules/hr/pages/Payroll'));
const LazyHRRecruitment = lazyWithRetry(() => import('../modules/hr/pages/Recruitment'));
const LazyHRReports = lazyWithRetry(() => import('../modules/hr/pages/Reports'));
const LazyHRProfile = lazyWithRetry(() => import('../modules/hr/pages/Profile'));

const LazyManagerDashboard = lazyWithRetry(() => import('../modules/manager/pages/Dashboard'));
const LazyManagerTeam = lazyWithRetry(() => import('../modules/manager/pages/Team'));
const LazyManagerTasks = lazyWithRetry(() => import('../modules/manager/pages/Tasks'));
const LazyManagerApprovals = lazyWithRetry(() => import('../modules/manager/pages/Approvals'));
const LazyManagerMilestones = lazyWithRetry(() => import('../modules/manager/pages/Milestones'));
const LazyManagerProfile = lazyWithRetry(() => import('../modules/manager/pages/Profile'));
const LazyHRSalesAudit = lazyWithRetry(() => import('../modules/hr/pages/SalesAudit'));
const LazyManagerSalesAudit = lazyWithRetry(() => import('../modules/manager/pages/SalesAudit'));
const LazyEmployeeHolidays = lazyWithRetry(() => import('../modules/employee/pages/Holidays'));
const LazyHRHolidays = lazyWithRetry(() => import('../modules/hr/pages/Holidays'));
const LazyHRCompanyDetails = lazyWithRetry(() => import('../modules/hr/pages/CompanyDetails'));
const LazyManagerHolidays = lazyWithRetry(() => import('../modules/manager/pages/Holidays'));
const LazyManagerPayroll = lazyWithRetry(() => import('../modules/manager/pages/Payroll'));
const LazyManagerNotifications = lazyWithRetry(() => import('../modules/manager/pages/Notifications'));
const LazyManagerAttendance = lazyWithRetry(() => import('../modules/employee/pages/Attendance'));

const PageSuspense = ({ children }) => (
  <Suspense fallback={<Loader size="lg" text="Decompressing modular bundle..." />}>
    {children}
  </Suspense>
);

// Redirects unauthenticated / to /login, and authenticated to respective role panels
function RootRedirection() {
  const { isAuthenticated, userRole } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (userRole === 'hr_admin') return <Navigate to="/hr/dashboard" replace />;
  if (userRole === 'manager') return <Navigate to="/manager/dashboard" replace />;
  if (userRole === 'salesperson') return <Navigate to="/employee/sales-crm" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

// Prevents authenticated users from seeing Login/Register forms
function AuthGate({ children }) {
  const { isAuthenticated, userRole } = useAuthStore();

  if (isAuthenticated) {
    if (userRole === 'hr_admin') return <Navigate to="/hr/dashboard" replace />;
    if (userRole === 'manager') return <Navigate to="/manager/dashboard" replace />;
    if (userRole === 'salesperson') return <Navigate to="/employee/sales-crm" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirection />
  },
  {
    path: '/login',
    element: <AuthGate><PageSuspense><LazyLogin /></PageSuspense></AuthGate>
  },
  {
    path: '/register',
    element: <AuthGate><PageSuspense><LazyRegister /></PageSuspense></AuthGate>
  },
  {
    path: '/employee',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['standard_employee', 'employee', 'hr_admin', 'manager', 'salesperson']}>
          <EmployeeLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <PageSuspense><LazyEmployeeDashboard /></PageSuspense> },
      { path: 'profile', element: <PageSuspense><LazyEmployeeProfile /></PageSuspense> },
      { path: 'attendance', element: <PageSuspense><LazyEmployeeAttendance /></PageSuspense> },
      { path: 'wfh-request', element: <PageSuspense><LazyEmployeeWFHRequest /></PageSuspense> },
      { path: 'leaves', element: <PageSuspense><LazyEmployeeLeaves /></PageSuspense> },
      { path: 'payroll', element: <PageSuspense><LazyEmployeePayroll /></PageSuspense> },
      { path: 'tasks', element: <PageSuspense><LazyEmployeeTasks /></PageSuspense> },
      { path: 'notifications', element: <PageSuspense><LazyEmployeeNotifications /></PageSuspense> },
      { path: 'settings', element: <PageSuspense><LazyEmployeeSettings /></PageSuspense> },
      { path: 'holidays', element: <PageSuspense><LazyEmployeeHolidays /></PageSuspense> },
      { path: 'company-details', element: <PageSuspense><LazyHRCompanyDetails /></PageSuspense> },
      { path: 'sales-crm', element: <PageSuspense><LazyEmployeeSalesCRM /></PageSuspense> }
    ]
  },
  {
    path: '/hr',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['hr_admin']}>
          <HRLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <PageSuspense><LazyHRDashboard /></PageSuspense> },
      { path: 'employees', element: <PageSuspense><LazyHREmployees /></PageSuspense> },
      { path: 'departments', element: <PageSuspense><LazyHRDepartments /></PageSuspense> },
      { path: 'attendance', element: <PageSuspense><LazyHRAttendance /></PageSuspense> },
      { path: 'leaves', element: <PageSuspense><LazyHRLeaves /></PageSuspense> },
      { path: 'payroll', element: <PageSuspense><LazyHRPayroll /></PageSuspense> },
      { path: 'recruitment', element: <PageSuspense><LazyHRRecruitment /></PageSuspense> },
      { path: 'reports', element: <PageSuspense><LazyHRReports /></PageSuspense> },
      { path: 'sales-audit', element: <PageSuspense><LazyHRSalesAudit /></PageSuspense> },
      { path: 'profile', element: <PageSuspense><LazyHRProfile /></PageSuspense> },
      { path: 'holidays', element: <PageSuspense><LazyHRHolidays /></PageSuspense> },
      { path: 'wfh-request', element: <PageSuspense><LazyEmployeeWFHRequest /></PageSuspense> },
      { path: 'company-details', element: <PageSuspense><LazyHRCompanyDetails /></PageSuspense> }
    ]
  },
  {
    path: '/manager',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['manager']}>
          <ManagerLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <PageSuspense><LazyManagerDashboard /></PageSuspense> },
      { path: 'attendance', element: <PageSuspense><LazyManagerAttendance /></PageSuspense> },
      { path: 'team', element: <PageSuspense><LazyManagerTeam /></PageSuspense> },
      { path: 'tasks', element: <PageSuspense><LazyManagerTasks /></PageSuspense> },
      { path: 'approvals', element: <PageSuspense><LazyManagerApprovals /></PageSuspense> },
      { path: 'milestones', element: <PageSuspense><LazyManagerMilestones /></PageSuspense> },
      { path: 'sales-audit', element: <PageSuspense><LazyManagerSalesAudit /></PageSuspense> },
      { path: 'profile', element: <PageSuspense><LazyManagerProfile /></PageSuspense> },
      { path: 'holidays', element: <PageSuspense><LazyManagerHolidays /></PageSuspense> },
      { path: 'payroll', element: <PageSuspense><LazyManagerPayroll /></PageSuspense> },
      { path: 'notifications', element: <PageSuspense><LazyManagerNotifications /></PageSuspense> },
      { path: 'wfh-request', element: <PageSuspense><LazyEmployeeWFHRequest /></PageSuspense> },
      { path: 'company-details', element: <PageSuspense><LazyHRCompanyDetails /></PageSuspense> }
    ]
  },
  {
    path: '*',
    element: <RootRedirection />
  }
]);
