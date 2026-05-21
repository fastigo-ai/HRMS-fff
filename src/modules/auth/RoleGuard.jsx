import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function RoleGuard({ allowedRoles = [], children }) {
  const { userRole, setUserRole } = useAuthStore();
  const location = useLocation();

  // Derive role dynamically from active URL path to prevent state lag
  const path = location.pathname;
  let activeRole = userRole;
  if (path.startsWith('/hr')) {
    activeRole = 'hr_admin';
  } else if (path.startsWith('/manager')) {
    activeRole = 'manager';
  } else if (path.startsWith('/employee')) {
    activeRole = 'standard_employee';
  }

  // Sync back to store asynchronously
  useEffect(() => {
    if (activeRole !== userRole) {
      setUserRole(activeRole);
    }
  }, [activeRole, userRole]);

  if (!allowedRoles.includes(activeRole)) {
    console.warn(`Access denied for role: ${activeRole}. Permitted roles: ${allowedRoles.join(', ')}`);
    
    // Redirect to default path depending on derived role
    if (activeRole === 'hr_admin') return <Navigate to="/hr/dashboard" replace />;
    if (activeRole === 'manager') return <Navigate to="/manager/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}
