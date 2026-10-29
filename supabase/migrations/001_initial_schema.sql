-- Migration: 001_initial_schema.sql
-- Description: Core schema for Workforce Scheduler (10 Core Entities + Bridge/Audit Tables)
-- RDBMS: PostgreSQL (Supabase)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teams (100 Teams)
CREATE TABLE IF NOT EXISTS teams (
    team_id VARCHAR(16) PRIMARY KEY,
    team_name VARCHAR(128) NOT NULL UNIQUE,
    department VARCHAR(64) NOT NULL,
    manager_employee_id VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Employees (2,000 Employees)
CREATE TABLE IF NOT EXISTS employees (
    employee_id VARCHAR(16) PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    primary_team_id VARCHAR(16) NOT NULL REFERENCES teams(team_id) ON DELETE RESTRICT,
    it_job_role VARCHAR(64) NOT NULL,
    employment_status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE', 'ON_LEAVE', 'TERMINATED')),
    employment_type VARCHAR(24) NOT NULL DEFAULT 'FULL_TIME' CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACTOR')),
    weekly_max_hours NUMERIC(4,1) NOT NULL DEFAULT 40.0 CHECK (weekly_max_hours > 0),
    overtime_cap_hours NUMERIC(4,1) NOT NULL DEFAULT 8.0 CHECK (overtime_cap_hours >= 0),
    hire_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add manager foreign key constraint to teams now that employees table exists
ALTER TABLE teams 
    ADD CONSTRAINT fk_teams_manager 
    FOREIGN KEY (manager_employee_id) 
    REFERENCES employees(employee_id) 
    ON DELETE SET NULL;

-- 3. Skills (IT-only competencies)
CREATE TABLE IF NOT EXISTS skills (
    skill_id VARCHAR(16) PRIMARY KEY,
    skill_name VARCHAR(64) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL CHECK (category IN (
        'Software Engineering',
        'Data Engineering & Analytics',
        'AI & Machine Learning',
        'Cloud & DevOps',
        'Cybersecurity & Networking',
        'Software Quality Assurance',
        'Databases & Operations'
    )),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EmployeeSkill (Bridge Table)
CREATE TABLE IF NOT EXISTS employee_skills (
    employee_skill_id VARCHAR(24) PRIMARY KEY,
    employee_id VARCHAR(16) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    skill_id VARCHAR(16) NOT NULL REFERENCES skills(skill_id) ON DELETE RESTRICT,
    proficiency_level VARCHAR(24) NOT NULL CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    years_experience NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (years_experience >= 0),
    certified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_employee_skill UNIQUE (employee_id, skill_id)
);

-- 5. ShiftTemplate
CREATE TABLE IF NOT EXISTS shift_templates (
    template_id VARCHAR(16) PRIMARY KEY,
    shift_name VARCHAR(64) NOT NULL,
    shift_code VARCHAR(16) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours NUMERIC(4,2) NOT NULL CHECK (duration_hours > 0),
    is_overnight BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ShiftOccurrence (Dated Shift Instances)
CREATE TABLE IF NOT EXISTS shift_occurrences (
    shift_id VARCHAR(32) PRIMARY KEY,
    template_id VARCHAR(16) NOT NULL REFERENCES shift_templates(template_id) ON DELETE RESTRICT,
    team_id VARCHAR(16) NOT NULL REFERENCES teams(team_id) ON DELETE RESTRICT,
    shift_date DATE NOT NULL,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    is_overnight BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(24) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ScheduleRun (Optimization Run Tracker)
CREATE TABLE IF NOT EXISTS schedule_runs (
    run_id VARCHAR(32) PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    algorithm VARCHAR(64) NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PARTIAL', 'FAILED')),
    total_shifts INTEGER NOT NULL DEFAULT 0,
    assigned_shifts INTEGER NOT NULL DEFAULT 0,
    uncovered_shifts INTEGER NOT NULL DEFAULT 0,
    coverage_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    skill_coverage_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    runtime_seconds NUMERIC(6,3) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ShiftAssignment (Scheduled Workers)
CREATE TABLE IF NOT EXISTS shift_assignments (
    assignment_id VARCHAR(32) PRIMARY KEY,
    shift_id VARCHAR(32) NOT NULL REFERENCES shift_occurrences(shift_id) ON DELETE CASCADE,
    employee_id VARCHAR(16) NOT NULL REFERENCES employees(employee_id) ON DELETE RESTRICT,
    schedule_run_id VARCHAR(32) REFERENCES schedule_runs(run_id) ON DELETE SET NULL,
    assignment_status VARCHAR(24) NOT NULL DEFAULT 'ASSIGNED' CHECK (assignment_status IN ('ASSIGNED', 'CONFIRMED', 'SWAPPED', 'ABSENT', 'CANCELLED')),
    assigned_role VARCHAR(64),
    scheduled_hours NUMERIC(4,2) NOT NULL DEFAULT 8.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. LeaveRequest (5,000 Records)
CREATE TABLE IF NOT EXISTS leave_requests (
    leave_id VARCHAR(24) PRIMARY KEY,
    employee_id VARCHAR(16) NOT NULL REFERENCES employees(employee_id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(24) NOT NULL CHECK (leave_type IN ('ANNUAL', 'SICK', 'PARENTAL', 'UNPAID', 'STUDY')),
    reason TEXT,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    request_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approver_employee_id VARCHAR(16) REFERENCES employees(employee_id) ON DELETE SET NULL,
    decision_timestamp TIMESTAMPTZ,
    decision_notes TEXT,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

-- 10. HolidayCalendar
CREATE TABLE IF NOT EXISTS holiday_calendars (
    holiday_id VARCHAR(24) PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name VARCHAR(128) NOT NULL,
    region_scope VARCHAR(32) NOT NULL DEFAULT 'GLOBAL',
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AttendanceEvent
CREATE TABLE IF NOT EXISTS attendance_events (
    attendance_id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(16) NOT NULL REFERENCES employees(employee_id) ON DELETE RESTRICT,
    assignment_id VARCHAR(32) REFERENCES shift_assignments(assignment_id) ON DELETE SET NULL,
    event_timestamp TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(24) NOT NULL CHECK (event_type IN ('CHECK_IN', 'CHECK_OUT', 'ABSENCE_FLAG')),
    status VARCHAR(24) NOT NULL DEFAULT 'ON_TIME' CHECK (status IN ('ON_TIME', 'LATE', 'EARLY_DEPARTURE', 'UNEXCUSED_ABSENCE')),
    actual_hours_worked NUMERIC(4,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CoverageRequirement (Demand)
CREATE TABLE IF NOT EXISTS coverage_requirements (
    requirement_id VARCHAR(32) PRIMARY KEY,
    shift_id VARCHAR(32) NOT NULL REFERENCES shift_occurrences(shift_id) ON DELETE CASCADE,
    team_id VARCHAR(16) NOT NULL REFERENCES teams(team_id) ON DELETE RESTRICT,
    required_headcount INTEGER NOT NULL DEFAULT 1 CHECK (required_headcount > 0),
    required_skill_id VARCHAR(16) REFERENCES skills(skill_id) ON DELETE RESTRICT,
    min_proficiency VARCHAR(24) CHECK (min_proficiency IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    is_critical BOOLEAN NOT NULL DEFAULT TRUE,
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. SwapRequest
CREATE TABLE IF NOT EXISTS swap_requests (
    swap_id VARCHAR(24) PRIMARY KEY,
    requesting_employee_id VARCHAR(16) NOT NULL REFERENCES employees(employee_id) ON DELETE RESTRICT,
    original_assignment_id VARCHAR(32) NOT NULL REFERENCES shift_assignments(assignment_id) ON DELETE RESTRICT,
    target_employee_id VARCHAR(16) NOT NULL REFERENCES employees(employee_id) ON DELETE RESTRICT,
    target_assignment_id VARCHAR(32) REFERENCES shift_assignments(assignment_id) ON DELETE SET NULL,
    reason TEXT,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING_MANAGER' CHECK (status IN ('PENDING_MANAGER', 'APPROVED', 'REJECTED', 'APPLIED', 'CANCELLED')),
    approver_employee_id VARCHAR(16) REFERENCES employees(employee_id) ON DELETE SET NULL,
    request_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_timestamp TIMESTAMPTZ,
    applied_timestamp TIMESTAMPTZ
);

-- 14. ValidationIssue
CREATE TABLE IF NOT EXISTS validation_issues (
    issue_id VARCHAR(32) PRIMARY KEY,
    issue_type VARCHAR(48) NOT NULL,
    affected_entity VARCHAR(32) NOT NULL,
    record_id VARCHAR(64) NOT NULL,
    related_record_id VARCHAR(64),
    rule_violated VARCHAR(128) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    description TEXT NOT NULL,
    corrective_action TEXT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. AnomalyGroundTruth (Isolated benchmark ground truth)
CREATE TABLE IF NOT EXISTS anomaly_ground_truth (
    anomaly_id VARCHAR(32) PRIMARY KEY,
    scenario_type VARCHAR(48) NOT NULL,
    affected_entity VARCHAR(32) NOT NULL,
    record_id VARCHAR(64) NOT NULL,
    related_record_id VARCHAR(64),
    rule_violated VARCHAR(128) NOT NULL,
    expected_severity VARCHAR(16) NOT NULL,
    baseline_reference VARCHAR(64) NOT NULL,
    injected_details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. AuditEvent
CREATE TABLE IF NOT EXISTS audit_events (
    event_id VARCHAR(32) PRIMARY KEY,
    actor_employee_id VARCHAR(16) NOT NULL,
    action_type VARCHAR(48) NOT NULL,
    target_entity VARCHAR(32) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    previous_state VARCHAR(32),
    new_state VARCHAR(32) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- 17. UserProfile
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY,
    employee_id VARCHAR(16) UNIQUE REFERENCES employees(employee_id) ON DELETE CASCADE,
    role VARCHAR(24) NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR_PARTNER', 'IT_OPS_PARTNER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_emp_team ON employees(primary_team_id);
CREATE INDEX IF NOT EXISTS idx_emp_role ON employees(it_job_role);
CREATE INDEX IF NOT EXISTS idx_emp_status ON employees(employment_status);

CREATE INDEX IF NOT EXISTS idx_es_emp ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_es_skill ON employee_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_shift_team_date ON shift_occurrences(team_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_asg_shift ON shift_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_asg_emp ON shift_assignments(employee_id);

CREATE INDEX IF NOT EXISTS idx_leave_emp_dates ON leave_requests(employee_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);

CREATE INDEX IF NOT EXISTS idx_cov_shift ON coverage_requirements(shift_id);
CREATE INDEX IF NOT EXISTS idx_att_emp_time ON attendance_events(employee_id, event_timestamp);
CREATE INDEX IF NOT EXISTS idx_swap_status ON swap_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_events(target_entity, target_id);

