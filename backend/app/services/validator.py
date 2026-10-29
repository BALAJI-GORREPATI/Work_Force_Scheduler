"""
Workforce Scheduler - Constraint Validation Engine
Performs rigorous structural, relational, and business rule audits.
Generates structured ValidationIssue objects without modifying source records.
"""

from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Any, Set, Tuple

class WorkforceValidator:
    def __init__(self, data: Dict[str, Any]):
        self.data = data
        self.issues: List[Dict[str, Any]] = []
        self.issue_counter = 1

    def validate_all(self) -> List[Dict[str, Any]]:
        """Run all integrity checks and business constraint validations."""
        self._check_primary_keys()
        self._check_foreign_keys()
        self._check_double_booking()
        self._check_leave_conflicts()
        self._check_skill_requirements()
        self._check_weekly_overtime_limits()
        self._check_swap_lifecycle_integrity()
        
        return self.issues

    def _add_issue(self, issue_type: str, entity: str, record_id: str, 
                   rule_violated: str, severity: str, desc: str, 
                   related_id: str = None, action: str = None):
        issue_id = f"ISS-{self.issue_counter:07d}"
        self.issue_counter += 1
        self.issues.append({
            "issue_id": issue_id,
            "issue_type": issue_type,
            "affected_entity": entity,
            "record_id": record_id,
            "related_record_id": related_id,
            "rule_violated": rule_violated,
            "severity": severity,
            "description": desc,
            "corrective_action": action,
            "detected_at": datetime.now(timezone.utc).isoformat()
        })

    def _check_primary_keys(self):
        """Verify uniqueness of primary keys across all entities."""
        entities_pks = [
            ("employees", "employee_id"),
            ("teams", "team_id"),
            ("skills", "skill_id"),
            ("employee_skills", "employee_skill_id"),
            ("shift_templates", "template_id"),
            ("shift_occurrences", "shift_id"),
            ("shift_assignments", "assignment_id"),
            ("leave_requests", "leave_id"),
            ("coverage_requirements", "requirement_id"),
            ("swap_requests", "swap_id")
        ]
        
        for table, pk_col in entities_pks:
            records = self.data.get(table, [])
            seen = set()
            for rec in records:
                pk_val = rec.get(pk_col)
                if pk_val in seen:
                    self._add_issue(
                        "DUPLICATE_PRIMARY_KEY", table, str(pk_val),
                        "PRIMARY_KEY_UNIQUENESS", "CRITICAL",
                        f"Duplicate primary key '{pk_val}' discovered in table '{table}'.",
                        action="Deduplicate primary key values."
                    )
                else:
                    seen.add(pk_val)

    def _check_foreign_keys(self):
        """Verify referential integrity."""
        emp_ids = {e["employee_id"] for e in self.data.get("employees", [])}
        team_ids = {t["team_id"] for t in self.data.get("teams", [])}
        skill_ids = {s["skill_id"] for s in self.data.get("skills", [])}
        shift_ids = {s["shift_id"] for s in self.data.get("shift_occurrences", [])}

        # Check employees -> teams
        for emp in self.data.get("employees", []):
            if emp.get("primary_team_id") not in team_ids:
                self._add_issue(
                    "FOREIGN_KEY_VIOLATION", "employees", emp["employee_id"],
                    "FOREIGN_KEY_INTEGRITY", "CRITICAL",
                    f"Employee references nonexistent team '{emp.get('primary_team_id')}'.",
                    action="Reassign employee to a valid team."
                )

        # Check employee_skills -> employees & skills
        for esk in self.data.get("employee_skills", []):
            if esk.get("employee_id") not in emp_ids:
                self._add_issue(
                    "FOREIGN_KEY_VIOLATION", "employee_skills", esk["employee_skill_id"],
                    "FOREIGN_KEY_INTEGRITY", "CRITICAL",
                    f"EmployeeSkill references nonexistent employee '{esk.get('employee_id')}'.",
                    action="Purge orphaned skill mapping."
                )
            if esk.get("skill_id") not in skill_ids:
                self._add_issue(
                    "FOREIGN_KEY_VIOLATION", "employee_skills", esk["employee_skill_id"],
                    "FOREIGN_KEY_INTEGRITY", "CRITICAL",
                    f"EmployeeSkill references nonexistent skill '{esk.get('skill_id')}'.",
                    action="Update or purge invalid skill reference."
                )

        # Check shift_assignments -> employees & shifts
        for asg in self.data.get("shift_assignments", []):
            if asg.get("employee_id") not in emp_ids:
                self._add_issue(
                    "FOREIGN_KEY_VIOLATION", "shift_assignments", asg["assignment_id"],
                    "FOREIGN_KEY_INTEGRITY", "CRITICAL",
                    f"Shift assignment references nonexistent employee '{asg.get('employee_id')}'.",
                    action="Reassign shift or remove assignment."
                )
            if asg.get("shift_id") not in shift_ids:
                self._add_issue(
                    "FOREIGN_KEY_VIOLATION", "shift_assignments", asg["assignment_id"],
                    "FOREIGN_KEY_INTEGRITY", "CRITICAL",
                    f"Shift assignment references nonexistent shift occurrence '{asg.get('shift_id')}'.",
                    action="Re-link to valid shift occurrence."
                )

    def _check_double_booking(self):
        """Check Scenario 1: Employee assigned to concurrent/overlapping shifts."""
        occs = {s["shift_id"]: s for s in self.data.get("shift_occurrences", [])}
        emp_assignments: Dict[str, List[Dict[str, Any]]] = {}

        for asg in self.data.get("shift_assignments", []):
            if asg.get("assignment_status") != "CANCELLED":
                emp_assignments.setdefault(asg["employee_id"], []).append(asg)

        for emp_id, asg_list in emp_assignments.items():
            if len(asg_list) < 2:
                continue
            # Sort by shift start time
            sorted_asgs = []
            for a in asg_list:
                occ = occs.get(a["shift_id"])
                if occ:
                    start_dt = datetime.fromisoformat(occ["start_datetime"].replace("Z", "+00:00"))
                    end_dt = datetime.fromisoformat(occ["end_datetime"].replace("Z", "+00:00"))
                    sorted_asgs.append((a, start_dt, end_dt))
            sorted_asgs.sort(key=lambda x: x[1])

            for i in range(len(sorted_asgs) - 1):
                curr_a, curr_start, curr_end = sorted_asgs[i]
                next_a, next_start, next_end = sorted_asgs[i + 1]
                
                # If next starts before current finishes -> Overlap / Double-booking!
                if next_start < curr_end:
                    self._add_issue(
                        "DOUBLE_BOOKING", "shift_assignments", next_a["assignment_id"],
                        "NO_OVERLAPPING_SHIFTS", "CRITICAL",
                        f"Employee {emp_id} is double-booked across assignments {curr_a['assignment_id']} and {next_a['assignment_id']}.",
                        related_id=curr_a["assignment_id"],
                        action="Deconflict assignments by removing or rescheduling one shift."
                    )

    def _check_leave_conflicts(self):
        """Check Scenario 2: Approved leave overlaps an assigned shift."""
        occs = {s["shift_id"]: s for s in self.data.get("shift_occurrences", [])}
        approved_leaves: Dict[str, List[Dict[str, Any]]] = {}
        for lve in self.data.get("leave_requests", []):
            if lve.get("status") == "APPROVED":
                approved_leaves.setdefault(lve["employee_id"], []).append(lve)

        for asg in self.data.get("shift_assignments", []):
            if asg.get("assignment_status") == "CANCELLED":
                continue
            emp_id = asg["employee_id"]
            if emp_id not in approved_leaves:
                continue
            occ = occs.get(asg["shift_id"])
            if not occ:
                continue
            shift_d = date.fromisoformat(occ["shift_date"])

            for lve in approved_leaves[emp_id]:
                s_d = date.fromisoformat(lve["start_date"])
                e_d = date.fromisoformat(lve["end_date"])
                if s_d <= shift_d <= e_d:
                    self._add_issue(
                        "LEAVE_CONFLICT", "shift_assignments", asg["assignment_id"],
                        "NO_SHIFT_DURING_APPROVED_LEAVE", "CRITICAL",
                        f"Employee {emp_id} is scheduled on {shift_d} while on approved leave ({lve['leave_id']}).",
                        related_id=lve["leave_id"],
                        action="Cancel shift assignment or find a replacement employee."
                    )

    def _check_skill_requirements(self):
        """Check Scenario 3: Required IT skill absent."""
        # Map employee -> set of skill_ids
        emp_skills: Dict[str, Set[str]] = {}
        for esk in self.data.get("employee_skills", []):
            emp_skills.setdefault(esk["employee_id"], set()).add(esk["skill_id"])

        # Map shift_id -> list of coverage requirements
        shift_reqs: Dict[str, List[Dict[str, Any]]] = {}
        for req in self.data.get("coverage_requirements", []):
            if req.get("required_skill_id"):
                shift_reqs.setdefault(req["shift_id"], []).append(req)

        for asg in self.data.get("shift_assignments", []):
            shift_id = asg["shift_id"]
            emp_id = asg["employee_id"]
            skills_possessed = emp_skills.get(emp_id, set())

            reqs = shift_reqs.get(shift_id, [])
            for req in reqs:
                needed_skill = req["required_skill_id"]
                if needed_skill and needed_skill not in skills_possessed:
                    self._add_issue(
                        "SKILL_MISSING", "shift_assignments", asg["assignment_id"],
                        "REQUIRED_SKILL_SATISFACTION", "HIGH",
                        f"Shift {shift_id} requires skill {needed_skill}, but assigned employee {emp_id} does not have this qualification.",
                        related_id=req["requirement_id"],
                        action="Assign a qualified team member possessing the required IT skill."
                    )

    def _check_weekly_overtime_limits(self):
        """Check Scenario 4: Overtime cap exceeded (> 48.0 hours in calendar week)."""
        occs = {s["shift_id"]: s for s in self.data.get("shift_occurrences", [])}
        emp_week_hours: Dict[Tuple[str, int], float] = {}
        emp_week_asgs: Dict[Tuple[str, int], List[str]] = {}

        for asg in self.data.get("shift_assignments", []):
            if asg.get("assignment_status") == "CANCELLED":
                continue
            occ = occs.get(asg["shift_id"])
            if not occ:
                continue
            shift_d = date.fromisoformat(occ["shift_date"])
            week_num = shift_d.isocalendar()[1]
            key = (asg["employee_id"], week_num)
            
            hours = float(asg.get("scheduled_hours", 8.0))
            emp_week_hours[key] = emp_week_hours.get(key, 0.0) + hours
            emp_week_asgs.setdefault(key, []).append(asg["assignment_id"])

        for (emp_id, week_num), total_hours in emp_week_hours.items():
            if total_hours > 48.0:
                asg_ids = emp_week_asgs.get((emp_id, week_num), [])
                culprit_asg = asg_ids[-1] if asg_ids else "N/A"
                self._add_issue(
                    "OVERTIME_EXCEEDED", "shift_assignments", culprit_asg,
                    "WEEKLY_HOURS_CEILING_48H", "HIGH",
                    f"Employee {emp_id} is scheduled for {total_hours} hours in calendar week {week_num}, exceeding the 48.0h weekly overtime cap.",
                    related_id=",".join(asg_ids[:3]),
                    action="Redistribute shifts to ensure weekly hours do not exceed 48.0 hours."
                )

    def _check_swap_lifecycle_integrity(self):
        """Check Scenario 5: Shift swap applied without approval."""
        for swap in self.data.get("swap_requests", []):
            status = swap.get("status")
            approver = swap.get("approver_employee_id")
            dec_time = swap.get("decision_timestamp")
            
            # An APPLIED swap MUST have an approver and a decision timestamp
            if status == "APPLIED" and (not approver or not dec_time):
                self._add_issue(
                    "UNAPPROVED_SWAP_APPLIED", "swap_requests", swap["swap_id"],
                    "SWAP_APPLICATION_REQUIRES_MANAGER_APPROVAL", "CRITICAL",
                    f"Swap request {swap['swap_id']} was applied without recorded manager approval.",
                    related_id=swap.get("original_assignment_id"),
                    action="Rollback swap application until formal manager review is conducted."
                )
