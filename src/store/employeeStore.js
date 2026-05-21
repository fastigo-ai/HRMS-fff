import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import { DatabaseService } from '../services/api';

const initialState = {
  tasks: [],
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
    }
  }
});

export const { setTasks, setDownloadingDocument, applyLeaveRequest } = employeeSlice.actions;

export const useEmployeeStore = (selectorFn) => {
  const dispatch = useDispatch();
  const employeeState = useSelector((s) => s.employee);

  const actionsAndState = useMemo(() => {
    return {
      ...employeeState,

      fetchEmployeeData: async () => {
        try {
          const taskList = await DatabaseService.getTasks();
          dispatch(setTasks(taskList));
        } catch (err) {
          console.error('Failed to sync employee tasks:', err);
        }
      },

      updateTaskStatus: (taskId, newStatus) => {
        const updated = employeeState.tasks.map(t => {
          if (t.id === taskId) {
            let prog = t.progress;
            if (newStatus === 'Completed') prog = 100;
            else if (newStatus === 'To Do') prog = 0;
            return { ...t, status: newStatus, progress: prog };
          }
          return t;
        });
        dispatch(setTasks(updated));
        localStorage.setItem('worksphere_tasks', JSON.stringify(updated));
      },

      incrementTaskProgress: (taskId) => {
        const updated = employeeState.tasks.map(t => {
          if (t.id === taskId) {
            const nextProg = Math.min(t.progress + 10, 100);
            const nextStatus = nextProg === 100 ? 'Completed' : 'In Progress';
            return { ...t, progress: nextProg, status: nextStatus };
          }
          return t;
        });
        dispatch(setTasks(updated));
        localStorage.setItem('worksphere_tasks', JSON.stringify(updated));
      },

      handleDocumentDownload: (docName, triggerToast) => {
        dispatch(setDownloadingDocument(docName));
        setTimeout(() => {
          dispatch(setDownloadingDocument(null));
          if (triggerToast) triggerToast(`Completed secure download of ${docName}`);
        }, 1500);
      },

      applyLeave: (leaveRequest, triggerToast) => {
        dispatch(applyLeaveRequest(leaveRequest));
        if (triggerToast) triggerToast('Leave request submitted successfully for approval.');
      }
    };
  }, [employeeState, dispatch]);

  if (typeof selectorFn === 'function') {
    return selectorFn(actionsAndState);
  }
  return actionsAndState;
};

export default employeeSlice.reducer;
