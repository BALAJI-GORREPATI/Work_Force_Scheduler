import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { LeaveRequest, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarOff, Search, Filter, Plus, CheckCircle2, 
  XCircle, Clock, X, ChevronLeft, ChevronRight, AlertCircle, ShieldAlert 
} from 'lucide-react';

export const LeavePage: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // New Request Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    start_date: '2026-02-01',
    end_date: '2026-02-05',
    leave_type: 'ANNUAL' as const,
    reason: 'Planned vacation and personal downtime.'
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [lves, emps] = await Promise.all([
          dataService.getLeaveRequests(),
          dataService.getEmployees(),
        ]);
        setLeaves(lves);
        setEmployees(emps);
      } catch (err) {
        console.error('Error loading leaves:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const empMap = useMemo(() => new Map(employees.map(e => [e.employee_id, e])), [employees]);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      if (search) {
        const q = search.toLowerCase();
        const emp = empMap.get(l.employee_id);
        const matchesQuery = 
          l.leave_id.toLowerCase().includes(q) ||
          l.employee_id.toLowerCase().includes(q) ||
          emp?.first_name.toLowerCase().includes(q) ||
          emp?.last_name.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (selectedStatus && l.status !== selectedStatus) return false;
      if (selectedType && l.leave_type !== selectedType) return false;
      return true;
    });
  }, [leaves, search, selectedStatus, selectedType, empMap]);

  const totalPages = Math.ceil(filteredLeaves.length / pageSize) || 1;
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeaves.slice(start, start + pageSize);
  }, [filteredLeaves, currentPage, pageSize]);

  // Handle Submit
  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(newLeave.end_date) < new Date(newLeave.start_date)) {
      setErrorMsg('End date must be on or after start date.');
      return;
    }
    setErrorMsg('');
    try {
      const created = await dataService.submitLeaveRequest({
        employee_id: currentUser.employee_id,
        start_date: newLeave.start_date,
        end_date: newLeave.end_date,
        leave_type: newLeave.leave_type,
        reason: newLeave.reason,
      });
      setLeaves([created, ...leaves]);
      setShowSubmitModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit leave.');
    }
  };

  // Handle Decision
  const handleDecision = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await dataService.updateLeaveStatus(
        leaveId, 
        status, 
        currentUser.employee_id, 
        `${status === 'APPROVED' ? 'Approved' : 'Rejected'} by manager ${currentUser.name}.`
      );
      // Update local state
      setLeaves(leaves.map(l => {
        if (l.leave_id === leaveId) {
          return {
            ...l,
            status,
            approver_employee_id: currentUser.employee_id,
            decision_timestamp: new Date().toISOString()
          };
        }
        return l;
      }));
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CANCELLED: 'bg-slate-700 text-slate-300'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isManagerOrAdmin = hasRole(['MANAGER', 'ADMIN', 'HR_PARTNER']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-indigo-400" />
            <span>Leave Requests &amp; Approvals</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {leaves.length.toLocaleString()} Total Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track, request, and approve employee time-off requests with self-approval guards.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Leave Request</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by leave ID or employee name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses (Pending, Approved, Rejected)</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          value={selectedType}
          onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Leave Types</option>
          <option value="ANNUAL">ANNUAL</option>
          <option value="SICK">SICK</option>
          <option value="PARENTAL">PARENTAL</option>
          <option value="UNPAID">UNPAID</option>
          <option value="STUDY">STUDY</option>
        </select>
      </div>

      {/* Leave Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Leave ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approver</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedLeaves.length > 0 ? (
                paginatedLeaves.map(lve => {
                  const emp = empMap.get(lve.employee_id);
                  const isOwnRequest = lve.employee_id === currentUser.employee_id;

                  return (
                    <tr key={lve.leave_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                        {lve.leave_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{emp?.first_name} {emp?.last_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{lve.employee_id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                          {lve.leave_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {lve.start_date} &rarr; {lve.end_date}
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate text-slate-400" title={lve.reason || ''}>
                        {lve.reason || 'None provided'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] border ${statusColors[lve.status]}`}>
                          {lve.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {lve.approver_employee_id || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {lve.status === 'PENDING' && isManagerOrAdmin && (
                          <div className="flex items-center justify-end gap-1.5">
                            {isOwnRequest ? (
                              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1" title="Self-approval prohibited">
                                <ShieldAlert className="w-3.5 h-3.5" /> Self-Lock
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleDecision(lve.leave_id, 'APPROVED')}
                                  className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDecision(lve.leave_id, 'REJECTED')}
                                  className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-[10px] font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(filteredLeaves.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-white">{filteredLeaves.length.toLocaleString()}</strong> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 border border-slate-700 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 border border-slate-700 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Leave Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Submit Leave Request</h2>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Requesting Employee</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.employee_id})`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    min="2026-01-01"
                    max="2026-03-31"
                    value={newLeave.start_date}
                    onChange={e => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    min="2026-01-01"
                    max="2026-03-31"
                    value={newLeave.end_date}
                    onChange={e => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Leave Category</label>
                <select
                  value={newLeave.leave_type}
                  onChange={e => setNewLeave({ ...newLeave, leave_type: e.target.value as any })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANNUAL">ANNUAL</option>
                  <option value="SICK">SICK</option>
                  <option value="PARENTAL">PARENTAL</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="STUDY">STUDY</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Justification / Reason</label>
                <textarea
                  rows={3}
                  required
                  value={newLeave.reason}
                  onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

