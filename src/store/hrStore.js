import { createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { DatabaseService } from '../services/api';

const initialState = {
  hrEmployees: [],
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
    },
    setHrEmployees: (state, action) => {
      state.hrEmployees = action.payload;
    },
    updateEmployeeInState: (state, action) => {
      state.hrEmployees = state.hrEmployees.map(emp => 
        emp.id === action.payload.id ? action.payload : emp
      );
    },
    removeEmployeeFromState: (state, action) => {
      state.hrEmployees = state.hrEmployees.filter(emp => emp.id !== action.payload);
    }
  }
});

export const { setPendingLeaves, insertEmployee, setHrEmployees, updateEmployeeInState, removeEmployeeFromState } = hrSlice.actions;

const determineRoleEnum = (title) => {
  const t = (title || "").toLowerCase();
  if (t.includes("hr") || t.includes("admin") || t.includes("people") || t.includes("coordinator")) {
    return "hr_admin";
  }
  if (t.includes("manager") || t.includes("lead") || t.includes("director") || t.includes("vp") || t.includes("head") || t.includes("pm") || t.includes("president")) {
    return "manager";
  }
  return "standard_employee";
};

export const useHrStore = (selectorFn) => {
  const dispatch = useDispatch();
  const hrState = useSelector((s) => s.hr);

  const fetchHREmployees = useCallback(async () => {
    try {
      const employees = await DatabaseService.getHREmployees();
      const mapped = employees.map(emp => ({
        id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.position || emp.role,
        dept: emp.department,
        status: "Active",
        location: emp.address ? "HQ Austin" : "Remote",
        avatar: emp.avatar || (emp.role === 'hr_admin'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64'
          : (emp.role === 'manager'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64'
            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64')),
        phone: emp.phone,
        address: emp.address,
        skills: emp.skills,
        empId: emp.empId,
        bankDetails: emp.bankDetails,
        joiningSalary: emp.joiningSalary || emp.bankDetails?.joiningSalary || "N/A",
        location: emp.location || (emp.address ? "HQ Austin" : "Remote"),
        gender: emp.gender || "male",
        prevCompany: emp.prevCompany || "N/A",
        prevDesignation: emp.prevDesignation || "N/A",
        prevDuration: emp.prevDuration || "N/A",
        prevCtc: emp.prevCtc || "N/A",
        prevRelievingDoc: emp.prevRelievingDoc || null,
        prevSalarySlip: emp.prevSalarySlip || null,
        aadhaarNumber: emp.aadhaarNumber || '',
        aadhaarCardDoc: emp.aadhaarCardDoc || null,
        panCardDoc: emp.panCardDoc || null
      }));
      dispatch(setHrEmployees(mapped));
    } catch (err) {
      console.error("Failed to load employees in Redux:", err);
    }
  }, [dispatch]);

  const actionsAndState = useMemo(() => {
    return {
      ...hrState,

      fetchHREmployees,

      resolveLeaveRequest: (id, decision, triggerToast) => {
        const updated = hrState.hrPendingLeaves.filter(req => req.id !== id);
        dispatch(setPendingLeaves(updated));
        if (triggerToast) {
          triggerToast(`Leave request #${id} has been successfully ${decision.toLowerCase()}ed.`);
        }
      },

      addEmployee: async (employee, triggerToast) => {
        try {
          // Normalize matching field names for backend model
          const normalizedEmployee = {
            name: employee.name,
            email: employee.email,
            password: employee.password,
            role: determineRoleEnum(employee.role),
            position: employee.role, // Corporate Title
            department: employee.dept || employee.department,
            phone: employee.phone,
            address: employee.address,
            skills: Array.isArray(employee.skills) ? employee.skills : (employee.skills ? employee.skills.split(",") : []),
            bankDetails: {
              bankName: employee.bankName,
              accountNo: employee.accountNo,
              panNumber: employee.panNumber,
              ifscCode: employee.ifscCode
            },
            location: employee.location || "HQ Austin",
            gender: employee.gender || "male",
            prevCompany: employee.prevCompany || "N/A",
            prevDesignation: employee.prevDesignation || "N/A",
            prevDuration: employee.prevDuration || "N/A",
            prevCtc: employee.prevCtc || "N/A",
            prevRelievingDoc: employee.prevRelievingDoc || null,
            prevSalarySlip: employee.prevSalarySlip || null,
            joiningSalary: employee.joiningSalary || "N/A",
            aadhaarNumber: employee.aadhaarNumber || '',
            aadhaarCardDoc: employee.aadhaarCardDoc || null,
            panCardDoc: employee.panCardDoc || null,
            avatar: employee.avatar || null
          };
 
          const result = await DatabaseService.addEmployee(normalizedEmployee);
          
          // Map backend User object fields back to UI state fields
          const dbEmp = result.data.employee;
          const mappedEmp = {
            id: dbEmp._id,
            name: dbEmp.name,
            email: dbEmp.email,
            role: dbEmp.position || dbEmp.role,
            dept: dbEmp.department,
            status: "Active",
            location: dbEmp.location || (dbEmp.address ? "HQ Austin" : "Remote"),
            avatar: dbEmp.avatar || (employee.gender === 'female'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64'
              : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64'),
            phone: dbEmp.phone,
            address: dbEmp.address,
            skills: dbEmp.skills,
            empId: dbEmp.empId,
            bankDetails: dbEmp.bankDetails,
            joiningSalary: dbEmp.joiningSalary || "N/A",
            gender: dbEmp.gender || "male",
            prevCompany: dbEmp.prevCompany || "N/A",
            prevDesignation: dbEmp.prevDesignation || "N/A",
            prevDuration: dbEmp.prevDuration || "N/A",
            prevCtc: dbEmp.prevCtc || "N/A",
            prevRelievingDoc: dbEmp.prevRelievingDoc || null,
            prevSalarySlip: dbEmp.prevSalarySlip || null,
            aadhaarNumber: dbEmp.aadhaarNumber || '',
            aadhaarCardDoc: dbEmp.aadhaarCardDoc || null,
            panCardDoc: dbEmp.panCardDoc || null
          };

          dispatch(insertEmployee(mappedEmp));
          if (triggerToast) triggerToast(`Employee profile for ${employee.name} created successfully!`);
        } catch (err) {
          console.error("Failed to add employee:", err);
          if (triggerToast) triggerToast(err.message || "Failed to save employee to database.", "error");
        }
      },

      editEmployee: async (id, employee, triggerToast) => {
        try {
          const normalizedEmployee = {
            name: employee.name,
            email: employee.email,
            password: employee.password,
            role: determineRoleEnum(employee.role),
            position: employee.role, // Corporate Title
            department: employee.dept || employee.department,
            phone: employee.phone,
            address: employee.address,
            skills: Array.isArray(employee.skills) ? employee.skills : (employee.skills ? employee.skills.split(",").map(s => s.trim()) : []),
            bankDetails: {
              bankName: employee.bankName,
              accountNo: employee.accountNo,
              panNumber: employee.panNumber,
              ifscCode: employee.ifscCode
            },
            location: employee.location || "HQ Austin",
            gender: employee.gender || "male",
            prevCompany: employee.prevCompany || "N/A",
            prevDesignation: employee.prevDesignation || "N/A",
            prevDuration: employee.prevDuration || "N/A",
            prevCtc: employee.prevCtc || "N/A",
            prevRelievingDoc: employee.prevRelievingDoc || null,
            prevSalarySlip: employee.prevSalarySlip || null,
            joiningSalary: employee.joiningSalary || "N/A",
            aadhaarNumber: employee.aadhaarNumber || '',
            aadhaarCardDoc: employee.aadhaarCardDoc || null,
            panCardDoc: employee.panCardDoc || null,
            avatar: employee.avatar || null
          };
 
          const result = await DatabaseService.updateEmployee(id, normalizedEmployee);
          
          const dbEmp = result.data.employee;
          const mappedEmp = {
            id: dbEmp._id,
            name: dbEmp.name,
            email: dbEmp.email,
            role: dbEmp.position || dbEmp.role,
            dept: dbEmp.department,
            status: "Active",
            location: dbEmp.location || (dbEmp.address ? "HQ Austin" : "Remote"),
            avatar: dbEmp.avatar || (employee.gender === 'female'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64'
              : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64'),
            phone: dbEmp.phone,
            address: dbEmp.address,
            skills: dbEmp.skills,
            empId: dbEmp.empId,
            bankDetails: dbEmp.bankDetails,
            joiningSalary: dbEmp.joiningSalary || "N/A",
            gender: dbEmp.gender || "male",
            prevCompany: dbEmp.prevCompany || "N/A",
            prevDesignation: dbEmp.prevDesignation || "N/A",
            prevDuration: dbEmp.prevDuration || "N/A",
            prevCtc: dbEmp.prevCtc || "N/A",
            prevRelievingDoc: dbEmp.prevRelievingDoc || null,
            prevSalarySlip: dbEmp.prevSalarySlip || null,
            aadhaarNumber: dbEmp.aadhaarNumber || '',
            aadhaarCardDoc: dbEmp.aadhaarCardDoc || null,
            panCardDoc: dbEmp.panCardDoc || null
          };

          dispatch(updateEmployeeInState(mappedEmp));
          if (triggerToast) triggerToast(`Employee profile for ${employee.name} updated successfully!`);
        } catch (err) {
          console.error("Failed to update employee:", err);
          if (triggerToast) triggerToast(err.message || "Failed to save updates to database.", "error");
        }
      },

      deleteEmployee: async (id, triggerToast) => {
        try {
          await DatabaseService.deleteEmployee(id);
          dispatch(removeEmployeeFromState(id));
          if (triggerToast) triggerToast("Employee profile removed successfully!");
        } catch (err) {
          console.error("Failed to delete employee:", err);
          if (triggerToast) triggerToast(err.message || "Failed to remove employee from database.", "error");
        }
      }
    };
  }, [hrState, dispatch, fetchHREmployees]);

  if (typeof selectorFn === 'function') {
    return selectorFn(actionsAndState);
  }
  return actionsAndState;
};

export default hrSlice.reducer;
