import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';

const getStoredProfile = () => {
  try {
    const raw = localStorage.getItem('worksphere_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const initialState = {
  isAuthenticated: localStorage.getItem('worksphere_auth') === 'true',
  userRole: localStorage.getItem('worksphere_role') || null,
  profileData: getStoredProfile(),
  currentTab: 'dashboard',
  clockedIn: false,
  clockInTime: null,
  elapsedTime: '00:00:00',
  clockOutCompleted: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.userRole = action.payload.userRole;
      state.profileData = action.payload.profileData;
    },
    setRole: (state, action) => {
      state.userRole = action.payload;
    },
    setProfile: (state, action) => {
      state.profileData = action.payload;
    },
    setCurrentTab: (state, action) => {
      state.currentTab = action.payload;
    },
    setClockState: (state, action) => {
      state.clockedIn = action.payload.clockedIn;
      state.clockInTime = action.payload.clockInTime;
      state.clockOutCompleted = action.payload.clockOutCompleted || false;
    },
    setElapsedTime: (state, action) => {
      state.elapsedTime = action.payload;
    }
  }
});

export const { setAuth, setRole, setProfile, setCurrentTab, setClockState, setElapsedTime } = authSlice.actions;

// Pre-configured mock database of user credentials
const defaultUsers = [
  {
    name: 'Sarah Jenkins',
    email: 'hr@worksphere.io',
    password: 'password123',
    role: 'hr_admin',
    position: 'HR Director',
    department: 'People Operations',
    empId: 'WS-00101',
    joinDate: 'Oct 12, 2021',
    phone: '+1 (555) 102-3948',
    address: '882 Park Boulevard, San Francisco, CA 94103',
    skills: ['Talent Acquisition', 'Corporate Culture', 'Conflict Resolution', 'Compensation & Benefits', 'Compliance'],
    bankDetails: {
      bankName: 'JPMorgan Chase & Co.',
      accountNo: '•••• •••• 1102',
      panNumber: 'BBBPJ1024D',
      ifscCode: 'CHAS0001204'
    }
  },
  {
    name: 'David Miller',
    email: 'manager@worksphere.io',
    password: 'password123',
    role: 'manager',
    position: 'Engineering Lead & PM',
    department: 'Engineering Services',
    empId: 'WS-04802',
    joinDate: 'Mar 18, 2022',
    phone: '+1 (555) 482-9011',
    address: '948 Pine Heights, Denver, CO 80202',
    skills: ['Sprint Planning', 'Agile Delivery', 'Resource Allocation', 'System Architecture', 'Direct Mentoring'],
    bankDetails: {
      bankName: 'Wells Fargo Clearing',
      accountNo: '•••• •••• 4802',
      panNumber: 'CCCND4802A',
      ifscCode: 'WFGO0004802'
    }
  },
  {
    name: 'Alex Johnson',
    email: 'employee@worksphere.io',
    password: 'password123',
    role: 'standard_employee',
    position: 'Senior Developer',
    department: 'Engineering & SaaS Architecture',
    empId: 'WS-88402',
    joinDate: 'Jan 15, 2023',
    phone: '+1 (555) 382-9029',
    address: '422 Willow Lane, Austin, TX 78701',
    skills: ['React / Next.js', 'Tailwind CSS v4', 'NodeJS / Express', 'Enterprise RBAC Architectures', 'Geofencing APIs'],
    bankDetails: {
      bankName: 'Silicon Valley Clearing Bank',
      accountNo: '•••• •••• 9840',
      panNumber: 'AAAPJ9082F',
      ifscCode: 'SVCB0008842'
    }
  }
];

if (!localStorage.getItem('worksphere_db_users')) {
  localStorage.setItem('worksphere_db_users', JSON.stringify(defaultUsers));
}

