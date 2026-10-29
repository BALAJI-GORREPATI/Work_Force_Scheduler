import { 
  Employee, Team, Skill, EmployeeSkill, ShiftTemplate, 
  ShiftOccurrence, ShiftAssignment, LeaveRequest, AttendanceEvent, 
  CoverageRequirement, SwapRequest, ValidationIssue, AnomalyGroundTruth, 
  AuditEvent, EvaluationBenchmark 
} from '../types';

class DataService {
  private cache: { [key: string]: any[] } = {};
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  // In-memory runtime state for mutations
  private state = {
    employees: [] as Employee[],
    teams: [] as Team[],
    skills: [] as Skill[],
    employeeSkills: [] as EmployeeSkill[],
    shiftTemplates: [] as ShiftTemplate[],
    shiftOccurrences: [] as ShiftOccurrence[],
    shiftAssignments: [] as ShiftAssignment[],
    leaveRequests: [] as LeaveRequest[],
    attendanceEvents: [] as AttendanceEvent[],
    coverageRequirements: [] as CoverageRequirement[],
    swapRequests: [] as SwapRequest[],
    validationIssues: [] as ValidationIssue[],
    groundTruth: [] as AnomalyGroundTruth[],
    auditEvents: [] as AuditEvent[],
    scheduleRuns: [] as any[],
  };

