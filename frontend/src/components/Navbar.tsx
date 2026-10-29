import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, PRESET_PERSONAS } from '../context/AuthContext';
import { 
  ShieldCheck, Database, UserCheck, ChevronDown, 
  Sparkles, ExternalLink 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, setCurrentUser, isConfigured } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roleColors: Record<string, string> = {
    EMPLOYEE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MANAGER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    HR_PARTNER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    IT_OPS_PARTNER: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ADMIN: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  };

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
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">v2.0</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Workforce Scheduling & Constraint Traceability</p>
          </div>
        </Link>
      </div>

      {/* Middle Status Indicators */}
      <div className="hidden md:flex items-center gap-4 text-xs">
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

      {/* Role / Persona Quick Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors text-left"
        >
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-lg object-cover border border-slate-600"
          />
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">{currentUser.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono font-medium ${roleColors[currentUser.role]}`}>
                {currentUser.role}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{currentUser.title}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-4 py-2 border-b border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Active Role (RBAC Demo)</p>
            </div>
            <div className="py-1">
              {PRESET_PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentUser(p);
                    setDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-800/80 transition-colors ${
                    currentUser.id === p.id ? 'bg-indigo-600/15 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white truncate">{p.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${roleColors[p.role]}`}>
                        {p.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{p.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
