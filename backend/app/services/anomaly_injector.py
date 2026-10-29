"""
Workforce Scheduler - Labelled Anomaly Injector & Ground Truth Generator
Creates an isolated perturbed test dataset containing the 5 mandatory anomaly scenarios.
Preserves ground-truth labels completely decoupled from operational validator inputs.
"""

import copy
from typing import Dict, List, Any, Tuple
from datetime import date, datetime, timedelta

class AnomalyInjector:
    def __init__(self, baseline_data: Dict[str, Any]):
        self.perturbed_data: Dict[str, Any] = copy.deepcopy(baseline_data)
        self.ground_truth: List[Dict[str, Any]] = []
        self.anomaly_counter = 1

    def inject_all_scenarios(self) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Inject all 5 required anomaly scenarios with clean isolation."""
        self._inject_scenario_1_double_booking()
        self._inject_scenario_2_leave_conflict()
        self._inject_scenario_3_skill_absent()
        self._inject_scenario_4_overtime_exceeded()
        self._inject_scenario_5_unapproved_swap()
        
        return self.perturbed_data, self.ground_truth

    def _inject_scenario_1_double_booking(self):
        """
        Scenario 1: Employee Double-Booked.
        Assign an employee to a concurrent, overlapping shift (same date and hours on a peer team).
        Rule: NO_OVERLAPPING_SHIFTS
        """
        asgs = self.perturbed_data["shift_assignments"]
        occs = {o["shift_id"]: o for o in self.perturbed_data["shift_occurrences"]}
        
        if len(asgs) < 5:
            return
            
        target_asg = asgs[0]
        emp_id = target_asg["employee_id"]
        curr_shift = occs[target_asg["shift_id"]]
        
        # Find concurrent shift on the exact same date and template on another team
        concurrent_shift = next(
            (o for o in self.perturbed_data["shift_occurrences"] 
             if o["shift_date"] == curr_shift["shift_date"] 
             and o["template_id"] == curr_shift["template_id"]
             and o["shift_id"] != target_asg["shift_id"]),
            None
        )
        
        if concurrent_shift:
            anom_id = f"ANOM-{self.anomaly_counter:04d}"
            new_asg_id = f"ASG-ANOM-{self.anomaly_counter:04d}"
            self.anomaly_counter += 1
            
            injected_asg = {
                "assignment_id": new_asg_id,
                "shift_id": concurrent_shift["shift_id"],
                "employee_id": emp_id,
                "schedule_run_id": "RUN-20260101-001",
                "assignment_status": "ASSIGNED",
                "assigned_role": target_asg["assigned_role"],
                "scheduled_hours": 8.0,
                "created_at": "2026-01-02T10:00:00Z",
                "updated_at": "2026-01-02T10:00:00Z"
            }
            self.perturbed_data["shift_assignments"].append(injected_asg)
            
            self.ground_truth.append({
                "anomaly_id": anom_id,
                "scenario_type": "SCENARIO_1_DOUBLE_BOOKING",
                "affected_entity": "shift_assignments",
                "record_id": new_asg_id,
                "related_record_id": target_asg["assignment_id"],
                "rule_violated": "NO_OVERLAPPING_SHIFTS",
                "expected_severity": "CRITICAL",
                "baseline_reference": target_asg["assignment_id"],
                "injected_details": f"Employee {emp_id} double-booked across concurrent shifts {target_asg['shift_id']} and {concurrent_shift['shift_id']} on {curr_shift['shift_date']}."
            })

    def _inject_scenario_2_leave_conflict(self):
        """
        Scenario 2: Approved Leave Overlaps an Assigned Shift.
        Schedule an employee onto a shift that lands right in their approved leave window.
        Ensure employee has the required skill so only LEAVE_CONFLICT is tested.
        Rule: NO_SHIFT_DURING_APPROVED_LEAVE
        """
        approved_leaves = [l for l in self.perturbed_data["leave_requests"] if l["status"] == "APPROVED"]
        occs_by_date = {}
        for o in self.perturbed_data["shift_occurrences"]:
            occs_by_date.setdefault(o["shift_date"], []).append(o)
            
        emp_skills_lookup = {}
        for esk in self.perturbed_data["employee_skills"]:
            emp_skills_lookup.setdefault(esk["employee_id"], set()).add(esk["skill_id"])
            
        shift_req_map = {r["shift_id"]: r.get("required_skill_id") for r in self.perturbed_data["coverage_requirements"]}
        
        target_leave = None
        target_shift = None
        
        for lve in approved_leaves:
            emp_id = lve["employee_id"]
            shifts_on_day = occs_by_date.get(lve["start_date"], [])
            for s in shifts_on_day:
                req_skill = shift_req_map.get(s["shift_id"])
                # Match employee skills so we don't trigger collateral skill missing
                if not req_skill or req_skill in emp_skills_lookup.get(emp_id, set()):
                    target_leave = lve
                    target_shift = s
                    break
            if target_shift:
                break
                
        if target_leave and target_shift:
            anom_id = f"ANOM-{self.anomaly_counter:04d}"
            new_asg_id = f"ASG-ANOM-{self.anomaly_counter:04d}"
            self.anomaly_counter += 1
            
            injected_asg = {
                "assignment_id": new_asg_id,
                "shift_id": target_shift["shift_id"],
                "employee_id": target_leave["employee_id"],
                "schedule_run_id": "RUN-20260101-001",
                "assignment_status": "ASSIGNED",
                "assigned_role": "Backend Engineer",
                "scheduled_hours": 8.0,
                "created_at": "2026-01-03T10:00:00Z",
                "updated_at": "2026-01-03T10:00:00Z"
            }
            self.perturbed_data["shift_assignments"].append(injected_asg)
            
            self.ground_truth.append({
                "anomaly_id": anom_id,
                "scenario_type": "SCENARIO_2_LEAVE_CONFLICT",
                "affected_entity": "shift_assignments",
                "record_id": new_asg_id,
                "related_record_id": target_leave["leave_id"],
                "rule_violated": "NO_SHIFT_DURING_APPROVED_LEAVE",
                "expected_severity": "CRITICAL",
                "baseline_reference": target_leave["leave_id"],
                "injected_details": f"Employee {target_leave['employee_id']} scheduled for shift {target_shift['shift_id']} during approved leave {target_leave['leave_id']} on {target_leave['start_date']}."
            })

    def _inject_scenario_3_skill_absent(self):
        """
        Scenario 3: Required IT Skill Absent.
        Rule: REQUIRED_SKILL_SATISFACTION
        """
        asgs = self.perturbed_data["shift_assignments"]
        emp_skills_lookup = {}
        for esk in self.perturbed_data["employee_skills"]:
            emp_skills_lookup.setdefault(esk["employee_id"], set()).add(esk["skill_id"])
            
        all_skill_ids = [s["skill_id"] for s in self.perturbed_data["skills"]]
        
        target_asg = None
        unpossessed_skill = None
        for asg in asgs:
            emp_id = asg["employee_id"]
            possessed = emp_skills_lookup.get(emp_id, set())
            missing = [s for s in all_skill_ids if s not in possessed]
            if missing:
                target_asg = asg
                unpossessed_skill = missing[0]
                break
                
        if target_asg and unpossessed_skill:
            anom_id = f"ANOM-{self.anomaly_counter:04d}"
            req_id = f"REQ-ANOM-{self.anomaly_counter:04d}"
            self.anomaly_counter += 1
            
            injected_req = {
                "requirement_id": req_id,
                "shift_id": target_asg["shift_id"],
                "team_id": "TEAM-001",
                "required_headcount": 1,
                "required_skill_id": unpossessed_skill,
                "min_proficiency": "EXPERT",
                "is_critical": True,
                "effective_date": "2026-01-05",
                "created_at": "2026-01-01T00:00:00Z"
            }
            self.perturbed_data["coverage_requirements"].append(injected_req)
            
            self.ground_truth.append({
                "anomaly_id": anom_id,
                "scenario_type": "SCENARIO_3_SKILL_ABSENT",
                "affected_entity": "shift_assignments",
                "record_id": target_asg["assignment_id"],
                "related_record_id": req_id,
                "rule_violated": "REQUIRED_SKILL_SATISFACTION",
                "expected_severity": "HIGH",
                "baseline_reference": target_asg["assignment_id"],
                "injected_details": f"Shift {target_asg['shift_id']} mandates skill {unpossessed_skill} (EXPERT), but assigned employee {target_asg['employee_id']} lacks this skill."
            })

    def _inject_scenario_4_overtime_exceeded(self):
        """
        Scenario 4: Overtime Cap Exceeded.
        Over-schedule an employee in a 7-day window beyond 48.0 hours total (> 8h overtime).
        Ensure employee has no approved leave on these days to isolate overtime rule.
        Rule: WEEKLY_HOURS_CEILING_48H
        """
        asgs = self.perturbed_data["shift_assignments"]
        occs = {o["shift_id"]: o for o in self.perturbed_data["shift_occurrences"]}
        assigned_emp_dates = set()
        for a in asgs:
            occ = occs.get(a["shift_id"])
            if occ:
                assigned_emp_dates.add((a["employee_id"], occ["shift_date"]))

        # Leave dates lookup: (emp_id, date_str)
        emp_leaves = set()
        for lve in self.perturbed_data["leave_requests"]:
            if lve.get("status") == "APPROVED":
                s_d = date.fromisoformat(lve["start_date"])
                e_d = date.fromisoformat(lve["end_date"])
                curr = s_d
                while curr <= e_d:
                    emp_leaves.add((lve["employee_id"], curr.isoformat()))
                    curr += timedelta(days=1)

        # Required skills for shifts
        shift_req_map = {r["shift_id"]: r.get("required_skill_id") for r in self.perturbed_data["coverage_requirements"]}
        emp_skills_lookup = {}
        for esk in self.perturbed_data["employee_skills"]:
            emp_skills_lookup.setdefault(esk["employee_id"], set()).add(esk["skill_id"])

        week2_dates = [f"2026-01-{d:02d}" for d in range(5, 12)]
        target_emp = None
        for emp in self.perturbed_data["employees"]:
            emp_id = emp["employee_id"]
            team_id = emp["primary_team_id"]
            no_shifts = not any((emp_id, d_str) in assigned_emp_dates for d_str in week2_dates)
            no_leaves = not any((emp_id, d_str) in emp_leaves for d_str in week2_dates)
            if no_shifts and no_leaves:
                team_occs = [o for o in self.perturbed_data["shift_occurrences"] if o["shift_date"] in week2_dates and o["team_id"] == team_id]
                if team_occs:
                    req_skills = [shift_req_map.get(o["shift_id"]) for o in team_occs]
                    emp_has_all = all(not sk or sk in emp_skills_lookup.get(emp_id, set()) for sk in req_skills)
                    if emp_has_all:
                        target_emp = emp
                        break
                
        if not target_emp:
            target_emp = self.perturbed_data["employees"][0]

        emp_id = target_emp["employee_id"]
        anom_id = f"ANOM-{self.anomaly_counter:04d}"
        self.anomaly_counter += 1

        team_id = target_emp["primary_team_id"]
        injected_asg_ids = []
        for i, d_str in enumerate(week2_dates):
            new_asg_id = f"ASG-ANOM-OT-{i:02d}"
            injected_asg_ids.append(new_asg_id)
            occ = next((o for o in self.perturbed_data["shift_occurrences"] if o["shift_date"] == d_str and o["team_id"] == team_id), None)
            if not occ:
                occ = next((o for o in self.perturbed_data["shift_occurrences"] if o["shift_date"] == d_str), None)
            shift_id = occ["shift_id"] if occ else f"SHIFT-{d_str}-MORN-{team_id}"

            self.perturbed_data["shift_assignments"].append({
                "assignment_id": new_asg_id,
                "shift_id": shift_id,
                "employee_id": emp_id,
                "schedule_run_id": "RUN-20260101-001",
                "assignment_status": "ASSIGNED",
                "assigned_role": target_emp["it_job_role"],
                "scheduled_hours": 8.0,
                "created_at": "2026-01-01T10:00:00Z",
                "updated_at": "2026-01-01T10:00:00Z"
            })

        self.ground_truth.append({
            "anomaly_id": anom_id,
            "scenario_type": "SCENARIO_4_OVERTIME_CAP_EXCEEDED",
            "affected_entity": "shift_assignments",
            "record_id": injected_asg_ids[-1],
            "related_record_id": ",".join(injected_asg_ids[:3]),
            "rule_violated": "WEEKLY_HOURS_CEILING_48H",
            "expected_severity": "HIGH",
            "baseline_reference": emp_id,
            "injected_details": f"Employee {emp_id} scheduled for 56.0 hours (7 shifts) in week 2, exceeding the 48.0h weekly overtime cap."
        })

    def _inject_scenario_5_unapproved_swap(self):
        """
        Scenario 5: Shift Swap Applied Without Approval.
        Rule: SWAP_APPLICATION_REQUIRES_MANAGER_APPROVAL
        """
        asgs = self.perturbed_data["shift_assignments"]
        if len(asgs) < 10:
            return
            
        anom_id = f"ANOM-{self.anomaly_counter:04d}"
        swap_id = f"SWP-ANOM-{self.anomaly_counter:04d}"
        self.anomaly_counter += 1
        
        asg1 = asgs[3]
        asg2 = asgs[4]
        
        injected_swap = {
            "swap_id": swap_id,
            "requesting_employee_id": asg1["employee_id"],
            "original_assignment_id": asg1["assignment_id"],
            "target_employee_id": asg2["employee_id"],
            "target_assignment_id": asg2["assignment_id"],
            "reason": "Peer-to-peer swap applied directly without waiting for management sign-off.",
            "status": "APPLIED",
            "approver_employee_id": None,
            "request_timestamp": "2026-01-15T08:00:00Z",
            "decision_timestamp": None,
            "applied_timestamp": "2026-01-15T08:05:00Z"
        }
        self.perturbed_data["swap_requests"].append(injected_swap)
        
        self.ground_truth.append({
            "anomaly_id": anom_id,
            "scenario_type": "SCENARIO_5_UNAPPROVED_SWAP_APPLIED",
            "affected_entity": "swap_requests",
            "record_id": swap_id,
            "related_record_id": None,
            "rule_violated": "SWAP_APPLICATION_REQUIRES_MANAGER_APPROVAL",
            "expected_severity": "CRITICAL",
            "baseline_reference": swap_id,
            "injected_details": f"Swap request {swap_id} marked as APPLIED without required manager approval or decision timestamp."
        })
