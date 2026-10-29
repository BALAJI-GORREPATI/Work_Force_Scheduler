import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Network, Calendar, 
  CalendarOff, Repeat, Clock, Cpu, 
  AlertTriangle, History, Download, Home
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { to: '/employees', label: 'Employee Directory', icon: Users, badge: '2,000' },
    { to: '/teams-skills', label: 'Teams & IT Skills', icon: Network, badge: '100 / 60' },
    { to: '/schedule', label: 'Schedule Planner', icon: Calendar, badge: '90 Days' },
    { to: '/leave', label: 'Leave Management', icon: CalendarOff, badge: '5,000' },
    { to: '/swaps', label: 'Shift Swap Center', icon: Repeat },
    { to: '/attendance', label: 'Attendance Tracking', icon: Clock },
    { to: '/optimizer', label: 'Schedule Optimizer', icon: Cpu },
    { to: '/validation', label: 'Validation & Benchmarks', icon: AlertTriangle, badge: 'F1: 1.0', highlight: true },
    { to: '/audit', label: 'Audit Trail & Decisions', icon: History },
    { to: '/exports', label: 'Data Exports & Reports', icon: Download },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 flex-1 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
            isActive 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span>Landing Page</span>
        </NavLink>

        <div className="pt-2 pb-1 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Workforce Operations
        </div>

        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                item.highlight 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
              }`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400">Target Horizon:</span>
          <span className="text-white font-mono">Q1 2026 (90d)</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Engine Algorithm:</span>
          <span className="text-indigo-400 font-mono">Fair-Prop v2</span>
        </div>
      </div>
    </aside>
  );
};
