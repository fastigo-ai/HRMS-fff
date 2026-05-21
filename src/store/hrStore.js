import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';

const initialState = {
  hrEmployees: [
    { id: 1, name: 'Sarah Wu', role: 'Head of Engineering', dept: 'Engineering', status: 'Active', location: 'HQ Austin', email: 'sarah.wu@worksphere.io', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64' },
    { id: 2, name: 'Julian Day', role: 'Design Director', dept: 'Experience Design', status: 'Active', location: 'HQ Austin', email: 'julian.day@worksphere.io', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64' },
    { id: 3, name: 'Elena Rodriguez', role: 'VP Growth', dept: 'Marketing', status: 'On Leave', location: 'Remote', email: 'elena.r@worksphere.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64' },
    { id: 4, name: 'Marcus Thorne', role: 'Senior Lead Dev', dept: 'Engineering', status: 'Active', location: 'HQ Austin', email: 'marcus.t@worksphere.io', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64' }
  ],
  hrPendingLeaves: [
    { id: 101, name: 'Marcus Thorne', dept: 'Engineering', type: 'Annual Leave', dates: 'Oct 24 - Oct 28 (5 days)', reason: 'Family trip', status: 'Pending' },
    { id: 102, name: 'Elena Rodriguez', dept: 'Marketing', type: 'Sick Leave', dates: 'Oct 25 (1 day)', reason: 'Dental appointment', status: 'Pending' }
  ],
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    setPendingLeaves: (state, action) => {
      state.hrPendingLeaves = action.payload;
    },
    insertEmployee: (state, action) => {
      state.hrEmployees = [...state.hrEmployees, action.payload];
    }
  }
});

export const { setPendingLeaves, insertEmployee } = hrSlice.actions;

export const useHrStore = (selectorFn) => {
  const dispatch = useDispatch();
  const hrState = useSelector((s) => s.hr);

  const actionsAndState = useMemo(() => {
    return {
      ...hrState,

      resolveLeaveRequest: (id, decision, triggerToast) => {
        const updated = hrState.hrPendingLeaves.filter(req => req.id !== id);
        dispatch(setPendingLeaves(updated));
        if (triggerToast) {
          triggerToast(`Leave request #${id} has been successfully ${decision.toLowerCase()}ed.`);
        }
      },

      addEmployee: (employee, triggerToast) => {
        const newEmp = {
          id: Date.now(),
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64&h=64',
          ...employee
        };
        dispatch(insertEmployee(newEmp));
        if (triggerToast) triggerToast(`Employee profile for ${employee.name} created!`);
      }
    };
  }, [hrState, dispatch]);

  if (typeof selectorFn === 'function') {
    return selectorFn(actionsAndState);
  }
  return actionsAndState;
};

export default hrSlice.reducer;
