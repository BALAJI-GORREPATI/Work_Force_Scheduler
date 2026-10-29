"""
Workforce Scheduler - Core Entity Models
Compliant with schema.md and data_dictionary.md
Strict typing, IT-only constraints, deterministic structure
"""

from datetime import date, datetime, time
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr

class EmploymentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ON_LEAVE = "ON_LEAVE"
    TERMINATED = "TERMINATED"

class EmploymentType(str, Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACTOR = "CONTRACTOR"

class SkillCategory(str, Enum):
    SOFTWARE_ENG = "Software Engineering"
    DATA_ENG = "Data Engineering & Analytics"
    AI_ML = "AI & Machine Learning"
    CLOUD_DEVOPS = "Cloud & DevOps"
    SECURITY_NET = "Cybersecurity & Networking"
    QA_TESTING = "Software Quality Assurance"
    DB_OPS = "Databases & Operations"

class ProficiencyLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"

class LeaveType(str, Enum):
    ANNUAL = "ANNUAL"
    SICK = "SICK"
    PARENTAL = "PARENTAL"
    UNPAID = "UNPAID"
    STUDY = "STUDY"

class LeaveStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class ShiftAssignmentStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    CONFIRMED = "CONFIRMED"
    SWAPPED = "SWAPPED"
    ABSENT = "ABSENT"
    CANCELLED = "CANCELLED"

class SwapStatus(str, Enum):
    PENDING_MANAGER = "PENDING_MANAGER"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    APPLIED = "APPLIED"
    CANCELLED = "CANCELLED"

class AttendanceEventType(str, Enum):
    CHECK_IN = "CHECK_IN"
    CHECK_OUT = "CHECK_OUT"
    ABSENCE_FLAG = "ABSENCE_FLAG"

class AttendanceStatus(str, Enum):
    ON_TIME = "ON_TIME"
    LATE = "LATE"
    EARLY_DEPARTURE = "EARLY_DEPARTURE"
    UNEXCUSED_ABSENCE = "UNEXCUSED_ABSENCE"

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class AnomalyScenarioType(str, Enum):
    DOUBLE_BOOKING = "SCENARIO_1_DOUBLE_BOOKING"
    LEAVE_CONFLICT = "SCENARIO_2_LEAVE_CONFLICT"
    SKILL_ABSENT = "SCENARIO_3_SKILL_ABSENT"
    OVERTIME_EXCEEDED = "SCENARIO_4_OVERTIME_CAP_EXCEEDED"
    UNAPPROVED_SWAP = "SCENARIO_5_UNAPPROVED_SWAP_APPLIED"

# 1. Team Model
class Team(BaseModel):
    team_id: str = Field(..., pattern=r"^TEAM-[0-9]{3}$")
    team_name: str
    department: str
    manager_employee_id: Optional[str] = None
    created_at: str

# 2. Skill Model
class Skill(BaseModel):
    skill_id: str = Field(..., pattern=r"^SKILL-[0-9]{3}$")
    skill_name: str
    category: SkillCategory
    description: Optional[str] = None
    created_at: str

# 3. Employee Model
class Employee(BaseModel):
    employee_id: str = Field(..., pattern=r"^EMP-[0-9]{6}$")
    first_name: str
    last_name: str
    email: str
    primary_team_id: str
    it_job_role: str
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    weekly_max_hours: float = 40.0
    overtime_cap_hours: float = 8.0
    hire_date: str
    created_at: str
    updated_at: str

# 4. EmployeeSkill Bridge
class EmployeeSkill(BaseModel):
    employee_skill_id: str = Field(..., pattern=r"^ESK-[0-9]{7}$")
    employee_id: str
    skill_id: str
    proficiency_level: ProficiencyLevel
    years_experience: float
    certified: bool = False
    created_at: str

# 5. ShiftTemplate
class ShiftTemplate(BaseModel):
    template_id: str = Field(..., pattern=r"^TMPL-[0-9]{2}$")
    shift_name: str
    shift_code: str
    start_time: str
    end_time: str
    duration_hours: float
    is_overnight: bool = False
    active: bool = True
    created_at: str

# 6. ShiftOccurrence
class ShiftOccurrence(BaseModel):
    shift_id: str
    template_id: str
    team_id: str
    shift_date: str
    start_datetime: str
    end_datetime: str
    is_overnight: bool = False
    status: str = "SCHEDULED"
    created_at: str

# 7. CoverageRequirement
class CoverageRequirement(BaseModel):
    requirement_id: str = Field(..., pattern=r"^REQ-[0-9]{7}$")
    shift_id: str
    team_id: str
    required_headcount: int = 1
    required_skill_id: Optional[str] = None
    min_proficiency: Optional[ProficiencyLevel] = None
    is_critical: bool = True
    effective_date: str
    created_at: str

# 8. ShiftAssignment
class ShiftAssignment(BaseModel):
    assignment_id: str = Field(..., pattern=r"^ASG-[0-9]{7}$")
    shift_id: str
    employee_id: str
    schedule_run_id: Optional[str] = None
    assignment_status: ShiftAssignmentStatus = ShiftAssignmentStatus.ASSIGNED
    assigned_role: Optional[str] = None
    scheduled_hours: float = 8.0
    created_at: str
    updated_at: str

# 9. LeaveRequest (5,000 distinct records)
class LeaveRequest(BaseModel):
    leave_id: str = Field(..., pattern=r"^LVE-2026-[0-9]{6}$")
    employee_id: str
    start_date: str
    end_date: str
    leave_type: LeaveType
    reason: Optional[str] = None
    status: LeaveStatus = LeaveStatus.PENDING
    request_timestamp: str
    approver_employee_id: Optional[str] = None
    decision_timestamp: Optional[str] = None
    decision_notes: Optional[str] = None

# 10. HolidayCalendar
class HolidayCalendar(BaseModel):
    holiday_id: str = Field(..., pattern=r"^HOL-2026-[0-9]{2}$")
    holiday_date: str
    holiday_name: str
    region_scope: str = "GLOBAL"
    is_paid: bool = True
    created_at: str

# 11. AttendanceEvent
class AttendanceEvent(BaseModel):
    attendance_id: str
    employee_id: str
    assignment_id: Optional[str] = None
    event_timestamp: str
    event_type: AttendanceEventType
    status: AttendanceStatus = AttendanceStatus.ON_TIME
    actual_hours_worked: Optional[float] = None
    created_at: str

# 12. SwapRequest
class SwapRequest(BaseModel):
    swap_id: str = Field(..., pattern=r"^SWP-2026-[0-9]{6}$")
    requesting_employee_id: str
    original_assignment_id: str
    target_employee_id: str
    target_assignment_id: Optional[str] = None
    reason: Optional[str] = None
    status: SwapStatus = SwapStatus.PENDING_MANAGER
    approver_employee_id: Optional[str] = None
    request_timestamp: str
    decision_timestamp: Optional[str] = None
    applied_timestamp: Optional[str] = None

# 13. Supporting: ScheduleRun
class ScheduleRun(BaseModel):
    run_id: str
    start_date: str
    end_date: str
    algorithm: str
    status: str = "SUCCESS"
    total_shifts: int = 0
    assigned_shifts: int = 0
    uncovered_shifts: int = 0
    coverage_rate: float = 0.0
    skill_coverage_rate: float = 0.0
    runtime_seconds: float = 0.0
    created_at: str

# 14. ValidationIssue
class ValidationIssue(BaseModel):
    issue_id: str
    issue_type: str
    affected_entity: str
    record_id: str
    related_record_id: Optional[str] = None
    rule_violated: str
    severity: SeverityLevel
    description: str
    corrective_action: Optional[str] = None
    detected_at: str

# 15. AnomalyGroundTruth
class AnomalyGroundTruth(BaseModel):
    anomaly_id: str
    scenario_type: AnomalyScenarioType
    affected_entity: str
    record_id: str
    related_record_id: Optional[str] = None
    rule_violated: str
    expected_severity: SeverityLevel
    baseline_reference: str
    injected_details: str
    created_at: str

# 16. AuditEvent
class AuditEvent(BaseModel):
    event_id: str
    actor_employee_id: str
    action_type: str
    target_entity: str
    target_id: str
    previous_state: Optional[str] = None
    new_state: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None
