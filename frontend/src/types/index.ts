export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR_PARTNER' | 'IT_OPS_PARTNER' | 'ADMIN';

export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  primary_team_id: string;
  it_job_role: string;
  employment_status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR';
  weekly_max_hours: number;
  overtime_cap_hours: number;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  team_id: string;
  team_name: string;
  department: string;
  manager_employee_id: string | null;
  created_at: string;
}

export interface Skill {
  skill_id: string;
  skill_name: string;
  category: string;
  description: string;
  created_at: string;
}

export interface EmployeeSkill {
  employee_skill_id: string;
  employee_id: string;
  skill_id: string;
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  years_experience: number;
  certified: boolean;
  created_at: string;
}

export interface ShiftTemplate {
  template_id: string;
  shift_name: string;
  shift_code: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  is_overnight: boolean;
  active: boolean;
  created_at: string;
}

export interface ShiftOccurrence {
  shift_id: string;
  template_id: string;
  team_id: string;
  shift_date: string;
  start_datetime: string;
  end_datetime: string;
  is_overnight: boolean;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface ShiftAssignment {
  assignment_id: string;
  shift_id: string;
  employee_id: string;
  schedule_run_id?: string;
  assignment_status: 'ASSIGNED' | 'CONFIRMED' | 'SWAPPED' | 'ABSENT' | 'CANCELLED';
  assigned_role: string;
  scheduled_hours: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  leave_id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: 'ANNUAL' | 'SICK' | 'PARENTAL' | 'UNPAID' | 'STUDY';
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  request_timestamp: string;
  approver_employee_id?: string | null;
  decision_timestamp?: string | null;
  decision_notes?: string | null;
}

export interface AttendanceEvent {
  attendance_id: string;
  employee_id: string;
  assignment_id?: string | null;
  event_timestamp: string;
  event_type: 'CHECK_IN' | 'CHECK_OUT' | 'ABSENCE_FLAG';
  status: 'ON_TIME' | 'LATE' | 'EARLY_DEPARTURE' | 'UNEXCUSED_ABSENCE';
  actual_hours_worked?: number | null;
  created_at: string;
}

export interface CoverageRequirement {
  requirement_id: string;
  shift_id: string;
  team_id: string;
  required_headcount: number;
  required_skill_id?: string | null;
  min_proficiency?: string | null;
  is_critical: boolean;
  effective_date: string;
  created_at: string;
}

export interface SwapRequest {
  swap_id: string;
  requesting_employee_id: string;
  original_assignment_id: string;
  target_employee_id: string;
  target_assignment_id?: string | null;
  reason?: string | null;
  status: 'PENDING_MANAGER' | 'APPROVED' | 'REJECTED' | 'APPLIED' | 'CANCELLED';
  approver_employee_id?: string | null;
  request_timestamp: string;
  decision_timestamp?: string | null;
  applied_timestamp?: string | null;
}

export interface ValidationIssue {
  issue_id: string;
  issue_type: string;
  affected_entity: string;
  record_id: string;
  related_record_id?: string | null;
  rule_violated: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  corrective_action?: string | null;
  detected_at: string;
}

export interface AnomalyGroundTruth {
  anomaly_id: string;
  scenario_type: string;
  affected_entity: string;
  record_id: string;
  related_record_id?: string | null;
  rule_violated: string;
  expected_severity: string;
  baseline_reference: string;
  injected_details: string;
  created_at: string;
}

export interface AuditEvent {
  event_id: string;
  actor_employee_id: string;
  action_type: string;
  target_entity: string;
  target_id: string;
  previous_state?: string | null;
  new_state: string;
  timestamp: string;
  metadata?: any;
}

export interface EvaluationBenchmark {
  expected_anomalies_count: number;
  detected_issues_count: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  precision: number;
  recall: number;
  f1_score: number;
  scenario_breakdown: Array<{
    anomaly_id: string;
    scenario_type: string;
    record_id: string;
    rule_violated: string;
    expected_severity: string;
    detected: boolean;
    status: 'PASS' | 'FAIL';
  }>;
}

