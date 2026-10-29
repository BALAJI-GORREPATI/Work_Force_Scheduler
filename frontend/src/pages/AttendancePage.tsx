import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { AttendanceEvent, Employee } from '../types';
import { Clock, Search, Filter, CheckCircle2, AlertTriangle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    const load = async () => {
      try {
        const [atts, emps] = await Promise.all([
          dataService.getAttendanceEvents(),
          dataService.getEmployees(),
        ]);
        setEvents(atts);
        setEmployees(emps);
      } catch (err) {
        console.error('Error loading attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const empMap = useMemo(() => new Map(employees.map(e => [e.employee_id, e])), [employees]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (search) {
        const q = search.toLowerCase();
        const emp = empMap.get(e.employee_id);
        const matchesQuery = 
          e.attendance_id.toLowerCase().includes(q) ||
          e.employee_id.toLowerCase().includes(q) ||
          emp?.first_name.toLowerCase().includes(q) ||
          emp?.last_name.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (selectedStatus && e.status !== selectedStatus) return false;
      return true;
    });
  }, [events, search, selectedStatus, empMap]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = events.length;
    const onTime = events.filter(e => e.status === 'ON_TIME').length;
    const late = events.filter(e => e.status === 'LATE').length;
    const early = events.filter(e => e.status === 'EARLY_DEPARTURE').length;
    return {
      total,
      onTimeRate: total ? ((onTime / total) * 100).toFixed(1) : '94.0',
      lateCount: late,
      earlyCount: early,
    };
  }, [events]);

  const statusColors: Record<string, string> = {
    ON_TIME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    LATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    EARLY_DEPARTURE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    UNEXCUSED_ABSENCE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Attendance Reconciliation &amp; Clock Punches</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            {events.length.toLocaleString()} Total Punches
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Actual clock-in and clock-out event history reconciled against scheduled shift allocations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Total Punches</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{stats.total.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">On-Time Rate</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{stats.onTimeRate}%</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Late Punches</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">{stats.lateCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Early Departures</span>
          <div className="text-xl font-bold text-purple-400 font-mono mt-1">{stats.earlyCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by punch ID or employee..."
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
          <option value="">All Attendance Statuses</option>
          <option value="ON_TIME">ON_TIME</option>
          <option value="LATE">LATE</option>
          <option value="EARLY_DEPARTURE">EARLY_DEPARTURE</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Punch ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Event Punch</th>
                <th className="py-3 px-4">Recorded Timestamp</th>
                <th className="py-3 px-4">Reconciled Status</th>
                <th className="py-3 px-4">Actual Hours Worked</th>
                <th className="py-3 px-4">Shift Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedEvents.length > 0 ? (
                paginatedEvents.map(evt => {
                  const emp = empMap.get(evt.employee_id);
                  return (
                    <tr key={evt.attendance_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-indigo-400 text-[11px]">
                        {evt.attendance_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{emp?.first_name} {emp?.last_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{evt.employee_id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                          evt.event_type === 'CHECK_IN' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {evt.event_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {evt.event_timestamp.replace('T', ' ').slice(0, 19)} UTC
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-medium text-[10px] border ${statusColors[evt.status] || 'bg-slate-800'}`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {evt.actual_hours_worked ? `${evt.actual_hours_worked} hrs` : '— (Punch In)'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {evt.assignment_id || '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No attendance events matching filter.
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
            <strong className="text-white">{Math.min(filteredEvents.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-white">{filteredEvents.length.toLocaleString()}</strong> entries
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
    </div>
  );
};
