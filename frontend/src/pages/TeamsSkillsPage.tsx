import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { Team, Skill, Employee } from '../types';
import { Network, Search, Filter, Layers, Briefcase, Award } from 'lucide-react';

export const TeamsSkillsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'teams' | 'skills'>('teams');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tms, sks, emps] = await Promise.all([
          dataService.getTeams(),
          dataService.getSkills(),
          dataService.getEmployees(),
        ]);
        setTeams(tms);
        setSkills(sks);
        setEmployees(emps);
      } catch (err) {
        console.error('Error loading teams & skills:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute headcount per team
  const teamHeadcounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const emp of employees) {
      map.set(emp.primary_team_id, (map.get(emp.primary_team_id) || 0) + 1);
    }
    return map;
  }, [employees]);

  // Unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(teams.map(t => t.department))).sort();
  }, [teams]);

  // Unique skill categories for filter
  const skillCategories = useMemo(() => {
    return Array.from(new Set(skills.map(s => s.category))).sort();
  }, [skills]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      if (search && !t.team_name.toLowerCase().includes(search.toLowerCase()) && !t.team_id.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedDept && t.department !== selectedDept) return false;
      return true;
    });
  }, [teams, search, selectedDept]);

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      if (search && !s.skill_name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedSkillCategory && s.category !== selectedSkillCategory) return false;
      return true;
    });
  }, [skills, search, selectedSkillCategory]);

  const catColors: Record<string, string> = {
    'Software Engineering': 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
    'Data Engineering & Analytics': 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    'AI & Machine Learning': 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    'Cloud & DevOps': 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    'Cybersecurity & Networking': 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    'Software Quality Assurance': 'border-teal-500/40 text-teal-400 bg-teal-500/10',
    'Databases & Operations': 'border-blue-500/40 text-blue-400 bg-blue-500/10',
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
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <span>Teams &amp; IT Skills Matrix</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore the 100 enterprise IT engineering squads and 60 specialized technical skills.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('teams'); setSearch(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'teams'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            100 IT Squads ({teams.length})
          </button>
          <button
            onClick={() => { setActiveTab('skills'); setSearch(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'skills'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            60 IT Skills ({skills.length})
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'teams' ? "Search squads by name or team ID..." : "Search skills by technology name or description..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {activeTab === 'teams' ? (
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        ) : (
          <select
            value={selectedSkillCategory}
            onChange={e => setSelectedSkillCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Skill Categories (7 Pillars)</option>
            {skillCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'teams' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map(t => {
            const count = teamHeadcounts.get(t.team_id) || 0;
            return (
              <div key={t.team_id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-indigo-400 border border-slate-700">
                    {t.team_id}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    <strong>{count}</strong> members
                  </span>
                </div>
                <h3 className="font-semibold text-white text-xs mb-1">{t.team_name}</h3>
                <p className="text-[11px] text-slate-400">{t.department}</p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Lead: <code className="text-slate-400">{t.manager_employee_id || 'Assigned'}</code></span>
                  <span>Active Squad</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(s => {
            const badgeClass = catColors[s.category] || 'border-slate-700 text-slate-400 bg-slate-800';
            return (
              <div key={s.skill_id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {s.skill_id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${badgeClass}`}>
                      {s.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{s.skill_name}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{s.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Scope: Enterprise IT</span>
                  <span className="text-emerald-400 font-medium">Verified IT Competency</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
