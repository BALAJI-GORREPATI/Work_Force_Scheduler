# Comprehensive Data Dictionary: Workforce Scheduler

**System**: Workforce Scheduling, Constraint Validation and Decision Traceability  
**Version**: 2.0.0  
**Domain**: Enterprise IT Workforce Operations  
**Deterministic Random Seed**: `20261022`  

---

## 1. Overview & Architectural Principles

This document defines the data dictionary for all core, bridge, supporting, and audit entities within the Workforce Scheduler. 

### Key Principles
1. **Deterministic IDs**: Every entity utilizes immutable, zero-padded, prefixed identifiers (e.g., `EMP-000001`, `SHIFT-2026-01-01-A`, `LVE-2026-000001`, `SWP-2026-000001`, `ATT-<emp_id>-<timestamp>`).
2. **IT Industry Only**: All skills, categories, job titles, and operational constraints are strictly restricted to Information Technology and Software Engineering disciplines.
3. **Derived vs. Source Distinction**: Values such as scheduled hours, actual working hours, overtime hours, coverage rates, and anomaly detection results are mathematically derived from primary operational events.
4. **Lifecycle Traceability**: State transitions (such as Leave status or Swap status) are tracked as explicit events with approver attribution and timestamps. Historical records are preserved; decisions are never overwritten destructively.
5. **Ground Truth Isolation**: Anomaly ground-truth labels are maintained in an isolated structure separate from operational scheduling inputs to avoid data leakage during evaluation.

---

## 2. Core Entities

### 2.1 Employee (`employees`)
Represents an individual professional eligible for workforce scheduling.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `employee_id` | VARCHAR(16) | NO | PK | Format: `EMP-[0-9]{6}` | None | Source | Primary key. Deterministic 6-digit zero-padded counter. |
| `first_name` | VARCHAR(64) | NO | NO | Text (A-Z) | None | Source | Employee given name. |
| `last_name` | VARCHAR(64) | NO | NO | Text (A-Z) | None | Source | Employee surname. |
| `email` | VARCHAR(128) | NO | UNIQUE | Valid RFC-5322 synthetic email | None | Source | Deterministic email: `{first}.{last}.{id}@techcorp.synthetic`. |
| `primary_team_id` | VARCHAR(16) | NO | FK | References `teams(team_id)` | None | Source | Primary organizational team assignment. |
| `it_job_role` | VARCHAR(64) | NO | NO | Standard IT Job Titles | None | Source | Strict IT role (e.g., Senior Backend Engineer, DevOps Specialist). |
| `employment_status`| VARCHAR(24) | NO | NO | `ACTIVE`, `ON_LEAVE`, `TERMINATED` | `ACTIVE` | Source | Operational scheduling eligibility status. |
| `employment_type` | VARCHAR(24) | NO | NO | `FULL_TIME`, `PART_TIME`, `CONTRACTOR` | `FULL_TIME` | Source | Governs default weekly hours. |
| `weekly_max_hours` | NUMERIC(4,1)| NO | NO | 20.0 to 40.0 | 40.0 | Source | Maximum regular contractual hours per 7-day rolling window. |
| `overtime_cap_hours`| NUMERIC(4,1)| NO | NO | 0.0 to 12.0 | 8.0 | Source | Maximum permitted overtime per week. Standard max total: 48.0 hrs. |
| `hire_date` | DATE | NO | NO | ISO Date <= Current Date | None | Source | Date joined company. Must precede all shift assignments. |
| `created_at` | TIMESTAMPTZ | NO | NO | Valid Timestamp | `NOW()` | Source | Record creation timestamp. |
| `updated_at` | TIMESTAMPTZ | NO | NO | Valid Timestamp | `NOW()` | Source | Last modification timestamp. |

---

### 2.2 Team (`teams`)
Represents an IT organizational engineering or operational squad (100 teams required).

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `team_id` | VARCHAR(16) | NO | PK | Format: `TEAM-[0-9]{3}` | None | Source | Primary key. Deterministic 3-digit zero-padded counter (`TEAM-001` to `TEAM-100`). |
| `team_name` | VARCHAR(128) | NO | UNIQUE | Curated IT Squad Names | None | Source | Descriptive team name (e.g., "Cloud Infrastructure Alpha", "Backend Core"). |
| `department` | VARCHAR(64) | NO | NO | IT Domain Departments | None | Source | Department grouping (e.g., "Platform Engineering", "Core Products", "Data & AI"). |
| `manager_employee_id`| VARCHAR(16)| YES | FK | References `employees(employee_id)`| NULL | Source | Squad lead or engineering manager responsible for approvals. |
| `created_at` | TIMESTAMPTZ | NO | NO | Valid Timestamp | `NOW()` | Source | Record creation timestamp. |

