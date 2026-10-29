import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { ShiftOccurrence, ShiftAssignment, CoverageRequirement, ShiftTemplate, Team, Employee, Skill } from '../types';
import { Calendar, Moon, Sun, Clock, Filter, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, User } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const [occurrences, setOccurrences] = useState<ShiftOccurrence[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [requirements, setRequirements] = useState<CoverageRequirement[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Date Filter (Default to start of Q1: 2026-01-01)
  const [selectedDate, setSelectedDate] = useState('2026-01-01');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [occs, asgs, reqs, tmpls, tms, emps, sks] = await Promise.all([
          dataService.getShiftOccurrences(),
          dataService.getShiftAssignments(),
          dataService.getCoverageRequirements(),
          dataService.getShiftTemplates(),
          dataService.getTeams(),
          dataService.getEmployees(),
          dataService.getSkills(),
        ]);
        setOccurrences(occs);
        setAssignments(asgs);
        setRequirements(reqs);
        setTemplates(tmpls);
        setTeams(tms);
        setEmployees(emps);
        setSkills(sks);
      } catch (err) {
        console.error('Error loading schedule:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Quick lookups
  const empMap = useMemo(() => new Map(employees.map(e => [e.employee_id, e])), [employees]);
  const skillMap = useMemo(() => new Map(skills.map(s => [s.skill_id, s])), [skills]);
  const asgByShift = useMemo(() => {
    const map = new Map<string, ShiftAssignment[]>();
    for (const a of assignments) {
      if (!map.has(a.shift_id)) map.set(a.shift_id, []);
      map.get(a.shift_id)!.push(a);
    }
    return map;
  }, [assignments]);

  const reqByShift = useMemo(() => {
    const map = new Map<string, CoverageRequirement[]>();
    for (const r of requirements) {
      if (!map.has(r.shift_id)) map.set(r.shift_id, []);
      map.get(r.shift_id)!.push(r);
    }
    return map;
  }, [requirements]);

  // Filtered shifts for selected date
  const filteredShifts = useMemo(() => {
    return occurrences.filter(s => {
      if (s.shift_date !== selectedDate) return false;
      if (selectedTeam && s.team_id !== selectedTeam) return false;
      if (selectedTemplate && s.template_id !== selectedTemplate) return false;
      return true;
    });
  }, [occurrences, selectedDate, selectedTeam, selectedTemplate]);

  // Date stepper
  const handleDateStep = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    // Clamp to 2026-01-01 -> 2026-03-31
    const minD = new Date('2026-01-01');
    const maxD = new Date('2026-03-31');
    if (d >= minD && d <= maxD) {
      setSelectedDate(d.toISOString().split('T')[0]);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Operational Schedule Planner</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              90-Day Horizon
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dated shift occurrences, staffing demand, IT skill requirements, and worker allocations.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => handleDateStep(-1)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            min="2026-01-01"
            max="2026-03-31"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent border-0 text-white font-mono text-xs px-2 focus:outline-none"
          />

          <button
            onClick={() => handleDateStep(1)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Teams (Active squads)</option>
          {teams.slice(0, 20).map(t => (
            <option key={t.team_id} value={t.team_id}>{t.team_id}: {t.team_name}</option>
          ))}
        </select>

        <select
          value={selectedTemplate}
          onChange={e => setSelectedTemplate(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Shifts (Morning / Afternoon / Night)</option>
          {templates.map(tm => (
            <option key={tm.template_id} value={tm.template_id}>{tm.shift_name} ({tm.shift_code})</option>
          ))}
        </select>

        <div className="ml-auto text-xs text-slate-400">
          Showing <strong className="text-white font-mono">{filteredShifts.length}</strong> shifts on <strong className="text-white font-mono">{selectedDate}</strong>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.length > 0 ? (
          filteredShifts.map(shift => {
            const asgs = asgByShift.get(shift.shift_id) || [];
            const reqs = reqByShift.get(shift.shift_id) || [];
            const critSkill = reqs[0]?.required_skill_id ? skillMap.get(reqs[0].required_skill_id) : null;
            const isCovered = asgs.length >= (reqs[0]?.required_headcount || 1);

            return (
              <div 
                key={shift.shift_id} 
                className={`p-4 rounded-xl bg-slate-900 border transition-colors flex flex-col justify-between ${
                  isCovered ? 'border-slate-800' : 'border-amber-500/40 bg-amber-950/10'
                }`}
              >
                <div>
                  {/* Shift Badge & Overnight Flag */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {shift.team_id}
                    </span>

                    {shift.is_overnight ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                        <Moon className="w-3 h-3" /> Overnight (Crosses Day)
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Sun className="w-3 h-3" /> Day Shift
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1 font-mono">{shift.shift_id}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{shift.start_datetime.split('T')[1].slice(0, 5)} - {shift.end_datetime.split('T')[1].slice(0, 5)} UTC</span>
                  </div>

                  {/* Required Skill */}
                  {critSkill && (
                    <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] mb-3">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mandatory IT Skill:</span>
                      <span className="font-semibold text-teal-400">{critSkill.skill_name}</span>
                      <span className="text-slate-500 text-[10px] block">{critSkill.category}</span>
                    </div>
                  )}

                  {/* Assigned Workers */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Assigned Staff ({asgs.length}/{reqs[0]?.required_headcount || 1}):
                    </span>
                    {asgs.length > 0 ? (
                      asgs.map(a => {
                        const emp = empMap.get(a.employee_id);
                        return (
                          <div key={a.assignment_id} className="p-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-indigo-400" />
                              <div>
                                <span className="font-semibold text-white block">{emp?.first_name} {emp?.last_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{a.employee_id} &bull; {a.assigned_role}</span>
                              </div>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {a.assignment_status}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Coverage Gap: Slot Unassigned</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Occurrence Status: <strong className="text-slate-300">{shift.status}</strong></span>
                  <span className={isCovered ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                    {isCovered ? "Demand Fulfilled" : "Coverage Shortage"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 rounded-xl bg-slate-900 border border-slate-800">
            No shift occurrences matching the filters on {selectedDate}.
          </div>
        )}
      </div>
    </div>
  );
};

