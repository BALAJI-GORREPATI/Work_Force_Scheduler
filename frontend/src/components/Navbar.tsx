import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Database, Sparkles 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isConfigured } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">WorkForce</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Workforce Scheduling &amp; Constraint Traceability</p>
          </div>
        </Link>
      </div>

      {/* Middle Status Indicators */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
          <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <span>Storage: <strong className="text-white">{isConfigured ? 'Supabase PostgreSQL' : 'Local / Synthetic Mode'}</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Seed: <code className="text-indigo-300 font-mono">20261022</code></span>
        </div>
      </div>
    </header>
  );
};