---

### 2.3 Skill (`skills`)
Curated taxonomy of purely IT-related competencies.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `skill_id` | VARCHAR(16) | NO | PK | Format: `SKILL-[0-9]{3}` | None | Source | Primary key (`SKILL-001` to `SKILL-060`). |
| `skill_name` | VARCHAR(64) | NO | UNIQUE | Text | None | Source | Technology or domain (e.g., Python, Kubernetes, PostgreSQL). |
| `category` | VARCHAR(64) | NO | NO | 7 Standard IT Categories | None | Source | Category taxonomy: `Software Engineering`, `Data Engineering & Analytics`, `AI & Machine Learning`, `Cloud & DevOps`, `Cybersecurity & Networking`, `Software Quality Assurance`, `Databases & Operations`. |
| `description` | TEXT | YES | NO | Freeform text | NULL | Source | Detailed scope of the technical skill. |
| `created_at` | TIMESTAMPTZ | NO | NO | Valid Timestamp | `NOW()` | Source | Record creation timestamp. |

---

### 2.4 EmployeeSkill (`employee_skills`)
Bridge entity capturing IT competencies and verified proficiency for each employee.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `employee_skill_id`| VARCHAR(24) | NO | PK | Format: `ESK-[0-9]{7}` | None | Source | Primary key. |
| `employee_id` | VARCHAR(16) | NO | FK | References `employees(employee_id)` | None | Source | Assigned employee. Compound unique with `skill_id`. |
| `skill_id` | VARCHAR(16) | NO | FK | References `skills(skill_id)` | None | Source | Target IT skill. |
| `proficiency_level`| VARCHAR(24) | NO | NO | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` | None | Source | Numerical weight: 1=Beg, 2=Int, 3=Adv, 4=Exp. |
| `years_experience` | NUMERIC(3,1)| NO | NO | 0.5 to 25.0 | 1.0 | Source | Professional tenure with the given technology. |
| `certified` | BOOLEAN | NO | NO | `TRUE`, `FALSE` | `FALSE` | Source | Flag indicating formal industry certification. |

---

### 2.5 ShiftTemplate (`shift_templates`)
Reusable template establishing operational shifts and hour boundaries.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `template_id` | VARCHAR(16) | NO | PK | Format: `TMPL-[0-9]{2}` | None | Source | Primary key (`TMPL-01` to `TMPL-06`). |
| `shift_name` | VARCHAR(64) | NO | NO | Text | None | Source | Descriptive label: "Morning Operations", "Evening Operations", "Night On-Call". |
| `shift_code` | VARCHAR(16) | NO | UNIQUE | `MORN`, `AFTN`, `NGHT`, etc. | None | Source | Short code identifier used in generation suffixes. |
| `start_time` | TIME | NO | NO | `00:00:00` to `23:59:59` | None | Source | Daily start time boundary (e.g. 06:00, 14:00, 22:00). |
| `end_time` | TIME | NO | NO | `00:00:00` to `23:59:59` | None | Source | Daily end time boundary. |
| `duration_hours` | NUMERIC(4,2)| NO | NO | 4.0 to 12.0 | 8.00 | Derived | Duration in hours. For overnight shifts: `(end_time + 24 - start_time) mod 24`. |
| `is_overnight` | BOOLEAN | NO | NO | `TRUE`, `FALSE` | `FALSE` | Derived | Computed true when `end_time <= start_time`. |
| `active` | BOOLEAN | NO | NO | `TRUE`, `FALSE` | `TRUE` | Source | Template availability flag. |

---

### 2.6 ShiftOccurrence (`shift_occurrences`)
A concrete, dated occurrence of a shift template for a specific team on a specific date.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `shift_id` | VARCHAR(32) | NO | PK | Format: `SHIFT-YYYY-MM-DD-<code>-<team_id>` | None | Source | Primary key. Deterministic date and team occurrence identifier. |
| `template_id` | VARCHAR(16) | NO | FK | References `shift_templates(template_id)`| None | Source | Underlying shift template reference. |
| `team_id` | VARCHAR(16) | NO | FK | References `teams(team_id)` | None | Source | Team hosting the shift. |
| `shift_date` | DATE | NO | NO | Within the 90-day horizon | None | Source | Calendar date for the start of the shift. |
| `start_datetime` | TIMESTAMPTZ | NO | NO | Valid Timestamp | None | Derived | Computed starting timestamp from `shift_date` + `start_time`. |
| `end_datetime` | TIMESTAMPTZ | NO | NO | Valid Timestamp | None | Derived | Computed completion timestamp across calendar day if overnight. |
| `is_overnight` | BOOLEAN | NO | NO | `TRUE`, `FALSE` | `FALSE` | Derived | Inherited from template. |
| `status` | VARCHAR(24) | NO | NO | `SCHEDULED`, `COMPLETED`, `CANCELLED` | `SCHEDULED` | Source | Operational lifecycle status of the shift occurrence. |

---

### 2.7 ShiftAssignment (`shift_assignments`)
Represents an individual employee scheduled to work a specific shift occurrence.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `assignment_id` | VARCHAR(32) | NO | PK | Format: `ASG-[0-9]{7}` | None | Source | Primary key. Unique assignment counter. |
| `shift_id` | VARCHAR(32) | NO | FK | References `shift_occurrences(shift_id)` | None | Source | Associated shift occurrence. |
| `employee_id` | VARCHAR(16) | NO | FK | References `employees(employee_id)` | None | Source | Assigned team member. Must have no overlapping assignments. |
| `schedule_run_id`| VARCHAR(24) | YES | FK | References `schedule_runs(run_id)` | NULL | Source | Traceable link to the optimization run that created the assignment. |
| `assignment_status`| VARCHAR(24)| NO | NO | `ASSIGNED`, `CONFIRMED`, `SWAPPED`, `ABSENT`, `CANCELLED` | `ASSIGNED` | Source | Current status. Transitions to `SWAPPED` upon authorized swap. |
| `assigned_role` | VARCHAR(64) | YES | NO | Text | NULL | Source | Role or primary competency fulfilled for the shift. |
| `scheduled_hours`| NUMERIC(4,2)| NO | NO | 4.00 to 12.00 | 8.00 | Derived | Duration inherited from the shift template. |
| `created_at` | TIMESTAMPTZ | NO | NO | Valid Timestamp | `NOW()` | Source | Creation timestamp. |
| `updated_at` | TIMESTAMPTZ | NO | NO | Valid Timestamp | `NOW()` | Source | Last modification timestamp. |

---

### 2.8 LeaveRequest (`leave_requests`)
Employee request for time off. (Exactly 5,000 records generated for full dataset).

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `leave_id` | VARCHAR(24) | NO | PK | Format: `LVE-2026-[0-9]{6}` | None | Source | Deterministic primary key (`LVE-2026-000001` to `LVE-2026-005000`). |
| `employee_id` | VARCHAR(16) | NO | FK | References `employees(employee_id)` | None | Source | Requesting employee. |
| `start_date` | DATE | NO | NO | Within scheduling period | None | Source | First day of leave. Must be `<= end_date`. |
| `end_date` | DATE | NO | NO | Within scheduling period | None | Source | Final day of leave. Must be `>= start_date`. |
| `leave_type` | VARCHAR(24) | NO | NO | `ANNUAL`, `SICK`, `PARENTAL`, `UNPAID`, `STUDY` | None | Source | Formal category of absence. |
| `reason` | TEXT | YES | NO | Text description | NULL | Source | Optional employee commentary. |
| `status` | VARCHAR(24) | NO | NO | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` | `PENDING`| Source | Current lifecycle status. |
| `request_timestamp`| TIMESTAMPTZ | NO | NO | Valid Timestamp | None | Source | When the employee initiated the request. |
| `approver_employee_id`| VARCHAR(16)| YES | FK | References `employees(employee_id)` | NULL | Source | Approving manager. Cannot be the requesting employee. |
| `decision_timestamp`| TIMESTAMPTZ| YES | NO | Valid Timestamp | NULL | Source | Timestamp when approved or rejected. Must be `>= request_timestamp`. |
| `decision_notes` | TEXT | YES | NO | Manager comments | NULL | Source | Formal reason or comments for decision. |

