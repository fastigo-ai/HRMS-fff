import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useHrStore } from '../../store/hrStore';
import { useUiStore } from '../../store/uiStore';
import DataTable from '../../shared/ui/DataTable';
import StatusBadge from '../../shared/ui/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';
import SearchBar from '../../shared/ui/SearchBar';
import Modal from '../../shared/ui/Modal';

export default function EmployeesPage() {
  const { hrEmployees, addEmployee } = useHrStore();
  const { triggerToast } = useUiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', dept: 'Engineering', email: '', location: 'HQ Austin' });

  const filtered = hrEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || emp.dept === filterDept;
    return matchesSearch && matchesDept;
  });

  const columns = [
    {
      header: 'Employee Profile',
      field: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt={val} className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/10" />
          <div>
            <p className="font-bold text-slate-850 dark:text-white leading-tight">{val}</p>
            <p className="text-[10px] text-slate-400 font-medium">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Organizational Role', field: 'role', className: 'font-semibold text-slate-500' },
    { header: 'Department', field: 'dept', className: 'font-bold text-slate-650' },
    {
      header: 'Current Status',
      field: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    { header: 'Assigned Hub', field: 'location', className: 'font-semibold text-slate-550' },
    {
      header: 'Actions',
      field: 'id',
      className: 'text-right',
      render: (id, row) => (
        <button 
          onClick={() => triggerToast(`Managing direct params for ${row.name}`)}
          className="px-2.5 py-1 text-[10px] font-bold text-violet-650 hover:bg-violet-50 dark:hover:bg-slate-900 rounded-lg transition"
        >
          Manage
        </button>
      )
    }
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.role || !newEmp.email) {
      triggerToast('Please supply name, role and contact email registers.', 'error');
      return;
    }
    addEmployee(newEmp, triggerToast);
    setIsModalOpen(false);
    setNewEmp({ name: '', role: '', dept: 'Engineering', email: '', location: 'HQ Austin' });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employee Roster Registry" 
        description="Oversee and manage organizational positions, contact emails, and office locations."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition-all shadow-md shadow-violet-600/10 hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Filter employee databases by name, role, email..." 
          className="flex-1"
        />
        
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-hidden text-slate-500"
          >
            <option value="All">All Sectors</option>
            <option value="Engineering">Engineering</option>
            <option value="Experience Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Executive Management">Management</option>
          </select>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        emptyMessage="No employees found matching the filter query." 
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Staff Member">
        <form onSubmit={handleAdd} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block mb-1 text-slate-500">Full Name</label>
            <input 
              type="text" 
              required
              value={newEmp.name}
              onChange={e => setNewEmp({...newEmp, name: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-800 focus:outline-hidden"
              placeholder="e.g. Samuel Davis"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-slate-500">Corporate Title</label>
              <input 
                type="text" 
                required
                value={newEmp.role}
                onChange={e => setNewEmp({...newEmp, role: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-800 focus:outline-hidden"
                placeholder="e.g. Lead Designer"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-500">Vertical Department</label>
              <select 
                value={newEmp.dept}
                onChange={e => setNewEmp({...newEmp, dept: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-500 focus:outline-hidden"
              >
                <option value="Engineering">Engineering</option>
                <option value="Experience Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Executive Management">Management</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-1 text-slate-500">Work Email Address</label>
            <input 
              type="email" 
              required
              value={newEmp.email}
              onChange={e => setNewEmp({...newEmp, email: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-800"
              placeholder="e.g. samuel.d@worksphere.io"
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-500">Workspace Hub Location</label>
            <input 
              type="text" 
              value={newEmp.location}
              onChange={e => setNewEmp({...newEmp, location: e.target.value})}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl text-slate-800"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl shadow-md shadow-violet-600/10"
            >
              Confirm Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
