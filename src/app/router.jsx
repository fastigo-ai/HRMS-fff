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

// Code splitting / Lazy-loaded components
const LazyLogin = lazy(() => import('../modules/auth/pages/Login'));
const LazyRegister = lazy(() => import('../modules/auth/pages/Register'));

const LazyEmployeeDashboard = lazy(() => import('../modules/employee/pages/Dashboard'));
const LazyEmployeeProfile = lazy(() => import('../modules/employee/pages/Profile'));
const LazyEmployeeAttendance = lazy(() => import('../modules/employee/pages/Attendance'));
const LazyEmployeeWFHRequest = lazy(() => import('../modules/employee/pages/WFHRequest'));
const LazyEmployeeLeaves = lazy(() => import('../modules/employee/pages/Leaves'));
const LazyEmployeePayroll = lazy(() => import('../modules/employee/pages/Payroll'));
const LazyEmployeeTasks = lazy(() => import('../modules/employee/pages/Tasks'));
const LazyEmployeeNotifications = lazy(() => import('../modules/employee/pages/Notifications'));
const LazyEmployeeSettings = lazy(() => import('../modules/employee/pages/Settings'));

const LazyHRDashboard = lazy(() => import('../modules/hr/pages/Dashboard'));
const LazyHREmployees = lazy(() => import('../modules/hr/pages/Employees'));
const LazyHRDepartments = lazy(() => import('../modules/hr/pages/Departments'));
const LazyHRAttendance = lazy(() => import('../modules/hr/pages/Attendance'));
const LazyHRLeaves = lazy(() => import('../modules/hr/pages/Leaves'));
const LazyHRPayroll = lazy(() => import('../modules/hr/pages/Payroll'));
const LazyHRRecruitment = lazy(() => import('../modules/hr/pages/Recruitment'));
const LazyHRReports = lazy(() => import('../modules/hr/pages/Reports'));
const LazyHRProfile = lazy(() => import('../modules/hr/pages/Profile'));

const LazyManagerDashboard = lazy(() => import('../modules/manager/pages/Dashboard'));
const LazyManagerTeam = lazy(() => import('../modules/manager/pages/Team'));
const LazyManagerTasks = lazy(() => import('../modules/manager/pages/Tasks'));
const LazyManagerApprovals = lazy(() => import('../modules/manager/pages/Approvals'));
const LazyManagerMilestones = lazy(() => import('../modules/manager/pages/Milestones'));
const LazyManagerProfile = lazy(() => import('../modules/manager/pages/Profile'));

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
  return <Navigate to="/employee/dashboard" replace />;
}

// Prevents authenticated users from seeing Login/Register forms
function AuthGate({ children }) {
  const { isAuthenticated, userRole } = useAuthStore();

  if (isAuthenticated) {
    if (userRole === 'hr_admin') return <Navigate to="/hr/dashboard" replace />;
    if (userRole === 'manager') return <Navigate to="/manager/dashboard" replace />;
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
        <RoleGuard allowedRoles={['standard_employee', 'employee', 'hr_admin', 'manager']}>
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
      { path: 'settings', element: <PageSuspense><LazyEmployeeSettings /></PageSuspense> }
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
      { path: 'profile', element: <PageSuspense><LazyHRProfile /></PageSuspense> }
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
      { path: 'team', element: <PageSuspense><LazyManagerTeam /></PageSuspense> },
      { path: 'tasks', element: <PageSuspense><LazyManagerTasks /></PageSuspense> },
      { path: 'approvals', element: <PageSuspense><LazyManagerApprovals /></PageSuspense> },
      { path: 'milestones', element: <PageSuspense><LazyManagerMilestones /></PageSuspense> },
      { path: 'profile', element: <PageSuspense><LazyManagerProfile /></PageSuspense> }
    ]
  },
  {
    path: '*',
    element: <RootRedirection />
  }
]);