---

### 2.9 HolidayCalendar (`holiday_calendars`)
Public and corporate holidays observed over the 90-day scheduling period.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `holiday_id` | VARCHAR(24) | NO | PK | Format: `HOL-2026-[0-9]{2}` | None | Source | Primary key. |
| `holiday_date` | DATE | NO | NO | Within 90-day horizon | None | Source | Specific calendar day observed. |
| `holiday_name` | VARCHAR(128) | NO | NO | Text | None | Source | Holiday name (e.g., "New Year's Day", "Tech Innovations Day"). |
| `region_scope` | VARCHAR(32) | NO | NO | `GLOBAL`, `US`, `EU`, `APAC` | `GLOBAL` | Source | Geographic or jurisdictional applicability. |
| `is_paid` | BOOLEAN | NO | NO | `TRUE`, `FALSE` | `TRUE` | Source | Whether day counts as paid statutory holiday. |
| `created_at` | TIMESTAMPTZ | NO | NO | Valid Timestamp | `NOW()` | Source | Record creation timestamp. |

---

### 2.10 AttendanceEvent (`attendance_events`)
Clock-in/out and operational attendance reconciliation events.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `attendance_id` | VARCHAR(64) | NO | PK | Format: `ATT-<emp_id>-<timestamp>-<seq>` | None | Source | Unique deterministic identifier. |
| `employee_id` | VARCHAR(16) | NO | FK | References `employees(employee_id)` | None | Source | Target employee. |
| `assignment_id` | VARCHAR(32) | YES | FK | References `shift_assignments(assignment_id)`| NULL | Source | Scheduled assignment being reconciled. |
| `event_timestamp`| TIMESTAMPTZ | NO | NO | Valid Timestamp | None | Source | Exact time the attendance punch was recorded. |
| `event_type` | VARCHAR(24) | NO | NO | `CHECK_IN`, `CHECK_OUT`, `ABSENCE_FLAG` | None | Source | Nature of the recorded event. |
| `status` | VARCHAR(24) | NO | NO | `ON_TIME`, `LATE`, `EARLY_DEPARTURE`, `UNEXCUSED_ABSENCE` | `ON_TIME` | Derived | Computed status comparing actual punch against scheduled start/end. |
| `actual_hours_worked`| NUMERIC(4,2)| YES | NO | 0.00 to 16.00 | NULL | Derived | Reconciled net hours from paired check-in and check-out punches. |

