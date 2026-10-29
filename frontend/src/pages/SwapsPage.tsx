import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { SwapRequest, ShiftAssignment, Employee } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Repeat, Search, Plus, CheckCircle2, 
  XCircle, Clock, AlertCircle, X, ShieldCheck, ArrowRightLeft 
} from 'lucide-react';

export const SwapsPage: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Swap Form State
  const [newSwap, setNewSwap] = useState({
    original_assignment_id: '',
    target_employee_id: 'EMP-000002',
    reason: 'Mutual shift trade due to sprint demo.'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [swps, asgs, emps] = await Promise.all([
          dataService.getSwapRequests(),
          dataService.getShiftAssignments(),
          dataService.getEmployees(),
        ]);
        setSwaps(swps);
        setAssignments(asgs);
        setEmployees(emps);
        if (asgs.length > 0) {
          setNewSwap(s => ({ ...s, original_assignment_id: asgs[0].assignment_id }));
        }
      } catch (err) {
        console.error('Error loading swaps:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const empMap = useMemo(() => new Map(employees.map(e => [e.employee_id, e])), [employees]);

  const filteredSwaps = useMemo(() => {
    return swaps.filter(s => {
      if (search && !s.swap_id.toLowerCase().includes(search.toLowerCase()) && !s.requesting_employee_id.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedStatus && s.status !== selectedStatus) return false;
      return true;
    });
  }, [swaps, search, selectedStatus]);

  const handleCreateSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwap.original_assignment_id) return;
    try {
      const created = await dataService.submitSwapRequest({
        requesting_employee_id: currentUser.employee_id,
        original_assignment_id: newSwap.original_assignment_id,
        target_employee_id: newSwap.target_employee_id,
        reason: newSwap.reason,
      });
      setSwaps([created, ...swaps]);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error submitting swap');
    }
  };

  const handleApproval = async (swapId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await dataService.updateSwapStatus(swapId, status, currentUser.employee_id);
      setSwaps(swaps.map(s => {
        if (s.swap_id === swapId) {
          return {
            ...s,
            status,
            approver_employee_id: currentUser.employee_id,
            decision_timestamp: new Date().toISOString()
          };
        }
        return s;
      }));
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleApply = async (swapId: string) => {
    try {
      await dataService.applySwap(swapId, currentUser.employee_id);
      setSwaps(swaps.map(s => {
        if (s.swap_id === swapId) {
          return {
            ...s,
            status: 'APPLIED',
            applied_timestamp: new Date().toISOString()
          };
        }
        return s;
      }));
    } catch (err: any) {
      alert(err.message || 'Application failed');
    }
  };

  const statusColors: Record<string, string> = {
    APPLIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    APPROVED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PENDING_MANAGER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isManagerOrAdmin = hasRole(['MANAGER', 'ADMIN']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-400" />
            <span>Shift Swap Workflow Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Request, peer-validate, and manager-authorize shift exchanges with strict lifecycle transitions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Shift Swap</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by swap ID or employee ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Swap Statuses</option>
          <option value="PENDING_MANAGER">PENDING_MANAGER</option>
          <option value="APPROVED">APPROVED (Awaiting Apply)</option>
          <option value="APPLIED">APPLIED (Completed)</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* Swaps Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Swap ID</th>
                <th className="py-3 px-4">Requester &rarr; Replacement</th>
                <th className="py-3 px-4">Original Assignment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Manager Approver</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredSwaps.length > 0 ? (
                filteredSwaps.map(swap => {
                  const reqEmp = empMap.get(swap.requesting_employee_id);
                  const tgtEmp = empMap.get(swap.target_employee_id);

                  return (
                    <tr key={swap.swap_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                        {swap.swap_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{reqEmp?.first_name || swap.requesting_employee_id}</span>
                          <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                          <span className="font-semibold text-slate-300">{tgtEmp?.first_name || swap.target_employee_id}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {swap.requesting_employee_id} &bull; {swap.target_employee_id}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {swap.original_assignment_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] border ${statusColors[swap.status] || 'bg-slate-800'}`}>
                          {swap.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {swap.approver_employee_id || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate" title={swap.reason || ''}>
                        {swap.reason || 'None stated'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isManagerOrAdmin && swap.status === 'PENDING_MANAGER' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproval(swap.swap_id, 'APPROVED')}
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[10px] font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(swap.swap_id, 'REJECTED')}
                              className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-[10px] font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {isManagerOrAdmin && swap.status === 'APPROVED' && (
                          <button
                            onClick={() => handleApply(swap.swap_id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold shadow-md shadow-emerald-600/20"
                          >
                            Apply Swap
                          </button>
                        )}
                        {swap.status === 'APPLIED' && (
                          <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Enacted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No swap requests match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Swap Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Initiate Shift Swap</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSwap} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Requesting Employee</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name} (${currentUser.employee_id})`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Shift Assignment</label>
                <select
                  value={newSwap.original_assignment_id}
                  onChange={e => setNewSwap({ ...newSwap, original_assignment_id: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {assignments.slice(0, 30).map(a => (
                    <option key={a.assignment_id} value={a.assignment_id}>
                      {a.assignment_id} ({a.shift_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Proposed Replacement Peer</label>
                <select
                  value={newSwap.target_employee_id}
                  onChange={e => setNewSwap({ ...newSwap, target_employee_id: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {employees.slice(0, 30).map(e => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.employee_id}: {e.first_name} {e.last_name} ({e.it_job_role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reason for Exchange</label>
                <textarea
                  rows={3}
                  required
                  value={newSwap.reason}
                  onChange={e => setNewSwap({ ...newSwap, reason: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Submit Swap Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
