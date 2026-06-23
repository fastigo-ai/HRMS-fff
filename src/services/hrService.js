import { delay, getCached, setCached, authenticatedFetch, API_BASE_URL } from './apiClient';
import { initialAnomalies } from '../data/attendanceData';
import { initialLeaveRequests, initialLeavePolicies, initialTeamCalendarStatus } from '../data/leavesData';
import { initialDepartments } from '../data/departmentsData';
import { initialCandidates, initialSourcingChannels, initialInterviews } from '../data/recruitmentData';

export const hrService = {
  getHREmployees: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/employees`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch employees");
      }
      return data.data.employees || [];
    } catch (err) {
      console.error("Failed to fetch employees from backend:", err);
      return [];
    }
  },

  getHRAttendanceLogsAll: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/attendance`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch all attendance logs");
      }
      return data.data.logs || [];
    } catch (err) {
      console.error("Failed to fetch all attendance logs:", err);
      return [];
    }
  },

  getHRDashboardStats: async () => {
    const employees = await hrService.getHREmployees();
    const attendanceLogs = await hrService.getHRAttendanceLogsAll();

    let allLeaves = [];
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/leaves`);
      const data = await res.json();
      if (res.ok) {
        allLeaves = data.data.leaves || [];
      }
    } catch (e) {
      console.error("Failed to fetch leaves for dashboard stats:", e);
    }

    const now = new Date();
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const totalEmployees = employees.length || 0;

    const presentToday = attendanceLogs.filter(log => {
      if (!log.date) return false;
      // log.date is stored as 'YYYY-MM-DD' string — compare directly, no new Date() wrapping
      return log.date === todayDateStr;
    }).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const onLeaveToday = allLeaves.filter(req => {
      if (req.status !== "Approved") return false;
      const start = new Date(req.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.endDate);
      end.setHours(0, 0, 0, 0);
      return today >= start && today <= end;
    }).length;

    const activeToday = totalEmployees - onLeaveToday;
    const pendingLeaves = allLeaves.filter(req => req.status === "Pending").length;
    
    let openPositions = 8;
    try {
      const resMetrics = await authenticatedFetch(`${API_BASE_URL}/candidates/metrics`);
      const dataMetrics = await resMetrics.json();
      if (resMetrics.ok && dataMetrics.data && dataMetrics.data.openPositions !== undefined) {
        openPositions = dataMetrics.data.openPositions;
      }
    } catch (e) {
      console.error("Failed to compute dynamic open positions:", e);
    }

    let payrollSum = 0;
    employees.forEach(emp => {
      const sal = parseFloat(emp.joiningSalary) || parseFloat(emp.bankDetails?.joiningSalary) || 0;
      payrollSum += sal;
    });
    const monthlyPayroll = payrollSum > 0 ? `₹${(payrollSum / 100000).toFixed(2)}L` : '₹4.82 Cr';

    return {
      totalEmployees,
      activeToday,
      onLeaveToday,
      presentToday,
      pendingLeaves,
      openPositions,
      monthlyPayroll
    };
  },

  getHRDepartments: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/departments`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch departments");
      }
      return data.data.departments || [];
    } catch (err) {
      console.error("Failed to fetch departments from backend:", err);
      return [];
    }
  },

  addDepartment: async (dept) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/departments`, {
        method: "POST",
        body: JSON.stringify(dept)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create department");
      }
      return await hrService.getHRDepartments();
    } catch (err) {
      console.error("Failed to create department on backend:", err);
      throw err;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/departments/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete department");
      }
      return await hrService.getHRDepartments();
    } catch (err) {
      console.error("Failed to delete department on backend:", err);
      throw err;
    }
  },

  updateDepartment: async (id, dept) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/departments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dept)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update department");
      }
      return await hrService.getHRDepartments();
    } catch (err) {
      console.error("Failed to update department on backend:", err);
      throw err;
    }
  },

  getHRAttendanceLogs: async () => {
    const logs = await hrService.getHRAttendanceLogsAll();
    const employees = await hrService.getHREmployees();

    const nowHR = new Date();
    const todayDateStr = `${nowHR.getFullYear()}-${String(nowHR.getMonth() + 1).padStart(2, '0')}-${String(nowHR.getDate()).padStart(2, '0')}`;

    const records = logs.map(log => {
      const emp = log.employee || {};
      
      const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      };

      const timeIn = log.clockIn ? formatTime(log.clockIn) : '--:--';
      const timeOut = log.clockOut ? formatTime(log.clockOut) : 'Active now';

      return {
        id: log._id,
        name: emp.name || 'Unknown',
        role: emp.position || emp.role || 'Employee',
        timeIn,
        timeOut,
        mode: log.mode || 'Office',
        status: log.status || 'Present',
        coords: log.location || 'Headquarters'
      };
    });

    // log.date is stored as 'YYYY-MM-DD' string — compare directly to avoid timezone shifts
    const todayLogs = logs.filter(log => log.date && log.date === todayDateStr);

    const presentToday = todayLogs.length;
    const lateToday = todayLogs.filter(log => log.status === "Late").length;
    // Backend stores WFH mode as 'WFH' (not 'Remote')
    const wfhToday = todayLogs.filter(log => log.mode === "WFH").length;
    const totalEmployees = employees.length || 1;
    const complianceRate = (presentToday / totalEmployees) * 100;

    // Calculate Monthly Heatmap Cells dynamically
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Group logs by date
    const logsByDate = {};
    logs.forEach(log => {
      if (log.date) {
        logsByDate[log.date] = (logsByDate[log.date] || 0) + 1;
      }
    });

    const cells = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const presentCount = logsByDate[dayStr] || 0;
      const rate = Math.round((presentCount / totalEmployees) * 100);
      
      let status = 'none';
      if (rate >= 90) status = 'high';
      else if (rate >= 70) status = 'mid';
      else if (rate > 0) status = 'low';
      
      cells.push({
        day: d,
        val: rate,
        status: status
      });
    }

    return {
      cells,
      anomalies: getCached('hr_anomalies', initialAnomalies),
      records,
      stats: {
        presentToday,
        lateToday,
        wfhToday,
        complianceRate,
        totalEmployees
      }
    };
  },

  resolveAnomaly: async (id) => {
    await delay(200);
    const current = getCached('hr_anomalies', initialAnomalies);
    const updated = current.filter(a => a.id !== id);
    setCached('hr_anomalies', updated);
    return updated;
  },

  getHRLeaves: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/leaves`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch leaves from DB");
      }
      
      const dbLeaves = data.data.leaves || [];
      const pendingLeaves = dbLeaves.filter(req => req.status === "Pending");
      
      const requests = pendingLeaves.map(req => {
        const emp = req.employee || {};
        
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
        if (req.type === 'Sick Leave') badgeColor = 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/60';
        else if (req.type === 'Casual Leave') badgeColor = 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:border-sky-900/60';
        else if (req.type === 'Paid Leave') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/60';
        
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        const dates = `${formatDate(req.startDate)} - ${formatDate(req.endDate)} (${req.totalDays} day${req.totalDays > 1 ? 's' : ''})`;

        return {
          id: req._id,
          name: emp.name || 'Unknown Employee',
          role: `${emp.position || 'Specialist'} • ${emp.department || 'Operations'}`,
          avatar: `https://images.unsplash.com/photo-${emp.role === 'manager' ? '1507003211169-0a1dd7228f2d' : '1500648767791-00dcc994a43e'}?auto=format&fit=crop&q=80&w=64&h=64`,
          type: req.type,
          badgeColor,
          dates,
          reason: req.reason,
          status: req.status,
          isUrgent: req.totalDays > 3,
          daysRemaining: req.totalDays > 3 ? 'Urgent Priority' : 'Standard compliance'
        };
      });

      return {
        requests,
        policies: getCached('hr_policies', initialLeavePolicies),
        calendarStatus: initialTeamCalendarStatus
      };
    } catch (err) {
      console.error("Failed to fetch HR leaves from backend:", err);
      return {
        requests: getCached('hr_leaves', initialLeaveRequests),
        policies: getCached('hr_policies', initialLeavePolicies),
        calendarStatus: initialTeamCalendarStatus
      };
    }
  },

  resolveLeaveRequest: async (id, status) => {
    try {
      const backendStatus = status === 'approve' ? 'Approved' : 'Rejected';
      const res = await authenticatedFetch(`${API_BASE_URL}/leaves/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status: backendStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resolve leave request");
      }
      return data;
    } catch (err) {
      console.error("Failed to resolve leave request:", err);
      throw err;
    }
  },

  addLeavePolicy: async (policy) => {
    await delay(250);
    const current = getCached('hr_policies', initialLeavePolicies);
    const updated = [...current, { ...policy, id: Date.now() }];
    setCached('hr_policies', updated);
    return updated;
  },

  getHRRecruitment: async () => {
    try {
      const resCandidates = await authenticatedFetch(`${API_BASE_URL}/candidates`);
      const dataCandidates = await resCandidates.json();
      
      const resMetrics = await authenticatedFetch(`${API_BASE_URL}/candidates/metrics`);
      const dataMetrics = await resMetrics.json();

      return {
        candidates: dataCandidates.data?.candidates || [],
        metrics: dataMetrics.data || {
          openPositions: 0,
          totalCandidates: 0,
          activeCandidates: 0,
          avgTimeToHire: 18,
          sourcingChannels: []
        },
        interviews: initialInterviews
      };
    } catch (err) {
      console.error("Failed to fetch recruitment pipeline:", err);
      return {
        candidates: [],
        metrics: {
          openPositions: 0,
          totalCandidates: 0,
          activeCandidates: 0,
          avgTimeToHire: 18,
          sourcingChannels: []
        },
        interviews: initialInterviews
      };
    }
  },

  updateOpenPositions: async (count) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/candidates/metrics`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openPositions: count }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update open positions");
      }
      return data.data;
    } catch (err) {
      console.error("Failed to update open positions:", err);
      throw err;
    }
  },

  updateCandidateStage: async (id, nextStage) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/candidates/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update candidate stage");
      }
      return data.data.candidate;
    } catch (err) {
      console.error("Failed to update candidate stage:", err);
      throw err;
    }
  },

  

  addCandidate: async (candidate) => {
    try {
      let body;
      const hasFiles = Object.values(candidate).some(val => val instanceof File || val instanceof Blob);
      
      let headers = {};
      if (hasFiles) {
        const formData = new FormData();
        Object.keys(candidate).forEach(key => {
          if (candidate[key] !== undefined && candidate[key] !== null) {
            formData.append(key, candidate[key]);
          }
        });
        body = formData;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(candidate);
      }

      const res = await authenticatedFetch(`${API_BASE_URL}/candidates`, {
        method: "POST",
        headers,
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create candidate");
      }
      return data.data.candidate;
    } catch (err) {
      console.error("Failed to add candidate:", err);
      throw err;
    }
  },

  deleteCandidate: async (id) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/candidates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete candidate");
      }
      return true;
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      throw err;
    }
  },

  addEmployee: async (employee) => {
    try {
      let body;
      const hasFiles = Object.values(employee).some(val => val instanceof File || val instanceof Blob);
      
      if (hasFiles) {
        const formData = new FormData();
        Object.keys(employee).forEach(key => {
          if (employee[key] !== undefined && employee[key] !== null) {
            if (key === 'bankDetails' && typeof employee[key] === 'object') {
              formData.append(key, JSON.stringify(employee[key]));
            } else if (key === 'salaryBreakup' && typeof employee[key] === 'object') {
              formData.append(key, JSON.stringify(employee[key]));
            } else if (key === 'skills' && Array.isArray(employee[key])) {
              employee[key].forEach(s => formData.append('skills', s));
            } else {
              formData.append(key, employee[key]);
            }
          }
        });
        body = formData;
      } else {
        body = JSON.stringify(employee);
      }

      const res = await authenticatedFetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create employee");
      }
      return data;
    } catch (err) {
      console.error("Failed to add employee on backend:", err);
      throw err;
    }
  },

  updateEmployee: async (id, payload) => {
    try {
      let body;
      const hasFiles = Object.values(payload).some(val => val instanceof File || val instanceof Blob);
      
      if (hasFiles) {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
          if (payload[key] !== undefined && payload[key] !== null) {
            if (key === 'bankDetails' && typeof payload[key] === 'object') {
              formData.append(key, JSON.stringify(payload[key]));
            } else if (key === 'salaryBreakup' && typeof payload[key] === 'object') {
              formData.append(key, JSON.stringify(payload[key]));
            } else if (key === 'skills' && Array.isArray(payload[key])) {
              payload[key].forEach(s => formData.append('skills', s));
            } else {
              formData.append(key, payload[key]);
            }
          }
        });
        body = formData;
      } else {
        body = JSON.stringify(payload);
      }

      const res = await authenticatedFetch(`${API_BASE_URL}/employees/${id}`, {
        method: "PATCH",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update employee");
      }
      return data;
    } catch (err) {
      console.error("Failed to update employee on backend:", err);
      throw err;
    }
  },

  deleteEmployee: async (id) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/employees/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete employee");
      }
      return true;
    } catch (err) {
      console.error("Failed to delete employee on backend:", err);
      throw err;
    }
  },

  getHRPayrollAll: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/payroll/all`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch payroll list");
      }
      return data.data.payslips || [];
    } catch (err) {
      console.error("Failed to fetch corporate payroll:", err);
      return [];
    }
  },

  disbursePayslip: async (disbursalData) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/payroll/disburse`, {
        method: "POST",
        body: JSON.stringify(disbursalData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to disburse payslip");
      }
      return data.data.payslip;
    } catch (err) {
      console.error("Failed to disburse payslip on backend:", err);
      throw err;
    }
  },

  // Holidays Calendar Admin
  getHolidays: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/holidays`);
      const data = await res.json();
      return data.data.holidays || [];
    } catch (err) {
      console.error("Failed to fetch holidays:", err);
      return [];
    }
  },

  addHoliday: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/holidays`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.holiday;
    } catch (err) {
      console.error("Failed to add holiday:", err);
      throw err;
    }
  },

  deleteHoliday: async (id) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/holidays/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete holiday:", err);
      throw err;
    }
  },

  // WFH Approvals
  getWFHRequestsAll: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/wfh`);
      const data = await res.json();
      return data.data.requests || [];
    } catch (err) {
      console.error("Failed to fetch all WFH requests:", err);
      return [];
    }
  },

  resolveWFHRequest: async (id, status) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/wfh/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.wfh;
    } catch (err) {
      console.error("Failed to resolve WFH request:", err);
      throw err;
    }
  },

  // Overtime Approvals
  getOvertimeRequestsAll: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/overtime`);
      const data = await res.json();
      return data.data.requests || [];
    } catch (err) {
      console.error("Failed to fetch all Overtime requests:", err);
      return [];
    }
  },

  resolveOvertimeRequest: async (id, status) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/overtime/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.overtime;
    } catch (err) {
      console.error("Failed to resolve Overtime request:", err);
      throw err;
    }
  },

  // Resignations & Offboarding clearances
  getResignationsAll: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/resignations`);
      const data = await res.json();
      return data.data.resignations || [];
    } catch (err) {
      console.error("Failed to fetch resignations:", err);
      return [];
    }
  },

  resolveResignation: async (id, payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/resignations/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.resignation;
    } catch (err) {
      console.error("Failed to resolve resignation:", err);
      throw err;
    }
  },

  updateClearance: async (id, payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/resignations/${id}/clearance`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.resignation;
    } catch (err) {
      console.error("Failed to update clearance details:", err);
      throw err;
    }
  },

  // Onboarding pipeline verification
  getOnboardingsAll: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/onboarding`);
      const data = await res.json();
      return data.data.onboardings || [];
    } catch (err) {
      console.error("Failed to fetch all onboarding details:", err);
      return [];
    }
  },

  verifyOnboardingTask: async (id, payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/onboarding/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.onboarding;
    } catch (err) {
      console.error("Failed to verify onboarding task:", err);
      throw err;
    }
  },

  // Attendance Regularization approvals
  getRegularizationsAll: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/regularizations`);
      const data = await res.json();
      return data.data.requests || [];
    } catch (err) {
      console.error("Failed to fetch all regularizations:", err);
      return [];
    }
  },

  resolveRegularization: async (id, status) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/regularizations/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.regularization;
    } catch (err) {
      console.error("Failed to resolve regularization request:", err);
      throw err;
    }
  },

  // Career Promotions & Transfers
  promoteOrTransferEmployee: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/careers`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.error("Failed to process promotions/transfers career update:", err);
      throw err;
    }
  },

  getCareerHistory: async (employeeId) => {
    try {
      const url = employeeId ? `${API_BASE_URL}/careers/history?employeeId=${employeeId}` : `${API_BASE_URL}/careers/history`;
      const res = await authenticatedFetch(url);
      const data = await res.json();
      return data.data.history || [];
    } catch (err) {
      console.error("Failed to fetch career progression logs:", err);
      return [];
    }
  },

  // Dynamic Announcement system
  getAnnouncements: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/announcements`);
      const data = await res.json();
      return data.data.announcements || [];
    } catch (err) {
      console.error("Failed to fetch active announcements:", err);
      return [];
    }
  },

  createAnnouncement: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.announcement;
    } catch (err) {
      console.error("Failed to post new system announcement:", err);
      throw err;
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/announcements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      throw err;
    }
  },

  // Document letter generations templates & compilers
  getTemplates: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/documents/templates`);
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error("Failed to retrieve document templates:", err);
      return null;
    }
  },

  compileLetter: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/documents/compile`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.html;
    } catch (err) {
      console.error("Failed to generate dynamic letter contract:", err);
      throw err;
    }
  },

  getCompanyDetails: async () => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/company`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.company;
    } catch (err) {
      console.error("Failed to retrieve company details:", err);
      throw err;
    }
  },

  updateCompanyDetails: async (payload) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/company`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data.company;
    } catch (err) {
      console.error("Failed to update company details:", err);
      throw err;
    }
  }
};
