import React, { useState, useEffect } from 'react';
import Modal from '../../shared/ui/Modal';
import { DatabaseService } from '../../services/api';

export default function ManageAttendanceModal({
  isOpen,
  onClose,
  editRecord,
  employees,
  triggerToast,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    date: '',
    clockInTime: '',
    clockOutTime: '',
    status: 'Present',
    mode: 'Office',
    location: 'Headquarters',
    isLate: false
  });

  useEffect(() => {
    if (editRecord && isOpen) {
      // Parse clockIn and clockOut dates
      const clockInDate = editRecord.clockIn ? new Date(editRecord.clockIn) : null;
      const clockOutDate = editRecord.clockOut ? new Date(editRecord.clockOut) : null;
      
      const formatTime = (d) => {
        if (!d) return '';
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      };

      setFormData({
        employee: typeof editRecord.employee === 'object' ? editRecord.employee._id : editRecord.employee,
        date: editRecord.date || '',
        clockInTime: formatTime(clockInDate),
        clockOutTime: formatTime(clockOutDate),
        status: editRecord.status || 'Present',
        mode: editRecord.mode || 'Office',
        location: editRecord.location || 'Headquarters',
        isLate: editRecord.isLate || false
      });
    } else {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      setFormData({
        employee: employees.length > 0 ? employees[0]._id : '',
        date: todayStr,
        clockInTime: '09:00',
        clockOutTime: '17:00',
        status: 'Present',
        mode: 'Office',
        location: 'Headquarters',
        isLate: false
      });
    }
  }, [editRecord, isOpen, employees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Construct date objects
      const clockInStr = formData.clockInTime ? `${formData.date}T${formData.clockInTime}:00` : null;
      const clockOutStr = formData.clockOutTime ? `${formData.date}T${formData.clockOutTime}:00` : null;

      const payload = {
        ...formData,
        clockIn: clockInStr ? new Date(clockInStr).toISOString() : undefined,
        clockOut: clockOutStr ? new Date(clockOutStr).toISOString() : undefined,
      };

      if (editRecord) {
        await DatabaseService.updateAttendance(editRecord._id, payload);
        triggerToast('Attendance record updated successfully');
      } else {
        await DatabaseService.createAttendance(payload);
        triggerToast('Attendance record created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      triggerToast(err.message || 'Error saving attendance record', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editRecord ? 'Edit Attendance Record' : 'Create Attendance Record'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Employee</label>
            <select
              required
              disabled={!!editRecord} // Usually shouldn't change employee on edit
              value={formData.employee}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
            <input
              type="date"
              required
              disabled={!!editRecord} // Usually shouldn't change date on edit
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clock In Time</label>
            <input
              type="time"
              required
              value={formData.clockInTime}
              onChange={(e) => setFormData({ ...formData, clockInTime: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clock Out Time</label>
            <input
              type="time"
              value={formData.clockOutTime}
              onChange={(e) => setFormData({ ...formData, clockOutTime: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
              <option value="WFH">WFH</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mode</label>
            <select
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Office">Office</option>
              <option value="WFH">WFH</option>
              <option value="Field">Field</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="space-y-1 flex items-center h-full pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isLate}
                onChange={(e) => setFormData({ ...formData, isLate: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Flag as Late</span>
            </label>
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
