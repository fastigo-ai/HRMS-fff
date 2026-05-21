import React from 'react';
import { IndianRupee, Download, CreditCard, CheckCircle2 } from 'lucide-react';
import DataTable from '../../shared/ui/DataTable';
import StatusBadge from '../../shared/ui/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';

export default function Payroll({ triggerToast }) {
  const payrollBatches = [
    { id: 1, name: 'Batch #882', dept: 'All Departments', capital: '₹4.82 Cr', status: 'Disbursed' },
    { id: 2, name: 'Batch #883 (Ad-hoc bonus)', dept: 'Engineering & Growth', capital: '₹44.5 L', status: 'Pending Approval' }
  ];

  const columns = [
    { header: 'Batch Identifier', field: 'name', className: 'font-bold text-slate-850 dark:text-white' },
    { header: 'Organizational Sector', field: 'dept', className: 'font-semibold text-slate-500' },
    { header: 'Capital Disbursed', field: 'capital', className: 'font-extrabold text-violet-650' },
    {
      header: 'Authorization Status',
      field: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      header: 'Actions',
      field: 'id',
      className: 'text-right',
      render: (id, row) => (
        <button 
          onClick={() => triggerToast(row.status === 'Disbursed' ? 'Receipt exported to file system' : 'Salary bonus authorized successfully')}
          className="px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-600 text-[10px] font-bold rounded-lg transition"
        >
          {row.status === 'Disbursed' ? 'Download Audit' : 'Authorize'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Corporate Payroll Central" 
        description="Monitor monthly disbursements, authorize department bonus batches, and export compliance sheets."
        action={
          <button 
            onClick={() => triggerToast('Direct bulk disbursements successfully synchronized')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-750 rounded-xl transition shadow"
          >
            Execute Bulk Disbursement
          </button>
        }
      />

      <div className="glass-panel p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Disbursement Logs Matrix</h3>
        <DataTable columns={columns} data={payrollBatches} />
      </div>
    </div>
  );
}
