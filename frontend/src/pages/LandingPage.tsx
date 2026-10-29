import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Cpu, Database, 
  ArrowRight, CheckCircle2, Lock, FileSpreadsheet,
  AlertTriangle, Users, Layers, Award
} from 'lucide-react';
import { PRESET_PERSONAS, useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { setCurrentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <nav className="border-b border-slate-800/80 px-6 lg:px-16 py-4 flex items-center justify-between bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">WorkForce Scheduler <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">2.0</span></span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Seed: 20261022 &bull; Netlify &bull; Supabase PostgreSQL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none mb-6">
            Workforce Scheduling, Constraint Validation &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400">Decision Traceability</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Autonomous enterprise scheduler designed for complex IT engineering organizations. 
            Balances 2,000 employees, 100 squads, 90-day shift horizons, and 5,000 leave requests 
            with hard labor constraint satisfaction, IT skill-demand matching, and benchmarked anomaly auditing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <span>Explore Operational Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/validation"
              className="px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Inspect Anomaly Benchmarks (F1: 1.0)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Highlights Banner */}
      <section className="border-y border-slate-800/80 bg-slate-900/40 py-10 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">2,000</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">IT Employees</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">100</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Engineering Teams</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">90 Days</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Scheduling Horizon</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">1.0000</div>
            <div className="text-xs text-slate-400 mt-1 uppercase font-semibold">Benchmark F1-Score</div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-20 px-6 lg:px-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Enterprise Workforce Capabilities</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">Full-stack decision support from master data generation to live scheduling optimization.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Constraint Propagation Solver</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Enforces hard labor boundaries: double-booking prevention, approved leave exclusion, 48h weekly overtime limits, and rest intervals.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Hard constraint pruning</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Workload fairness optimization</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Explicit coverage gap reporting</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-5 text-teal-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Curated IT Skills Taxonomy</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Restricted strictly to the IT industry across 7 pillars: Software Eng, Data/Analytics, AI/ML, Cloud/DevOps, Security, QA, and Databases.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 60 specialized IT competencies</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 4-tier proficiency validation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Role &amp; squad skill consistency</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Labelled Anomaly Benchmarking</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Injects and detects all 5 required anomaly scenarios against isolated ground-truth registries without operational data leakage.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> 100% Precision &amp; Recall</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Record-level deterministic matching</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Actionable corrective remediation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Role-Based Personas Quick Switch */}
      <section className="py-16 px-6 lg:px-16 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Select a Persona to Test Role-Based Access (RBAC)</h2>
            <p className="text-xs text-slate-400 mt-1">Simulate exact permissions for Employees, Managers, HR, IT Ops, and Administrators.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRESET_PERSONAS.map(p => (
              <Link
                key={p.id}
                to="/dashboard"
                onClick={() => setCurrentUser(p)}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-all hover:scale-102 flex flex-col items-center text-center group"
              >
                <img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-full object-cover mb-3 border-2 border-indigo-500/40 group-hover:border-indigo-400" />
                <span className="font-semibold text-xs text-white group-hover:text-indigo-300">{p.name}</span>
                <span className="text-[10px] text-slate-400 mb-2 truncate max-w-full">{p.title}</span>
                <span className="text-[9px] px-2 py-0.5 rounded font-mono font-medium bg-slate-900 border border-slate-700 text-slate-300">
                  {p.role}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 lg:px-16 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          Workforce Scheduler 2.0 &bull; Netlify &amp; Supabase PostgreSQL Integration
        </div>
        <div className="flex items-center gap-6">
          <Link to="/docs" className="hover:text-slate-300 transition-colors">Documentation</Link>
          <Link to="/exports" className="hover:text-slate-300 transition-colors">Exports &amp; Reports</Link>
          <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold">Enter Platform &rarr;</Link>
        </div>
      </footer>
    </div>
  );
};
