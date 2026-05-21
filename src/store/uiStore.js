import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';

const initialState = {
  theme: localStorage.getItem('worksphere_theme') || 'light',
  sidebarOpen: false,
  toast: null,
  notifications: [
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
  ]
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    markNotificationRead: (state, action) => {
      state.notifications = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
    },
    addNotification: (state, action) => {
      state.notifications = [
        {
          id: Date.now(),
          time: 'Just now',
          isRead: false,
          priority: 'normal',
          ...action.payload
        },
        ...state.notifications
      ];
    }
  }
});

export const { setSidebarOpen, setTheme, setToast, markNotificationRead, addNotification } = uiSlice.actions;

export const useUiStore = (selectorFn) => {
  const dispatch = useDispatch();
  const uiState = useSelector((s) => s.ui);

  const actionsAndState = useMemo(() => {
    return {
      ...uiState,

      setSidebarOpen: (isOpen) => {
        dispatch(setSidebarOpen(isOpen));
      },

      toggleTheme: () => {
        const nextTheme = uiState.theme === 'light' ? 'dark' : 'light';
        dispatch(setTheme(nextTheme));
        localStorage.setItem('worksphere_theme', nextTheme);
        const rootEl = document.documentElement;
        if (nextTheme === 'dark') {
          rootEl.classList.add('dark');
        } else {
          rootEl.classList.remove('dark');
        }
      },

      initTheme: () => {
        const activeTheme = uiState.theme;
        const rootEl = document.documentElement;
        if (activeTheme === 'dark') {
          rootEl.classList.add('dark');
        } else {
          rootEl.classList.remove('dark');
        }
      },

      triggerToast: (message, type = 'success') => {
        dispatch(setToast({ message, type }));
        setTimeout(() => {
          dispatch(setToast(null));
        }, 4500);
      },

      markNotificationRead: (id) => {
        dispatch(markNotificationRead(id));
      },

      addNotification: (notif) => {
        dispatch(addNotification(notif));
      }
    };
  }, [uiState, dispatch]);

  if (typeof selectorFn === 'function') {
    return selectorFn(actionsAndState);
  }
  return actionsAndState;
};

export default uiSlice.reducer;
