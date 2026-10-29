import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { 
  Cpu, Play, CheckCircle2, AlertTriangle, 
  Clock, TrendingUp, Sliders, History, Sparkles 
} from 'lucide-react';

export const OptimizerPage: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const [scheduleRuns, setScheduleRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // Form Parameters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const [algorithm, setAlgorithm] = useState('CONSTRAINT_PROPAGATION_WITH_FAIRNESS');
  const [fairnessWeight, setFairnessWeight] = useState(0.85);

  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const runs = await dataService.getScheduleRuns();
        setScheduleRuns(runs);
        if (runs.length > 0) {
          setLastResult(runs[0]);
        }
      } catch (err) {
        console.error('Error loading schedule runs:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRunOptimization = async () => {
    setRunning(true);
    try {
      const result = await dataService.runOptimizer(startDate, endDate, algorithm);
      setLastResult(result);
      setScheduleRuns([result, ...scheduleRuns]);
    } catch (err: any) {
      alert(err.message || 'Optimization failed');
    } finally {
      setRunning(false);
    }
  };

  const isOpsOrAdmin = hasRole(['ADMIN', 'IT_OPS_PARTNER', 'MANAGER']);

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
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>Workforce Schedule Optimization Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Autonomous solver executing constraint propagation, labor regulation pruning, and workload fairness balancing.
        </p>
      </div>

      {/* Solver Configuration & Controls Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Solver Parameters &amp; Labor Constraints</span>
            </h2>
            <p className="text-[11px] text-slate-400">Configure optimization window, algorithm heuristics, and fairness weights.</p>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={running || !isOpsOrAdmin}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            {running ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Executing Solver...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Schedule Optimizer</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Horizon Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Horizon End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Algorithm Strategy</label>
            <select
              value={algorithm}
              onChange={e => setAlgorithm(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="CONSTRAINT_PROPAGATION_WITH_FAIRNESS">Constraint Propagation + Fairness</option>
              <option value="STRICT_SKILL_PRIORITY">Strict Skill Priority First</option>
              <option value="BALANCED_HOURS_GREEDY">Balanced Workload Heuristic</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-medium">Fairness Weight ($\lambda$)</label>
              <span className="text-teal-400 font-mono font-bold">{fairnessWeight.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={fairnessWeight}
              onChange={e => setFairnessWeight(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Latest Optimization Run Metrics */}
      {lastResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950/20 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 className="text-sm font-bold text-white">Latest Optimization Solution: <span className="font-mono text-indigo-400">{lastResult.run_id}</span></h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
              {lastResult.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Total Shifts</span>
              <span className="text-lg font-bold text-white font-mono">{lastResult.total_shifts.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Assigned Slots</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{lastResult.assigned_shifts.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Coverage Rate</span>
              <span className="text-lg font-bold text-teal-400 font-mono">{lastResult.coverage_rate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Skill Match</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{lastResult.skill_coverage_rate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Runtime</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">{lastResult.runtime_seconds}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Runs History Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Traceable Schedule Run History ({scheduleRuns.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-4">Horizon Window</th>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Assigned / Total</th>
                <th className="py-3 px-4">Coverage Rate</th>
                <th className="py-3 px-4">Skill Match</th>
                <th className="py-3 px-4">Solver Runtime</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {scheduleRuns.map(r => (
                <tr key={r.run_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                    {r.run_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                    {r.start_date} &rarr; {r.end_date}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">
                      {r.algorithm}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {r.assigned_shifts.toLocaleString()} / {r.total_shifts.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                    {r.coverage_rate}%
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-400">
                    {r.skill_coverage_rate}%
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {r.runtime_seconds}s
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