---

### 2.11 CoverageRequirement (`coverage_requirements`)
Staffing and skill demand specification for shift occurrences.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `requirement_id` | VARCHAR(32) | NO | PK | Format: `REQ-[0-9]{7}` | None | Source | Primary key. |
| `shift_id` | VARCHAR(32) | NO | FK | References `shift_occurrences(shift_id)` | None | Source | Target shift requiring coverage. |
| `team_id` | VARCHAR(16) | NO | FK | References `teams(team_id)` | None | Source | Operational squad. |
| `required_headcount`| INTEGER | NO | NO | 1 to 10 | 1 | Source | Required number of staff fulfilling this condition. |
| `required_skill_id`| VARCHAR(16) | YES | FK | References `skills(skill_id)` | NULL | Source | Required IT competency (NULL for general headcount). |
| `min_proficiency` | VARCHAR(24) | YES | NO | `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT` | NULL | Source | Minimum skill level required to qualify. |
| `is_critical` | BOOLEAN | NO | NO | `TRUE`, `FALSE` | `TRUE` | Source | High priority hard constraint flag. |
| `effective_date` | DATE | NO | NO | Valid Date | None | Source | Date requirement is active. |

---

### 2.12 SwapRequest (`swap_requests`)
Complete lifecycle record for shift swap requests between employees.

