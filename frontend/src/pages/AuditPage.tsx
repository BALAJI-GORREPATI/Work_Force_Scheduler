import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { AuditEvent } from '../types';
import { History, Search, Filter, ShieldCheck, ArrowRight } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [audits, setAudits] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const events = await dataService.getAuditEvents();
        setAudits(events);
      } catch (err) {
        console.error('Error loading audits:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actionTypes = useMemo(() => {
    return Array.from(new Set(audits.map(a => a.action_type))).sort();
  }, [audits]);

  const filteredAudits = useMemo(() => {
    return audits.filter(a => {
      if (search) {
        const q = search.toLowerCase();
        const matches = 
          a.event_id.toLowerCase().includes(q) ||
          a.actor_employee_id.toLowerCase().includes(q) ||
          a.target_id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedAction && a.action_type !== selectedAction) return false;
      return true;
    });
  }, [audits, search, selectedAction]);

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
          <History className="w-5 h-5 text-indigo-400" />
          <span>Decision Traceability &amp; Immutable Audit Trail</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            {audits.length} Recorded Events
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete, unalterable historical log of management approvals, shift swaps, schedule runs, and integrity validations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by event ID, actor employee ID, or target ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedAction}
          onChange={e => setSelectedAction(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Audit Action Types</option>
          {actionTypes.map(act => (
            <option key={act} value={act}>{act}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Entity &amp; ID</th>
                <th className="py-3 px-4">State Transition</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredAudits.length > 0 ? (
                filteredAudits.map(aud => (
                  <tr key={aud.event_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-400 text-[11px]">
                      {aud.event_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 font-medium">
                      {aud.actor_employee_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-slate-800 border border-slate-700 text-indigo-300">
                        {aud.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-medium">{aud.target_entity}</span>
                      <span className="text-slate-500 text-[10px] font-mono block">{aud.target_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-slate-500">{aud.previous_state || 'NONE'}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="text-emerald-400 font-semibold">{aud.new_state}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(aud.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit records match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
