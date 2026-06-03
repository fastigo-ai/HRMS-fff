import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import { DatabaseService, authenticatedFetch } from '../services/api';
import { setProfile } from './authStore';

const initialState = {
  tasks: [],
  payslips: [],
  leaveBalances: {
    casualLeave: 12,
    sickLeave: 8,
    paidLeave: 15
  },
  leaveHistory: [
    { id: 1, type: 'Sick Leave', startDate: '2026-05-10', endDate: '2026-05-12', totalDays: 2, reason: 'Flu recovery', status: 'Approved', approvedBy: 'Sarah Chen' },
    { id: 2, type: 'Casual Leave', startDate: '2026-04-15', endDate: '2026-04-16', totalDays: 1, reason: 'Family event', status: 'Approved', approvedBy: 'Sarah Chen' },
  ],
  downloadingDocument: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setPayslips: (state, action) => {
      state.payslips = action.payload;
    },
    setDownloadingDocument: (state, action) => {
      state.downloadingDocument = action.payload;
    },
    applyLeaveRequest: (state, action) => {
      state.leaveHistory = [
        {
          id: Date.now(),
          status: 'Pending',
          approvedBy: 'Pending Review',
          ...action.payload
        },
        ...state.leaveHistory
      ];
    },
    setLeaveHistory: (state, action) => {
      state.leaveHistory = action.payload;
    }
  }
});

export const { setTasks, setPayslips, setDownloadingDocument, applyLeaveRequest, setLeaveHistory } = employeeSlice.actions;

export const useEmployeeStore = (selectorFn) => {
  const dispatch = useDispatch();
  const employeeState = useSelector((s) => s.employee);
  const profileData = useSelector((s) => s.auth.profileData);

  const actionsAndState = useMemo(() => {
    return {
      ...employeeState,
      leaveBalances: profileData?.leaveBalances || employeeState.leaveBalances,

      fetchEmployeeData: async () => {
        try {
          const taskList = await DatabaseService.getTasks();
          dispatch(setTasks(taskList));

          // Fetch personal payslips
          const slipList = await DatabaseService.getPayslips();
          dispatch(setPayslips(slipList));

          // Fetch leaves from database
          const res = await authenticatedFetch("https://hrms-bb.onrender.com/api/leaves/my");
          const data = await res.json();
          if (res.ok) {
            dispatch(setLeaveHistory(data.data.leaves));
          }

          // Fetch latest profile to sync leaveBalances, position, details etc.
          const resProfile = await authenticatedFetch("https://hrms-bb.onrender.com/api/auth/profile");
          const dataProfile = await resProfile.json();
          if (resProfile.ok) {
            dispatch(setProfile(dataProfile.data.user));
            localStorage.setItem('Fastigo X_profile', JSON.stringify(dataProfile.data.user));
          }
        } catch (err) {
          console.error('Failed to sync employee tasks & leaves & profile:', err);
        }
      },

      startTask: async (taskId, triggerToast) => {
        try {
          await DatabaseService.startTask(taskId);
          const taskList = await DatabaseService.getTasks();
          dispatch(setTasks(taskList));
          if (triggerToast) triggerToast('Task started successfully! Shift time tracking activated.');
        } catch (err) {
          console.error('Failed to start task:', err);
        }
      },

      addWorkReport: async (taskId, reportData, triggerToast) => {
        try {
          await DatabaseService.addWorkReport(taskId, reportData);
          const taskList = await DatabaseService.getTasks();
          dispatch(setTasks(taskList));
          if (triggerToast) triggerToast('Daily work report submitted successfully!');
        } catch (err) {
          console.error('Failed to add work report:', err);
        }
      },

      completeTask: async (taskId, completionData, triggerToast) => {
        try {
          await DatabaseService.completeTask(taskId, completionData);
          const taskList = await DatabaseService.getTasks();
          dispatch(setTasks(taskList));
          if (triggerToast) triggerToast('Task marked as Completed! Sent to manager for approval review.');
        } catch (err) {
          console.error('Failed to complete task:', err);
        }
      },

      updateTaskStatus: async (taskId, newStatus) => {
        try {
          const updated = employeeState.tasks.map(t => {
            if (t.id === taskId) {
              let prog = t.progress;
              if (newStatus === 'Completed') prog = 100;
              return { ...t, status: newStatus, progress: prog };
            }
            return t;
          });
          dispatch(setTasks(updated));
          
          if (newStatus === 'Completed') {
            await DatabaseService.completeTask(taskId, { notes: 'Marked complete via toggle.' });
          } else if (newStatus === 'In Progress') {
            await DatabaseService.startTask(taskId);
          } else {
            const currentTasks = await DatabaseService.getTasks();
            const updatedDb = currentTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
            localStorage.setItem('Fastigo X_tasks', JSON.stringify(updatedDb));
          }
          
          const taskList = await DatabaseService.getTasks();
          dispatch(setTasks(taskList));
        } catch (err) {
          console.error('Failed to update status:', err);
        }
      },

      incrementTaskProgress: async (taskId) => {
        try {
          await DatabaseService.addWorkReport(taskId, {
            dailyUpdate: 'Quick progress update',
            workCompleted: 'Completed incremental sprints',
            issues: 'None',
            timeSpent: '30 mins'
          });
          const taskList = await DatabaseService.getTasks();
          dispatch(setTasks(taskList));
        } catch (err) {
          console.error('Failed to increment progress:', err);
        }
      },

      handleDocumentDownload: (docName, triggerToast) => {
        dispatch(setDownloadingDocument(docName));
        setTimeout(() => {
          dispatch(setDownloadingDocument(null));
          if (triggerToast) triggerToast(`Completed secure download of ${docName}`);
        }, 1500);
      },

      applyLeave: async (leaveRequest, triggerToast) => {
        try {
          const res = await authenticatedFetch("https://hrms-bb.onrender.com/api/leaves/my", {
            method: "POST",
            body: JSON.stringify(leaveRequest),
          });
          const data = await res.json();
          if (!res.ok) {
            if (triggerToast) triggerToast(data.message || 'Failed to submit leave request.', 'error');
            return;
          }

          // Append leave to local history list
          dispatch(applyLeaveRequest(data.data.leave));

          // Update user balances in AuthStore!
          dispatch(setProfile(data.data.user));

          if (triggerToast) triggerToast('Leave request submitted successfully for approval.');
        } catch (err) {
          console.error('Failed to apply for leave:', err);
          if (triggerToast) triggerToast('Failed to apply for leave. Server unreachable.', 'error');
        }
      }
    };
  }, [employeeState, dispatch, profileData]);

  if (typeof selectorFn === 'function') {
    return selectorFn(actionsAndState);
  }
  return actionsAndState;
};

export default employeeSlice.reducer;