| Field Name | Data Type | Nullable | Uniqueness | Allowed Values / Enum | Default | Source/Derived | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `swap_id` | VARCHAR(24) | NO | PK | Format: `SWP-2026-[0-9]{6}` | None | Source | Deterministic primary key. |
| `requesting_employee_id`| VARCHAR(16)| NO | FK | References `employees(employee_id)` | None | Source | Originator requesting the exchange. |
| `original_assignment_id`| VARCHAR(32)| NO | FK | References `shift_assignments(assignment_id)`| None | Source | Assignment to be traded away. |
| `target_employee_id`| VARCHAR(16)| NO | FK | References `employees(employee_id)` | None | Source | Proposed peer filling the shift. |
| `target_assignment_id`| VARCHAR(32)| YES | FK | References `shift_assignments(assignment_id)`| NULL | Source | Optional counterpart assignment in direct 1-to-1 swap. |
| `reason` | TEXT | YES | NO | Text commentary | NULL | Source | Stated justification for exchange. |
| `status` | VARCHAR(24) | NO | NO | `PENDING_MANAGER`, `APPROVED`, `REJECTED`, `APPLIED`, `CANCELLED` | `PENDING_MANAGER` | Source | Explicit lifecycle state. |
| `approver_employee_id`| VARCHAR(16)| YES | FK | References `employees(employee_id)` | NULL | Source | Authorized manager approving the swap. |
| `request_timestamp`| TIMESTAMPTZ | NO | NO | Valid Timestamp | None | Source | Initiation timestamp. |
| `decision_timestamp`| TIMESTAMPTZ| YES | NO | Valid Timestamp | NULL | Source | Approval/rejection timestamp. |
| `applied_timestamp`| TIMESTAMPTZ| YES | NO | Valid Timestamp | NULL | Source | Timestamp when assignments were updated. Must follow approval. |

---

## 3. Supporting, Audit & Verification Entities

### 3.1 ScheduleRun (`schedule_runs`)
Preserves metadata, input parameters, and aggregate outcomes for every scheduling execution.

| Field Name | Data Type | Nullable | Uniqueness | Description |
| :--- | :--- | :--- | :--- | :--- |
| `run_id` | VARCHAR(32) | NO | PK | Format: `RUN-YYYYMMDD-[0-9]{3}` |
| `start_date` | DATE | NO | NO | Horizon start date. |
| `end_date` | DATE | NO | NO | Horizon end date. |
| `algorithm` | VARCHAR(64) | NO | NO | Algorithm strategy (e.g. `CONSTRAINT_PROPAGATION_FAIRNESS`). |
| `status` | VARCHAR(24) | NO | NO | Execution state: `SUCCESS`, `PARTIAL`, `FAILED`. |
| `total_shifts` | INTEGER | NO | NO | Total shift occurrences evaluated. |
| `assigned_shifts` | INTEGER | NO | NO | Number of successful assignments made. |
| `uncovered_shifts`| INTEGER | NO | NO | Number of uncovered headcount/skill slots. |
| `coverage_rate` | NUMERIC(5,2)| NO | NO | `(assigned_shifts / (assigned_shifts + uncovered_shifts)) * 100`. |
| `skill_coverage_rate`| NUMERIC(5,2)| NO | NO | Percentage of skill-specific requirements satisfied. |
| `runtime_seconds` | NUMERIC(6,3)| NO | NO | Computational runtime in seconds. |
| `created_at` | TIMESTAMPTZ | NO | NO | Execution initiation timestamp. |

---

### 3.2 ValidationIssue (`validation_issues`)
Structured findings produced by the validation engine during data auditing.

