import React, { useEffect, useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import { Employee, Team, EmployeeSkill, Skill } from '../types';
import { 
  Users, Search, Filter, ChevronLeft, ChevronRight, 
  X, Check, Plus, Award, Mail, Calendar, Briefcase, Clock,
  Edit2, UserX, UserCheck, Trash2
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modal State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    primary_team_id: '',
    it_job_role: '',
    employment_status: 'ACTIVE' as 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED',
    employment_type: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR',
    weekly_max_hours: 40.0,
    overtime_cap_hours: 8.0,
  });

  // Add Skill state for selected employee
  const [newSkillId, setNewSkillId] = useState('');
  const [newProficiency, setNewProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');

  const [newEmpForm, setNewEmpForm] = useState({
    first_name: '',
    last_name: '',
    primary_team_id: 'TEAM-001',
    it_job_role: 'Senior Backend Engineer',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [emps, tms, sks, empSks] = await Promise.all([
          dataService.getEmployees(),
          dataService.getTeams(),
          dataService.getSkills(),
          dataService.getEmployeeSkills(),
        ]);
        setEmployees(emps);
        setTeams(tms);
        setSkills(sks);
        setEmployeeSkills(empSks);
      } catch (err) {
        console.error('Error loading employees:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (search) {
        const q = search.toLowerCase();
        const matchesQuery = 
          emp.employee_id.toLowerCase().includes(q) ||
          emp.first_name.toLowerCase().includes(q) ||
          emp.last_name.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      if (selectedTeam && emp.primary_team_id !== selectedTeam) return false;
      if (selectedRole && emp.it_job_role !== selectedRole) return false;
      if (selectedStatus && emp.employment_status !== selectedStatus) return false;
      return true;
    });
  }, [employees, search, selectedTeam, selectedRole, selectedStatus]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  // Unique IT job roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const set = new Set(employees.map(e => e.it_job_role));
    return Array.from(set).sort();
  }, [employees]);

  // Skill lookup map for selected employee
  const selectedEmpSkills = useMemo(() => {
    if (!selectedEmployee) return [];
    const empSks = employeeSkills.filter(es => es.employee_id === selectedEmployee.employee_id);
    const skillMap = new Map(skills.map(s => [s.skill_id, s]));
    return empSks.map(es => ({
      ...es,
      skill: skillMap.get(es.skill_id)
    }));
  }, [selectedEmployee, employeeSkills, skills]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.first_name || !newEmpForm.last_name) return;
    await dataService.addEmployee({
      first_name: newEmpForm.first_name,
      last_name: newEmpForm.last_name,
      primary_team_id: newEmpForm.primary_team_id,
      it_job_role: newEmpForm.it_job_role,
      employment_status: 'ACTIVE',
      employment_type: 'FULL_TIME',
      hire_date: new Date().toISOString().split('T')[0]
    });
    const refreshed = await dataService.getEmployees();
    setEmployees(refreshed);
    setShowAddModal(false);
    setNewEmpForm({ first_name: '', last_name: '', primary_team_id: 'TEAM-001', it_job_role: 'Senior Backend Engineer' });
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      primary_team_id: emp.primary_team_id,
      it_job_role: emp.it_job_role,
      employment_status: emp.employment_status,
      employment_type: emp.employment_type,
      weekly_max_hours: emp.weekly_max_hours,
      overtime_cap_hours: emp.overtime_cap_hours,
    });
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const updated = await dataService.updateEmployee(editingEmployee.employee_id, editForm);
    if (updated) {
      setEmployees(prev => prev.map(emp => emp.employee_id === updated.employee_id ? updated : emp));
      if (selectedEmployee && selectedEmployee.employee_id === updated.employee_id) {
        setSelectedEmployee(updated);
      }
    }
    setEditingEmployee(null);
  };

  const handleToggleDeactivate = async (emp: Employee) => {
    const newStatus = emp.employment_status === 'ACTIVE' ? 'TERMINATED' : 'ACTIVE';
    const confirmMsg = newStatus === 'TERMINATED' 
      ? `Are you sure you want to deactivate ${emp.first_name} ${emp.last_name}? (Historical schedules and punch records will be preserved).` 
      : `Reactivate ${emp.first_name} ${emp.last_name}?`;
    
    if (!window.confirm(confirmMsg)) return;

    const ok = await dataService.setEmployeeStatus(emp.employee_id, newStatus);
    if (ok) {
      setEmployees(prev => prev.map(e => e.employee_id === emp.employee_id ? { ...e, employment_status: newStatus } : e));
      if (selectedEmployee && selectedEmployee.employee_id === emp.employee_id) {
        setSelectedEmployee({ ...selectedEmployee, employment_status: newStatus });
      }
    }
  };

  const handleAddSkillToEmployee = async () => {
    if (!selectedEmployee || !newSkillId) return;
    const res = await dataService.addEmployeeSkill(selectedEmployee.employee_id, newSkillId, newProficiency);
    if (res) {
      setEmployeeSkills(prev => [...prev, res]);
      setNewSkillId('');
    }
  };

  const handleRemoveSkillFromEmployee = async (employeeSkillId: string) => {
    const ok = await dataService.removeEmployeeSkill(employeeSkillId);
    if (ok) {
      setEmployeeSkills(prev => prev.filter(es => es.employee_skill_id !== employeeSkillId));
    }
  };

  const profColors: Record<string, string> = {
    BEGINNER: 'bg-slate-700 text-slate-300',
    INTERMEDIATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ADVANCED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    EXPERT: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
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
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Employee Workforce Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {employees.length.toLocaleString()} Total Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and inspect the 2,000 synthetic IT engineering professionals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedTeam}
          onChange={e => { setSelectedTeam(e.target.value); setCurrentPage(1); }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Teams (100 Squads)</option>
          {teams.map(t => (
            <option key={t.team_id} value={t.team_id}>{t.team_id}: {t.team_name}</option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={e => { setSelectedRole(e.target.value); setCurrentPage(1); }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All IT Job Roles</option>
          {uniqueRoles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Employment Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="ON_LEAVE">ON_LEAVE</option>
          <option value="TERMINATED">TERMINATED</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Name &amp; Synthetic Email</th>
                <th className="py-3 px-4">Primary Squad</th>
                <th className="py-3 px-4">IT Job Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Weekly Limit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map(emp => (
                  <tr key={emp.employee_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                      {emp.employee_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{emp.first_name} {emp.last_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-300">{emp.primary_team_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-200 text-[11px]">
                        {emp.it_job_role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        emp.employment_status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {emp.employment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {emp.weekly_max_hours}h (+{emp.overtime_cap_hours}h OT)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 text-[11px] transition-colors"
                          title="View profile & skills"
                        >
                          Skills
                        </button>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                          title="Edit employee details & team"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleDeactivate(emp)}
                          className={`p-1 rounded-lg border transition-colors ${
                            emp.employment_status === 'ACTIVE'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                          title={emp.employment_status === 'ACTIVE' ? 'Deactivate employee' : 'Reactivate employee'}
                        >
                          {emp.employment_status === 'ACTIVE' ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No employees matching the current search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{Math.min(filteredEmployees.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-white">{Math.min(filteredEmployees.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-white">{filteredEmployees.length.toLocaleString()}</strong> entries
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>

            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 border border-slate-700 text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 border border-slate-700 text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Detail & Skills Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {selectedEmployee.employee_id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedEmployee.it_job_role} &bull; {selectedEmployee.primary_team_id}</p>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-500 block">Status</span>
                <span className="font-semibold text-emerald-400 font-mono">{selectedEmployee.employment_status}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-500 block">Contract Type</span>
                <span className="font-semibold text-slate-200">{selectedEmployee.employment_type}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-500 block">Weekly Max</span>
                <span className="font-semibold text-slate-200 font-mono">{selectedEmployee.weekly_max_hours} Hours</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-500 block">Overtime Cap</span>
                <span className="font-semibold text-slate-200 font-mono">+{selectedEmployee.overtime_cap_hours}h / week</span>
              </div>
            </div>

            {/* IT Skills Matrix */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Certified IT Skills Matrix ({selectedEmpSkills.length} competencies)</span>
              </h3>
              
              {/* Add Skill to Employee Section */}
              <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="text-xs font-semibold text-white mb-2">Add Competency to Employee</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={newSkillId}
                    onChange={e => setNewSkillId(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select an IT Skill...</option>
                    {skills.map(s => (
                      <option key={s.skill_id} value={s.skill_id}>
                        {s.skill_name} ({s.category})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newProficiency}
                    onChange={e => setNewProficiency(e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                    <option value="EXPERT">EXPERT</option>
                  </select>
                  <button
                    onClick={handleAddSkillToEmployee}
                    disabled={!newSkillId}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Skill</span>
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {selectedEmpSkills.map(es => (
                  <div key={es.employee_skill_id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{es.skill?.skill_name || es.skill_id}</div>
                      <div className="text-[10px] text-slate-500">{es.skill?.category} &bull; {es.years_experience} yrs exp</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${profColors[es.proficiency_level] || 'bg-slate-700'}`}>
                        {es.proficiency_level}
                      </span>
                      <button
                        onClick={() => handleRemoveSkillFromEmployee(es.employee_skill_id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">Edit Employee Details</h2>
                <span className="text-[10px] text-indigo-400 font-mono">{editingEmployee.employee_id}</span>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Squad / Team</label>
                <select
                  value={editForm.primary_team_id}
                  onChange={e => setEditForm({ ...editForm, primary_team_id: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {teams.slice(0, 50).map(t => (
                    <option key={t.team_id} value={t.team_id}>{t.team_id}: {t.team_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">IT Job Role</label>
                <select
                  value={editForm.it_job_role}
                  onChange={e => setEditForm({ ...editForm, it_job_role: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {uniqueRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Status</label>
                  <select
                    value={editForm.employment_status}
                    onChange={e => setEditForm({ ...editForm, employment_status: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                    <option value="TERMINATED">TERMINATED (Inactive)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Contract Type</label>
                  <select
                    value={editForm.employment_type}
                    onChange={e => setEditForm({ ...editForm, employment_type: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FULL_TIME">FULL_TIME</option>
                    <option value="PART_TIME">PART_TIME</option>
                    <option value="CONTRACTOR">CONTRACTOR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Weekly Max Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.weekly_max_hours}
                    onChange={e => setEditForm({ ...editForm, weekly_max_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Overtime Cap</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.overtime_cap_hours}
                    onChange={e => setEditForm({ ...editForm, overtime_cap_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white">Create Synthetic Employee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={newEmpForm.first_name}
                  onChange={e => setNewEmpForm({ ...newEmpForm, first_name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={newEmpForm.last_name}
                  onChange={e => setNewEmpForm({ ...newEmpForm, last_name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Primary Squad</label>
                <select
                  value={newEmpForm.primary_team_id}
                  onChange={e => setNewEmpForm({ ...newEmpForm, primary_team_id: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {teams.slice(0, 30).map(t => (
                    <option key={t.team_id} value={t.team_id}>{t.team_id}: {t.team_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">IT Job Role</label>
                <select
                  value={newEmpForm.it_job_role}
                  onChange={e => setNewEmpForm({ ...newEmpForm, it_job_role: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {uniqueRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