  async initialize(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const fetchJson = async (file: string) => {
          const res = await fetch(`/data/${file}.json`);
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          return res.json();
        };

        const [
          employees, teams, skills, employeeSkills, shiftTemplates,
          shiftOccurrences, shiftAssignments, leaveRequests, attendanceEvents,
          coverageRequirements, swapRequests, validationIssues, groundTruth,
          auditEvents, scheduleRuns
        ] = await Promise.all([
          fetchJson('employees').catch(() => []),
          fetchJson('teams').catch(() => []),
          fetchJson('skills').catch(() => []),
          fetchJson('employee_skills').catch(() => []),
          fetchJson('shift_templates').catch(() => []),
          fetchJson('shift_occurrences').catch(() => []),
          fetchJson('shift_assignments').catch(() => []),
          fetchJson('leave_requests').catch(() => []),
          fetchJson('attendance_events').catch(() => []),
          fetchJson('coverage_requirements').catch(() => []),
          fetchJson('swap_requests').catch(() => []),
          fetchJson('validation_issues').catch(() => []),
          fetchJson('ground_truth').catch(() => []),
          fetchJson('audit_events').catch(() => []),
          fetchJson('schedule_runs').catch(() => []),
        ]);

        this.state.employees = employees;
        this.state.teams = teams;
        this.state.skills = skills;
        this.state.employeeSkills = employeeSkills;
        this.state.shiftTemplates = shiftTemplates;
        this.state.shiftOccurrences = shiftOccurrences;
        this.state.shiftAssignments = shiftAssignments;
        this.state.leaveRequests = leaveRequests;
        this.state.attendanceEvents = attendanceEvents;
        this.state.coverageRequirements = coverageRequirements;
        this.state.swapRequests = swapRequests;
        this.state.validationIssues = validationIssues;
        this.state.groundTruth = groundTruth;
        this.state.auditEvents = auditEvents;
        this.state.scheduleRuns = scheduleRuns;

        this.isLoaded = true;
      } catch (err) {
        console.error('DataService loading error:', err);
      }
    })();

    return this.loadPromise;
  }

  // --- Employees ---
  async getEmployees(): Promise<Employee[]> {
    await this.initialize();
    return this.state.employees;
  }

  async addEmployee(emp: Partial<Employee>): Promise<Employee> {
    await this.initialize();
    const newId = `EMP-${(this.state.employees.length + 1).toString().padStart(6, '0')}`;
    const newEmployee: Employee = {
      employee_id: newId,
      first_name: emp.first_name || 'New',
      last_name: emp.last_name || 'Engineer',
      email: `${emp.first_name?.toLowerCase() || 'user'}.${emp.last_name?.toLowerCase() || 'engineer'}.${newId.toLowerCase()}@techcorp.synthetic`,
      primary_team_id: emp.primary_team_id || 'TEAM-001',
      it_job_role: emp.it_job_role || 'Senior Backend Engineer',
      employment_status: emp.employment_status || 'ACTIVE',
      employment_type: emp.employment_type || 'FULL_TIME',
      weekly_max_hours: 40.0,
      overtime_cap_hours: 8.0,
      hire_date: emp.hire_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.employees.unshift(newEmployee);
    return newEmployee;
  }

  // --- Teams & Skills ---
  async getTeams(): Promise<Team[]> {
    await this.initialize();
    return this.state.teams;
  }

  async getSkills(): Promise<Skill[]> {
    await this.initialize();
    return this.state.skills;
  }

  async getEmployeeSkills(): Promise<EmployeeSkill[]> {
    await this.initialize();
    return this.state.employeeSkills;
  }

  // --- Shifts ---
  async getShiftTemplates(): Promise<ShiftTemplate[]> {
    await this.initialize();
    return this.state.shiftTemplates;
  }

  async getShiftOccurrences(): Promise<ShiftOccurrence[]> {
    await this.initialize();
    return this.state.shiftOccurrences;
  }

  async getShiftAssignments(): Promise<ShiftAssignment[]> {
    await this.initialize();
    return this.state.shiftAssignments;
  }

  async getCoverageRequirements(): Promise<CoverageRequirement[]> {
    await this.initialize();
    return this.state.coverageRequirements;
  }

  // --- Leave Workflow ---
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    await this.initialize();
    return this.state.leaveRequests;
  }

  async submitLeaveRequest(req: {
    employee_id: string;
    start_date: string;
    end_date: string;
    leave_type: 'ANNUAL' | 'SICK' | 'PARENTAL' | 'UNPAID' | 'STUDY';
    reason: string;
  }): Promise<LeaveRequest> {
    await this.initialize();
    const newId = `LVE-2026-${(this.state.leaveRequests.length + 1).toString().padStart(6, '0')}`;
    const newLeave: LeaveRequest = {
      leave_id: newId,
      employee_id: req.employee_id,
      start_date: req.start_date,
      end_date: req.end_date,
      leave_type: req.leave_type,
      reason: req.reason,
      status: 'PENDING',
      request_timestamp: new Date().toISOString(),
      approver_employee_id: null,
      decision_timestamp: null,
      decision_notes: null
    };
    this.state.leaveRequests.unshift(newLeave);

    // Audit Event
    this.logAuditEvent(req.employee_id, 'LEAVE_REQUEST', 'leave_requests', newId, null, 'PENDING');
    return newLeave;
  }

  async updateLeaveStatus(
    leaveId: string, 
    status: 'APPROVED' | 'REJECTED', 
    approverId: string, 
    notes: string = ''
  ): Promise<boolean> {
    await this.initialize();
    const lve = this.state.leaveRequests.find(l => l.leave_id === leaveId);
    if (!lve) return false;

    // Prevent approving own request
    if (lve.employee_id === approverId) {
      throw new Error('Self-approval violation: Employees cannot approve their own leave.');
    }

    const prevState = lve.status;
    lve.status = status;
    lve.approver_employee_id = approverId;
    lve.decision_timestamp = new Date().toISOString();
    lve.decision_notes = notes;

    this.logAuditEvent(approverId, 'LEAVE_DECISION', 'leave_requests', leaveId, prevState, status);
    return true;
  }

  // --- Swap Workflow ---
  async getSwapRequests(): Promise<SwapRequest[]> {
    await this.initialize();
    return this.state.swapRequests;
  }

  async submitSwapRequest(req: {
    requesting_employee_id: string;
    original_assignment_id: string;
    target_employee_id: string;
    reason: string;
  }): Promise<SwapRequest> {
    await this.initialize();
    const newId = `SWP-2026-${(this.state.swapRequests.length + 1).toString().padStart(6, '0')}`;
    const newSwap: SwapRequest = {
      swap_id: newId,
      requesting_employee_id: req.requesting_employee_id,
      original_assignment_id: req.original_assignment_id,
      target_employee_id: req.target_employee_id,
      target_assignment_id: null,
      reason: req.reason,
      status: 'PENDING_MANAGER',
      approver_employee_id: null,
      request_timestamp: new Date().toISOString(),
      decision_timestamp: null,
      applied_timestamp: null
    };
    this.state.swapRequests.unshift(newSwap);
    this.logAuditEvent(req.requesting_employee_id, 'SWAP_REQUEST', 'swap_requests', newId, null, 'PENDING_MANAGER');
    return newSwap;
  }

  async updateSwapStatus(
    swapId: string, 
    status: 'APPROVED' | 'REJECTED', 
    approverId: string
  ): Promise<boolean> {
    await this.initialize();
    const swap = this.state.swapRequests.find(s => s.swap_id === swapId);
    if (!swap) return false;

    const prevState = swap.status;
    swap.status = status;
    swap.approver_employee_id = approverId;
    swap.decision_timestamp = new Date().toISOString();

    this.logAuditEvent(approverId, 'SWAP_DECISION', 'swap_requests', swapId, prevState, status);
    return true;
  }

  async applySwap(swapId: string, managerId: string): Promise<boolean> {
    await this.initialize();
    const swap = this.state.swapRequests.find(s => s.swap_id === swapId);
    if (!swap) return false;

    // Hard Constraint Check: Cannot apply without prior approval
    if (swap.status !== 'APPROVED') {
      throw new Error('Lifecycle Violation: Cannot apply shift swap without prior manager approval.');
    }

    // Reassign shift
    const asg = this.state.shiftAssignments.find(a => a.assignment_id === swap.original_assignment_id);
    if (asg) {
      asg.employee_id = swap.target_employee_id;
      asg.assignment_status = 'SWAPPED';
      asg.updated_at = new Date().toISOString();
    }

    swap.status = 'APPLIED';
    swap.applied_timestamp = new Date().toISOString();

    this.logAuditEvent(managerId, 'SWAP_APPLICATION', 'swap_requests', swapId, 'APPROVED', 'APPLIED');
    return true;
  }

  // --- Attendance ---
  async getAttendanceEvents(): Promise<AttendanceEvent[]> {
    await this.initialize();
    return this.state.attendanceEvents;
  }

  // --- Optimization Engine ---
  async getScheduleRuns(): Promise<any[]> {
    await this.initialize();
    return this.state.scheduleRuns;
  }

  async runOptimizer(startDate: string, endDate: string, algorithm: string): Promise<any> {
    await this.initialize();
    const runId = `RUN-${startDate.replace(/-/g, '')}-OPT`;
    
    // Simulate interactive solver execution
    const totalShifts = this.state.shiftOccurrences.length;
    const assigned = Math.min(totalShifts, Math.floor(totalShifts * 0.985));
    const uncovered = totalShifts - assigned;

    const newRun = {
      run_id: runId,
      start_date: startDate,
      end_date: endDate,
      algorithm,
      status: 'SUCCESS',
      total_shifts: totalShifts,
      assigned_shifts: assigned,
      uncovered_shifts: uncovered,
      coverage_rate: 98.50,
      skill_coverage_rate: 99.20,
      runtime_seconds: 1.124,
      created_at: new Date().toISOString()
    };
    this.state.scheduleRuns.unshift(newRun);
    this.logAuditEvent('EMP-000001', 'SCHEDULE_OPTIMIZATION', 'schedule_runs', runId, null, 'SUCCESS');
    return newRun;
  }

  // --- Validation & Anomaly Benchmark ---
  async getValidationIssues(): Promise<ValidationIssue[]> {
    await this.initialize();
    return this.state.validationIssues;
  }

  async getGroundTruth(): Promise<AnomalyGroundTruth[]> {
    await this.initialize();
    return this.state.groundTruth;
  }

  async getEvaluationBenchmark(): Promise<EvaluationBenchmark> {
    await this.initialize();
    const gt = this.state.groundTruth;
    const issues = this.state.validationIssues;

    const scenarioMap: Record<string, string> = {
      'SCENARIO_1_DOUBLE_BOOKING': 'DOUBLE_BOOKING',
      'SCENARIO_2_LEAVE_CONFLICT': 'LEAVE_CONFLICT',
      'SCENARIO_3_SKILL_ABSENT': 'SKILL_MISSING',
      'SCENARIO_4_OVERTIME_CAP_EXCEEDED': 'OVERTIME_EXCEEDED',
      'SCENARIO_5_UNAPPROVED_SWAP_APPLIED': 'UNAPPROVED_SWAP_APPLIED',
    };

    const detectedSet = new Set(issues.map(i => `${i.issue_type}:${i.record_id}`));
    const breakdown = gt.map(g => {
      const targetType = scenarioMap[g.scenario_type] || g.scenario_type;
      const isDetected = detectedSet.has(`${targetType}:${g.record_id}`);
      return {
        anomaly_id: g.anomaly_id,
        scenario_type: g.scenario_type,
        record_id: g.record_id,
        rule_violated: g.rule_violated,
        expected_severity: g.expected_severity,
        detected: isDetected,
        status: (isDetected ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL'
      };
    });

    const tp = breakdown.filter(b => b.detected).length;
    const fn = breakdown.length - tp;
    const fp = Math.max(0, issues.length - tp);

    const precision = (tp + fp > 0) ? tp / (tp + fp) : 1.0;
    const recall = (tp + fn > 0) ? tp / (tp + fn) : 1.0;
    const f1 = (precision + recall > 0) ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      expected_anomalies_count: gt.length,
      detected_issues_count: issues.length,
      true_positives: tp,
      false_positives: fp,
      false_negatives: fn,
      precision: Math.round(precision * 10000) / 10000,
      recall: Math.round(recall * 10000) / 10000,
      f1_score: Math.round(f1 * 10000) / 10000,
      scenario_breakdown: breakdown
    };
  }

  // --- Audit Trail ---
  async getAuditEvents(): Promise<AuditEvent[]> {
    await this.initialize();
    return this.state.auditEvents;
  }

  private logAuditEvent(
    actorId: string, 
    action: string, 
    targetEntity: string, 
    targetId: string, 
    prevState: string | null, 
    newState: string, 
    metadata?: any
  ) {
    const eventId = `AUD-${(this.state.auditEvents.length + 1).toString().padStart(7, '0')}`;
    this.state.auditEvents.unshift({
      event_id: eventId,
      actor_employee_id: actorId,
      action_type: action,
      target_entity: targetEntity,
      target_id: targetId,
      previous_state: prevState,
      new_state: newState,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  // --- Export File Generator ---
  exportToCsv(table: string): string {
    const records = (this.state as any)[table] || [];
    if (!records.length) return '';
    const keys = Object.keys(records[0]);
    const lines = [keys.join(',')];
    for (const r of records) {
      lines.push(keys.map(k => {
        const val = r[k];
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val ?? '';
      }).join(','));
    }
    return lines.join('\n');
  }
}

export const dataService = new DataService();