| Field Name | Data Type | Nullable | Uniqueness | Description |
| :--- | :--- | :--- | :--- | :--- |
| `issue_id` | VARCHAR(32) | NO | PK | Format: `ISS-[0-9]{7}` |
| `issue_type` | VARCHAR(48) | NO | NO | Enum: `DOUBLE_BOOKING`, `LEAVE_CONFLICT`, `SKILL_MISSING`, `OVERTIME_EXCEEDED`, `UNAPPROVED_SWAP_APPLIED`, `INTEGRITY_VIOLATION`. |
| `affected_entity` | VARCHAR(32) | NO | NO | Target table name (e.g. `shift_assignments`). |
| `record_id` | VARCHAR(64) | NO | NO | Primary key of the offending record. |
| `related_record_id`| VARCHAR(64)| YES | NO | Associated record causing conflict (e.g. overlapping shift or leave). |
| `rule_violated` | VARCHAR(128) | NO | NO | Specific business constraint violated. |
| `severity` | VARCHAR(16) | NO | NO | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`. |
| `description` | TEXT | NO | NO | Detailed diagnosis of the rule breach. |
| `corrective_action`| TEXT | YES | NO | Recommended remediation step. |
| `detected_at` | TIMESTAMPTZ | NO | NO | Timestamp when audit identified the issue. |

---

### 3.3 AnomalyGroundTruth (`anomaly_ground_truth`)
Ground-truth registry of intentionally injected anomalies for benchmark evaluation. Isolated from runtime scheduling inputs.

| Field Name | Data Type | Nullable | Uniqueness | Description |
| :--- | :--- | :--- | :--- | :--- |
| `anomaly_id` | VARCHAR(32) | NO | PK | Format: `ANOM-[0-9]{4}` |
| `scenario_type` | VARCHAR(48) | NO | NO | Enum: `SCENARIO_1_DOUBLE_BOOKING`, `SCENARIO_2_LEAVE_CONFLICT`, `SCENARIO_3_SKILL_ABSENT`, `SCENARIO_4_OVERTIME_CAP_EXCEEDED`, `SCENARIO_5_UNAPPROVED_SWAP_APPLIED`. |
| `affected_entity` | VARCHAR(32) | NO | NO | Target entity name. |
| `record_id` | VARCHAR(64) | NO | NO | Specific identifier of injected record. |
| `related_record_id`| VARCHAR(64)| YES | NO | Associated conflicting record ID. |
| `rule_violated` | VARCHAR(128) | NO | NO | Formal constraint rule tested. |
| `expected_severity`| VARCHAR(16)| NO | NO | Target severity for validator detection. |
| `baseline_reference`| VARCHAR(64)| NO | NO | Original valid record identifier prior to anomaly perturbation. |
| `injected_details` | TEXT | NO | NO | Human-readable explanation of perturbation. |

---

### 3.4 AuditEvent (`audit_events`)
Immutable audit log preserving all security and workflow state transitions.

| Field Name | Data Type | Nullable | Uniqueness | Description |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | VARCHAR(32) | NO | PK | Format: `AUD-[0-9]{7}` |
| `actor_employee_id`| VARCHAR(16)| NO | NO | Employee or User executing the operation. |
| `action_type` | VARCHAR(48) | NO | NO | `LEAVE_DECISION`, `SWAP_REQUEST`, `SWAP_DECISION`, `SWAP_APPLICATION`, `SCHEDULE_GENERATION`, `VALIDATION_EXECUTION`. |
| `target_entity` | VARCHAR(32) | NO | NO | Entity table modified. |
| `target_id` | VARCHAR(64) | NO | NO | Primary key of modified entity. |
| `previous_state` | VARCHAR(32) | YES | NO | Prior lifecycle status. |
| `new_state` | VARCHAR(32) | NO | NO | Resulting lifecycle status. |
| `timestamp` | TIMESTAMPTZ | NO | NO | Exact timestamp of event. |
| `metadata` | JSONB | YES | NO | Contextual parameters and decision notes. |

---

### 3.5 UserProfile (`user_profiles`)
Maps Supabase Authentication `auth.users` to workforce identities and RBAC roles.

| Field Name | Data Type | Nullable | Uniqueness | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | UUID | NO | PK | Supabase `auth.users(id)` foreign key. |
| `employee_id` | VARCHAR(16) | NO | UNIQUE | References `employees(employee_id)`. |
| `role` | VARCHAR(24) | NO | NO | `EMPLOYEE`, `MANAGER`, `HR_PARTNER`, `IT_OPS_PARTNER`, `ADMIN`. |
| `created_at` | TIMESTAMPTZ | NO | NO | Profile registration timestamp. |

---

## 4. Derived Metric Formulas & Business Rules

1. **Scheduled Hours**:
   $$\text{scheduled\_hours} = \begin{cases} 
   \text{end\_time} - \text{start\_time} & \text{if } \text{end\_time} > \text{start\_time} \\
   (24 - \text{start\_time}) + \text{end\_time} & \text{if } \text{is\_overnight = TRUE}
   \end{cases}$$

2. **Weekly Overtime Calculation**:
   $$\text{weekly\_overtime} = \max\left(0, \sum_{d=1}^{7} \text{actual\_hours}_{d} - \text{weekly\_max\_hours}\right)$$
   Constraint: $\text{weekly\_overtime} \le \text{overtime\_cap\_hours}$. Overtime violation triggered if $> 8.0$ hours or total $> 48.0$ hours.

3. **Coverage Rate**:
   $$\text{Coverage Rate} = \frac{\text{Assigned Headcount}}{\text{Required Headcount}} \times 100\%$$

4. **Skill Coverage Rate**:
   $$\text{Skill Coverage Rate} = \frac{\sum \text{Satisfied Skill Slots}}{\sum \text{Required Skill Slots}} \times 100\%$$

5. **Workforce Fairness Metric (Workload Variance / Coefficient of Variation)**:
   $$CV = \frac{\sigma_{\text{hours}}}{\mu_{\text{hours}}}$$
   Measures equitable hour distribution across team members. A lower value signifies higher schedule fairness.