export const useAuthStore = (selectorFn) => {
  const dispatch = useDispatch();
  const authState = useSelector((s) => s.auth);

  const actionsAndState = useMemo(() => {
    return {
      ...authState,

      setUserRole: (role) => {
        dispatch(setRole(role));
        localStorage.setItem('worksphere_role', role);
      },

      setCurrentTab: (tab) => {
        dispatch(setCurrentTab(tab));
      },

      login: async (email, password) => {
        try {
          const res = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.message || "Invalid email or password credential" };
          }
          const token = data.token;
          const user = data.data.user;

          dispatch(setAuth({
            isAuthenticated: true,
            userRole: user.role,
            profileData: user
          }));

          localStorage.setItem('worksphere_auth', 'true');
          localStorage.setItem('worksphere_token', token);
          localStorage.setItem('worksphere_role', user.role);
          localStorage.setItem('worksphere_profile', JSON.stringify(user));

          return { success: true, role: user.role };
        } catch (err) {
          return { success: false, error: 'Authentication internal server error' };
        }
      },

      signup: async (payload, arg2, arg3, arg4) => {
        try {
          const bodyPayload = typeof payload === "object" 
            ? payload 
            : { name: payload, email: arg2, password: arg3, role: arg4 };

          const res = await fetch("http://localhost:8000/api/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(bodyPayload),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.message || "Registration failure" };
          }
          const token = data.token;
          const user = data.data.user;

          dispatch(setAuth({
            isAuthenticated: true,
            userRole: user.role,
            profileData: user
          }));

          localStorage.setItem('worksphere_auth', 'true');
          localStorage.setItem('worksphere_token', token);
          localStorage.setItem('worksphere_role', user.role);
          localStorage.setItem('worksphere_profile', JSON.stringify(user));

          return { success: true, role: user.role };
        } catch (err) {
          return { success: false, error: 'Registration failure' };
        }
      },

      logout: async () => {
        try {
          await fetch("http://localhost:8000/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (err) {
          // Suppress errors during logout to guarantee standard client-side cleanup
        }
        dispatch(setAuth({
          isAuthenticated: false,
          userRole: null,
          profileData: null
        }));
        dispatch(setClockState({
          clockedIn: false,
          clockInTime: null
        }));
        dispatch(setElapsedTime('00:00:00'));

        localStorage.removeItem('worksphere_auth');
        localStorage.removeItem('worksphere_token');
        localStorage.removeItem('worksphere_role');
        localStorage.removeItem('worksphere_profile');
      },

      refreshSession: async () => {
        try {
          const res = await fetch("http://localhost:8000/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false };
          }
          const token = data.token;
          const user = data.data.user;

          dispatch(setAuth({
            isAuthenticated: true,
            userRole: user.role,
            profileData: user
          }));

          localStorage.setItem('worksphere_auth', 'true');
          localStorage.setItem('worksphere_token', token);
          localStorage.setItem('worksphere_role', user.role);
          localStorage.setItem('worksphere_profile', JSON.stringify(user));

          return { success: true };
        } catch (err) {
          return { success: false };
        }
      },

      updateProfile: async (newProfile) => {
        try {
          const token = localStorage.getItem('worksphere_token');
          const res = await fetch("http://localhost:8000/api/auth/profile", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify(newProfile),
          });

          // Handing automatic token refresh on 401 Unauthorized
          if (res.status === 401) {
            const refreshed = await actionsAndState.refreshSession();
            if (refreshed.success) {
              return actionsAndState.updateProfile(newProfile);
            }
            return { success: false, error: 'Session expired' };
          }

          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.message || "Failed to update profile" };
          }
          const user = data.data.user;

          dispatch(setProfile(user));
          localStorage.setItem('worksphere_profile', JSON.stringify(user));

          return { success: true };
        } catch (err) {
          return { success: false, error: 'Profile update failure' };
        }
      },

      setProfileData: async (newProfile) => {
        return actionsAndState.updateProfile(newProfile);
      },

      toggleClock: async (triggerToast) => {
        const { clockedIn, elapsedTime } = authState;
        const token = localStorage.getItem('worksphere_token');
        try {
          if (!clockedIn) {
            const res = await fetch("http://localhost:8000/api/attendance/clock-in", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
              },
              credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
              if (triggerToast) triggerToast(data.message || "Failed to clock in.", "error");
              return;
            }
            dispatch(setClockState({ clockedIn: true, clockInTime: data.data.attendance.clockIn, clockOutCompleted: false }));
            if (triggerToast) triggerToast('Clocked In successfully! Current geofence checked.');
          } else {
            const res = await fetch("http://localhost:8000/api/attendance/clock-out", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
              },
              credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) {
              if (triggerToast) triggerToast(data.message || "Failed to clock out.", "error");
              return;
            }
            dispatch(setClockState({ clockedIn: false, clockInTime: null, clockOutCompleted: true }));
            if (triggerToast) triggerToast(`Clocked Out! Daily session logs recorded: ${elapsedTime}`);
            dispatch(setElapsedTime('00:00:00'));
          }
        } catch (err) {
          console.error("Attendance transaction failure:", err);
          if (triggerToast) triggerToast("Server unreachable for check-in validation.", "error");
        }
      },

      checkTodayClockStatus: async () => {
        const token = localStorage.getItem('worksphere_token');
        try {
          const res = await fetch("http://localhost:8000/api/attendance/today", {
            headers: {
              ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
            credentials: "include",
          });
          const data = await res.json();
          if (res.ok && data.data.attendance) {
            const att = data.data.attendance;
            if (att.clockIn && !att.clockOut) {
              dispatch(setClockState({
                clockedIn: true,
                clockInTime: att.clockIn,
                clockOutCompleted: false
              }));
            } else if (att.clockIn && att.clockOut) {
              dispatch(setClockState({
                clockedIn: false,
                clockInTime: null,
                clockOutCompleted: true
              }));
            } else {
              dispatch(setClockState({
                clockedIn: false,
                clockInTime: null,
                clockOutCompleted: false
              }));
            }
          } else {
            dispatch(setClockState({
              clockedIn: false,
              clockInTime: null,
              clockOutCompleted: false
            }));
          }
        } catch (err) {
          console.error("Failed to check daily clock status:", err);
        }
      },

      updateElapsedTime: () => {
        const { clockedIn, clockInTime } = authState;
        if (clockedIn && clockInTime) {
          const diffMs = new Date() - new Date(clockInTime);
          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);
          dispatch(setElapsedTime(`${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`));
        }
      }
    };
  }, [authState, dispatch]);

  if (typeof selectorFn === 'function') {
    return selectorFn(actionsAndState);
  }
  return actionsAndState;
};

export default authSlice.reducer;
