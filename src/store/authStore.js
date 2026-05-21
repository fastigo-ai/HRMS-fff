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
          const users = JSON.parse(localStorage.getItem('worksphere_db_users') || '[]');
          const matchedUser = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );

          if (!matchedUser) {
            return { success: false, error: 'Invalid email or password credential' };
          }

          dispatch(setAuth({
            isAuthenticated: true,
            userRole: matchedUser.role,
            profileData: matchedUser
          }));

          localStorage.setItem('worksphere_auth', 'true');
          localStorage.setItem('worksphere_role', matchedUser.role);
          localStorage.setItem('worksphere_profile', JSON.stringify(matchedUser));

          return { success: true, role: matchedUser.role };
        } catch (err) {
          return { success: false, error: 'Authentication internal server error' };
        }
      },

      signup: async (name, email, password, role) => {
        try {
          const users = JSON.parse(localStorage.getItem('worksphere_db_users') || '[]');
          const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());

          if (userExists) {
            return { success: false, error: 'Account email already registered' };
          }

          const newUser = {
            name,
            email,
            password,
            role,
            position: role === 'hr_admin' ? 'HR Coordinator' : role === 'manager' ? 'Scrum Manager' : 'Frontend Engineer',
            department: role === 'hr_admin' ? 'People Operations' : role === 'manager' ? 'Product Engineering' : 'SaaS Development',
            empId: `WS-${Math.floor(10000 + Math.random() * 90000)}`,
            joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            phone: '+1 (555) 901-2940',
            address: 'Simulated Enterprise HQ, Staging City',
            skills: ['React Framework', 'Zustand Stores', 'Vite Modules'],
            bankDetails: {
              bankName: 'Silicon Valley Clearing Bank',
              accountNo: '•••• •••• ' + Math.floor(1000 + Math.random() * 9000),
              panNumber: 'XXAPJ' + Math.floor(1000 + Math.random() * 9000) + 'F',
              ifscCode: 'SVCB0008800'
            }
          };

          users.push(newUser);
          localStorage.setItem('worksphere_db_users', JSON.stringify(users));

          dispatch(setAuth({
            isAuthenticated: true,
            userRole: newUser.role,
            profileData: newUser
          }));

          localStorage.setItem('worksphere_auth', 'true');
          localStorage.setItem('worksphere_role', newUser.role);
          localStorage.setItem('worksphere_profile', JSON.stringify(newUser));

          return { success: true, role: newUser.role };
        } catch (err) {
          return { success: false, error: 'Registration failure' };
        }
      },

      logout: () => {
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
        localStorage.removeItem('worksphere_role');
        localStorage.removeItem('worksphere_profile');
      },

      updateProfile: async (newProfile) => {
        try {
          const users = JSON.parse(localStorage.getItem('worksphere_db_users') || '[]');
          const activeUser = authState.profileData;
          
          if (!activeUser) return { success: false, error: 'Session profile missing' };

          const updatedUsers = users.map((u) => {
            if (u.email.toLowerCase() === activeUser.email.toLowerCase()) {
              return { ...u, ...newProfile };
            }
            return u;
          });

          localStorage.setItem('worksphere_db_users', JSON.stringify(updatedUsers));
          const updatedUser = updatedUsers.find((u) => u.email.toLowerCase() === activeUser.email.toLowerCase());

          dispatch(setProfile(updatedUser));
          localStorage.setItem('worksphere_profile', JSON.stringify(updatedUser));

          return { success: true };
        } catch (err) {
          return { success: false, error: err };
        }
      },

      setProfileData: async (newProfile) => {
        try {
          const users = JSON.parse(localStorage.getItem('worksphere_db_users') || '[]');
          const activeUser = authState.profileData;
          if (!activeUser) return { success: false, error: 'Session profile missing' };
          const updatedUsers = users.map((u) => {
            if (u.email.toLowerCase() === activeUser.email.toLowerCase()) {
              return { ...u, ...newProfile };
            }
            return u;
          });
          localStorage.setItem('worksphere_db_users', JSON.stringify(updatedUsers));
          const updatedUser = updatedUsers.find((u) => u.email.toLowerCase() === activeUser.email.toLowerCase());

          dispatch(setProfile(updatedUser));
          localStorage.setItem('worksphere_profile', JSON.stringify(updatedUser));

          return { success: true };
        } catch (err) {
          return { success: false, error: err };
        }
      },

      toggleClock: (triggerToast) => {
        const { clockedIn, elapsedTime } = authState;
        if (!clockedIn) {
          dispatch(setClockState({ clockedIn: true, clockInTime: new Date().toISOString() }));
          if (triggerToast) triggerToast('Clocked In successfully! Current geofence checked.');
        } else {
          dispatch(setClockState({ clockedIn: false, clockInTime: null }));
          if (triggerToast) triggerToast(`Clocked Out! Daily session logs recorded: ${elapsedTime}`);
          dispatch(setElapsedTime('00:00:00'));
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
