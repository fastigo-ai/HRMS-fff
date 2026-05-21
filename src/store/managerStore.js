import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import { DatabaseService } from '../services/api';

const initialState = {
  stats: null,
  projects: [],
  team: [],
  timesheets: [],
  tasks: [],
  loading: false,
};

const managerSlice = createSlice({
  name: 'manager',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPMData: (state, action) => {
      state.stats = action.payload.stats;
      state.projects = action.payload.projects;
      state.team = action.payload.team;
      state.timesheets = action.payload.timesheets;
      state.tasks = action.payload.tasks;
    },
    setTeam: (state, action) => {
      state.team = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setTimesheets: (state, action) => {
      state.timesheets = action.payload;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    }
  }
});

export const { setLoading, setPMData, setTeam, setStats, setTimesheets, setTasks } = managerSlice.actions;

export const useManagerStore = (selectorFn) => {
  const dispatch = useDispatch();
  const managerState = useSelector((s) => s.manager);

  const actionsAndState = useMemo(() => {
    return {
      ...managerState,

      fetchPMData: async () => {
        dispatch(setLoading(true));
        try {
          const stats = await DatabaseService.getManagerDashboardStats();
          const projects = await DatabaseService.getManagerProjects();
          const team = await DatabaseService.getManagerTeam();
          const timesheets = await DatabaseService.getManagerTimesheets();
          const tasks = await DatabaseService.getManagerTasks();
          
          dispatch(setPMData({ stats, projects, team, timesheets, tasks }));
          dispatch(setLoading(false));
        } catch (err) {
          console.error('Failed to sync PM dataset:', err);
          dispatch(setLoading(false));
        }
      },

      reallocateResource: async (developerId, newCapacity, triggerToast) => {
        try {
          const updatedTeam = await DatabaseService.reallocateResource(developerId, newCapacity);
          dispatch(setTeam(updatedTeam));
          const stats = await DatabaseService.getManagerDashboardStats();
          dispatch(setStats(stats));
          if (triggerToast) triggerToast('Resource capacity allocation updated in database.');
        } catch (err) {
          console.error('Failed to reallocate capacity:', err);
        }
      },

      resolveTimesheet: async (timesheetId, action, triggerToast) => {
        try {
          const updatedTimesheets = await DatabaseService.resolveTimesheet(timesheetId, action);
          dispatch(setTimesheets(updatedTimesheets));
          const stats = await DatabaseService.getManagerDashboardStats();
          dispatch(setStats(stats));
          if (triggerToast) triggerToast(`Timesheet card successfully ${action}ed!`);
        } catch (err) {
          console.error('Failed to resolve timesheet status:', err);
        }
      },

      updateTaskStatus: async (taskId, newStatus, triggerToast) => {
        try {
          const updatedTasks = await DatabaseService.updateManagerTaskStatus(taskId, newStatus);
          dispatch(setTasks(updatedTasks));
          if (triggerToast) triggerToast(`Kanban task advanced to ${newStatus}`);
        } catch (err) {
          console.error('Failed to advance Kanban task status:', err);
        }
      },

      addManagerTask: async (taskDetails, triggerToast) => {
        try {
          const updatedTasks = await DatabaseService.addManagerTask(taskDetails);
          dispatch(setTasks(updatedTasks));
          if (triggerToast) triggerToast('New agile sprint task successfully assigned!');
        } catch (err) {
          console.error('Failed to assign sprint deliverable:', err);
        }
      }
    };
  }, [managerState, dispatch]);

  if (typeof selectorFn === 'function') {
    return selectorFn(actionsAndState);
  }
  return actionsAndState;
};

export default managerSlice.reducer;
