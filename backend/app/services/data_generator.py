"""
Workforce Scheduler - Deterministic Synthetic Data Generator
Generates full reproducible workforce data with zero randomness drift.
Default Seed: 20261022
Full Target: 2,000 Employees, 100 Teams, 90 Days of Shifts, 5,000 Leave Requests.
Starter Target: 100 Employees, 10 Teams, 14 Days of Shifts, 250 Leave Requests.
"""

import random
import hashlib
from datetime import date, datetime, timedelta, time
from typing import Dict, List, Tuple, Any, Optional, Set

from app.services.it_skills_data import IT_SKILLS_CATALOGUE, IT_JOB_ROLES

FIRST_NAMES = [
    "Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Casey", "Riley", "Avery", "Jamie",
    "Priya", "Arjun", "Dev", "Ananya", "Rohan", "Meera", "Kavya", "Siddharth", "Neha", "Vikram",
    "Liam", "Emma", "Noah", "Olivia", "James", "Sophia", "Lucas", "Isabella", "Mason", "Mia",
    "Hiroshi", "Yuki", "Kenji", "Aoi", "Daiki", "Sakura", "Ren", "Hina", "Takashi", "Yuna",
    "Mateo", "Sofia", "Santiago", "Valentina", "Sebastian", "Camila", "Leonardo", "Elena", "Diego", "Lucia",
    "Chen", "Wei", "Lin", "Hao", "Jing", "Ting", "Tao", "Yan", "Lei", "Fang",
    "Amara", "Kwame", "Zainab", "Chidi", "Fatima", "Tariq", "Amina", "Kofi", "Nia", "Jabari",
    "Elena", "Dmitri", "Olga", "Ivan", "Natasha", "Mikhail", "Anna", "Sergei", "Irina", "Andrei"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Patel", "Sharma", "Rao", "Gupta", "Deshmukh", "Nair", "Verma", "Kulkarni", "Reddy", "Mehta",
    "Tanaka", "Sato", "Suzuki", "Takahashi", "Watanabe", "Ito", "Nakamura", "Kobayashi", "Kato", "Yoshida",
    "Zhang", "Wang", "Li", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou",
    "Osei", "Mensah", "Diallo", "Traore", "Kamara", "Adeyemi", "Okafor", "Sow", "Ba", "Kone",
    "Ivanov", "Smirnov", "Kuznetsov", "Popov", "Vasiliev", "Petrov", "Sokolov", "Mikhailov", "Fedorov", "Morozov"
]

IT_DEPARTMENTS = [
    "Platform Engineering",
    "Core Backend Services",
    "Frontend & User Experience",
    "Data Platform & AI",
    "Cloud Infrastructure & SRE",
    "Cybersecurity Operations",
    "Quality Assurance & Test Automation",
    "Enterprise Systems & IT Ops",
    "Mobile & Edge Computing",
    "Database Systems & Storage"
]

DEPT_SKILL_NAMES = {
    "Platform Engineering": ["Go", "Kubernetes", "Docker", "Terraform", "Linux"],
    "Core Backend Services": ["Python", "Java", "Backend Development", "REST APIs", "PostgreSQL", "Microservices"],
    "Frontend & User Experience": ["TypeScript", "JavaScript", "Frontend Development", "REST APIs", "Playwright"],
    "Data Platform & AI": ["Python", "SQL Optimization", "ETL Pipelines", "Pandas", "Apache Spark", "Data Warehousing"],
    "Cloud Infrastructure & SRE": ["AWS", "Azure", "Kubernetes", "Linux", "Terraform", "Cloud Monitoring"],
    "Cybersecurity Operations": ["Application Security", "Network Security", "Vulnerability Assessment", "IAM", "Security Monitoring"],
    "Quality Assurance & Test Automation": ["Manual Testing", "Automated Testing", "API Testing", "Playwright", "Selenium", "Pytest"],
    "Enterprise Systems & IT Ops": ["Linux", "IT Operations", "Incident Management", "Cloud Monitoring", "PostgreSQL"],
    "Mobile & Edge Computing": ["TypeScript", "REST APIs", "Frontend Development", "Automated Testing"],
    "Database Systems & Storage": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Database Design", "SQL Optimization"]
}

class WorkforceDataGenerator:
    def __init__(self, seed: int = 20261022, mode: str = "full"):
        self.seed = seed
        self.mode = mode
        self.rng = random.Random(seed)
        
        if mode == "full":
            self.num_employees = 2000
            self.num_teams = 100
            self.num_days = 90
            self.num_leave_requests = 5000
        else: # starter
            self.num_employees = 100
            self.num_teams = 10
            self.num_days = 14
            self.num_leave_requests = 250
            
        self.start_date = date(2026, 1, 1)
        self.end_date = self.start_date + timedelta(days=self.num_days - 1)
        
        self.skills: List[Dict[str, Any]] = []
        self.teams: List[Dict[str, Any]] = []
        self.employees: List[Dict[str, Any]] = []
        self.employee_skills: List[Dict[str, Any]] = []
        self.shift_templates: List[Dict[str, Any]] = []
        self.holiday_calendars: List[Dict[str, Any]] = []
        self.shift_occurrences: List[Dict[str, Any]] = []
        self.coverage_requirements: List[Dict[str, Any]] = []
        self.leave_requests: List[Dict[str, Any]] = []
        self.shift_assignments: List[Dict[str, Any]] = []
        self.attendance_events: List[Dict[str, Any]] = []
        self.swap_requests: List[Dict[str, Any]] = []
        self.schedule_runs: List[Dict[str, Any]] = []
        self.audit_events: List[Dict[str, Any]] = []

    def generate_all(self) -> Dict[str, Any]:
        """Execute complete generation sequence respecting strict dependencies."""
        self._generate_skills()
        self._generate_teams()
        self._generate_employees()
        self._generate_employee_skills()
        self._generate_shift_templates()
        self._generate_holidays()
        self._generate_shift_occurrences_and_coverage()
        self._generate_leave_requests()
        self._generate_baseline_assignments()
        self._generate_attendance_events()
        self._generate_swap_requests()
        self._generate_schedule_run_metadata()
        
        return {
            "skills": self.skills,
            "teams": self.teams,
            "employees": self.employees,
            "employee_skills": self.employee_skills,
            "shift_templates": self.shift_templates,
            "holiday_calendars": self.holiday_calendars,
            "shift_occurrences": self.shift_occurrences,
            "coverage_requirements": self.coverage_requirements,
            "leave_requests": self.leave_requests,
            "shift_assignments": self.shift_assignments,
            "attendance_events": self.attendance_events,
            "swap_requests": self.swap_requests,
            "schedule_runs": self.schedule_runs,
            "audit_events": self.audit_events
        }

    def _generate_skills(self):
        for item in IT_SKILLS_CATALOGUE:
            self.skills.append({
                "skill_id": item["skill_id"],
                "skill_name": item["name"],
                "category": item["category"],
                "description": item["desc"],
                "created_at": "2025-12-01T00:00:00Z"
            })

    def _generate_teams(self):
        squad_types = [
            "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Core", "Edge",
            "Platform", "Security Ops", "SRE", "Analytics", "Automation", "Performance"
        ]
        
        for i in range(1, self.num_teams + 1):
            team_id = f"TEAM-{i:03d}"
            dept_idx = (i - 1) % len(IT_DEPARTMENTS)
            dept = IT_DEPARTMENTS[dept_idx]
            squad_suffix = squad_types[(i - 1) % len(squad_types)]
            team_num = ((i - 1) // len(squad_types)) + 1
            team_name = f"{dept} - {squad_suffix} #{team_num}"
            
            self.teams.append({
                "team_id": team_id,
                "team_name": team_name,
                "department": dept,
                "manager_employee_id": None,
                "created_at": "2025-12-01T00:00:00Z"
            })

    def _generate_employees(self):
        roles_pool = IT_JOB_ROLES
        
        for i in range(1, self.num_employees + 1):
            emp_id = f"EMP-{i:06d}"
            first_name = self.rng.choice(FIRST_NAMES)
            last_name = self.rng.choice(LAST_NAMES)
            email = f"{first_name.lower()}.{last_name.lower()}.{i:06d}@techcorp.synthetic"
            
            team_idx = (i - 1) % self.num_teams
            primary_team_id = self.teams[team_idx]["team_id"]
            
            role_dict = roles_pool[(i - 1) % len(roles_pool)]
            role = role_dict["role"]
            
            hire_offset_days = self.rng.randint(90, 1800)
            hire_date = (date(2025, 12, 1) - timedelta(days=hire_offset_days)).isoformat()
            
            emp_record = {
                "employee_id": emp_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "primary_team_id": primary_team_id,
                "it_job_role": role,
                "employment_status": "ACTIVE",
                "employment_type": "FULL_TIME",
                "weekly_max_hours": 40.0,
                "overtime_cap_hours": 8.0,
                "hire_date": hire_date,
                "created_at": "2025-12-01T00:00:00Z",
                "updated_at": "2025-12-01T00:00:00Z"
            }
            self.employees.append(emp_record)
            
            if self.teams[team_idx]["manager_employee_id"] is None:
                self.teams[team_idx]["manager_employee_id"] = emp_id

    def _generate_employee_skills(self):
        skill_name_to_id = {s["skill_name"]: s["skill_id"] for s in self.skills}
        role_map = {r["role"]: r["skills"] for r in IT_JOB_ROLES}
        team_dept_map = {t["team_id"]: t["department"] for t in self.teams}
        proficiencies = ["INTERMEDIATE", "ADVANCED", "EXPERT", "BEGINNER"]
        
        counter = 1
        for emp in self.employees:
            emp_id = emp["employee_id"]
            role = emp["it_job_role"]
            dept = team_dept_map.get(emp["primary_team_id"], "Platform Engineering")
            
            assigned_skills = set(role_map.get(role, ["Python", "Docker", "PostgreSQL"]))
            # Add department core skills
            dept_skills = DEPT_SKILL_NAMES.get(dept, ["Python", "Linux"])
            assigned_skills.update(dept_skills)
            
            # Add 2 additional random IT skills
            all_skill_names = [s["skill_name"] for s in self.skills]
            for _ in range(2):
                assigned_skills.add(self.rng.choice(all_skill_names))
                
            for skill_name in assigned_skills:
                skill_id = skill_name_to_id.get(skill_name)
                if not skill_id:
                    continue
                prof = self.rng.choice(proficiencies)
                exp = round(self.rng.uniform(1.0, 10.0), 1)
                certified = self.rng.choice([True, False, False])
                
                self.employee_skills.append({
                    "employee_skill_id": f"ESK-{counter:07d}",
                    "employee_id": emp_id,
                    "skill_id": skill_id,
                    "proficiency_level": prof,
                    "years_experience": exp,
                    "certified": certified,
                    "created_at": "2025-12-01T00:00:00Z"
                })
                counter += 1

    def _generate_shift_templates(self):
        self.shift_templates = [
            {
                "template_id": "TMPL-01",
                "shift_name": "Morning Operations",
                "shift_code": "MORN",
                "start_time": "06:00:00",
                "end_time": "14:00:00",
                "duration_hours": 8.0,
                "is_overnight": False,
                "active": True,
                "created_at": "2025-12-01T00:00:00Z"
            },
            {
                "template_id": "TMPL-02",
                "shift_name": "Afternoon Operations",
                "shift_code": "AFTN",
                "start_time": "14:00:00",
                "end_time": "22:00:00",
                "duration_hours": 8.0,
                "is_overnight": False,
                "active": True,
                "created_at": "2025-12-01T00:00:00Z"
            },
            {
                "template_id": "TMPL-03",
                "shift_name": "Night On-Call",
                "shift_code": "NGHT",
                "start_time": "22:00:00",
                "end_time": "06:00:00",
                "duration_hours": 8.0,
                "is_overnight": True,
                "active": True,
                "created_at": "2025-12-01T00:00:00Z"
            }
        ]

    def _generate_holidays(self):
        holidays_raw = [
            ("2026-01-01", "New Year's Day"),
            ("2026-01-19", "Martin Luther King Jr. Day / Tech Innovation Day"),
            ("2026-02-16", "Presidents' Day / Global Engineering Day"),
            ("2026-03-27", "Quarterly System Architecture Pause")
        ]
        for idx, (h_date, h_name) in enumerate(holidays_raw, start=1):
            self.holiday_calendars.append({
                "holiday_id": f"HOL-2026-{idx:02d}",
                "holiday_date": h_date,
                "holiday_name": h_name,
                "region_scope": "GLOBAL",
                "is_paid": True,
                "created_at": "2025-12-01T00:00:00Z"
            })

    def _generate_shift_occurrences_and_coverage(self):
        req_counter = 1
        skill_name_to_id = {s["skill_name"]: s["skill_id"] for s in self.skills}
        
        active_teams = self.teams[:20] if self.mode == "full" else self.teams
        
        for day_idx in range(self.num_days):
            current_day = self.start_date + timedelta(days=day_idx)
            day_str = current_day.isoformat()
            
            for team in active_teams:
                team_id = team["team_id"]
                dept = team["department"]
                dept_skills = DEPT_SKILL_NAMES.get(dept, ["Python"])
                
                for tmpl in self.shift_templates:
                    code = tmpl["shift_code"]
                    shift_id = f"SHIFT-{day_str}-{code}-{team_id}"
                    
                    start_dt = f"{day_str}T{tmpl['start_time']}Z"
                    if tmpl["is_overnight"]:
                        next_day = (current_day + timedelta(days=1)).isoformat()
                        end_dt = f"{next_day}T{tmpl['end_time']}Z"
                    else:
                        end_dt = f"{day_str}T{tmpl['end_time']}Z"
                        
                    self.shift_occurrences.append({
                        "shift_id": shift_id,
                        "template_id": tmpl["template_id"],
                        "team_id": team_id,
                        "shift_date": day_str,
                        "start_datetime": start_dt,
                        "end_datetime": end_dt,
                        "is_overnight": tmpl["is_overnight"],
                        "status": "SCHEDULED",
                        "created_at": "2025-12-01T00:00:00Z"
                    })
                    
                    # Pick a skill relevant to this team's department
                    crit_skill_name = self.rng.choice(dept_skills)
                    crit_skill_id = skill_name_to_id.get(crit_skill_name, "SKILL-001")
                    
                    self.coverage_requirements.append({
                        "requirement_id": f"REQ-{req_counter:07d}",
                        "shift_id": shift_id,
                        "team_id": team_id,
                        "required_headcount": 1,
                        "required_skill_id": crit_skill_id,
                        "min_proficiency": "INTERMEDIATE",
                        "is_critical": True,
                        "effective_date": day_str,
                        "created_at": "2025-12-01T00:00:00Z"
                    })
                    req_counter += 1

    def _generate_leave_requests(self):
        leave_types = ["ANNUAL", "SICK", "PARENTAL", "UNPAID", "STUDY"]
        statuses = ["APPROVED", "APPROVED", "APPROVED", "REJECTED", "PENDING"]
        
        team_manager_map = {t["team_id"]: t["manager_employee_id"] for t in self.teams}
        emp_team_map = {e["employee_id"]: e["primary_team_id"] for e in self.employees}
        
        for i in range(1, self.num_leave_requests + 1):
            leave_id = f"LVE-2026-{i:06d}"
            emp = self.employees[(i - 1) % len(self.employees)]
            emp_id = emp["employee_id"]
            team_id = emp_team_map[emp_id]
            manager_id = team_manager_map.get(team_id)
            if manager_id == emp_id:
                manager_id = "EMP-000001" if emp_id != "EMP-000001" else "EMP-000002"
                
            duration = self.rng.randint(1, 5)
            start_offset = self.rng.randint(0, self.num_days - duration)
            start_d = self.start_date + timedelta(days=start_offset)
            end_d = start_d + timedelta(days=duration - 1)
            
            status = self.rng.choice(statuses)
            l_type = self.rng.choice(leave_types)
            req_ts = f"2025-12-{self.rng.randint(10, 28):02d}T10:00:00Z"
            
            dec_ts = None
            notes = None
            if status != "PENDING":
                dec_ts = f"2025-12-29T14:30:00Z"
                notes = "Approved based on department capacity." if status == "APPROVED" else "Rejected due to coverage restrictions."
                
            self.leave_requests.append({
                "leave_id": leave_id,
                "employee_id": emp_id,
                "start_date": start_d.isoformat(),
                "end_date": end_d.isoformat(),
                "leave_type": l_type,
                "reason": f"Planned {l_type.lower()} leave request.",
                "status": status,
                "request_timestamp": req_ts,
                "approver_employee_id": manager_id if status != "PENDING" else None,
                "decision_timestamp": dec_ts,
                "decision_notes": notes
            })

    def _generate_baseline_assignments(self):
        approved_leaves = set()
        for lve in self.leave_requests:
            if lve["status"] == "APPROVED":
                s_d = date.fromisoformat(lve["start_date"])
                e_d = date.fromisoformat(lve["end_date"])
                curr = s_d
                while curr <= e_d:
                    approved_leaves.add((lve["employee_id"], curr.isoformat()))
                    curr += timedelta(days=1)
                    
        emp_skills_lookup: Dict[str, Set[str]] = {}
        for esk in self.employee_skills:
            emp_skills_lookup.setdefault(esk["employee_id"], set()).add(esk["skill_id"])
            
        shift_req_map: Dict[str, str] = {}
        for req in self.coverage_requirements:
            if req.get("required_skill_id"):
                shift_req_map[req["shift_id"]] = req["required_skill_id"]
                
        team_employees: Dict[str, List[Dict[str, Any]]] = {}
        for emp in self.employees:
            team_employees.setdefault(emp["primary_team_id"], []).append(emp)
            
        asg_counter = 1
        emp_assignments_by_day: Dict[Tuple[str, str], str] = {}
        emp_weekly_hours: Dict[Tuple[str, int], float] = {}
        
        sorted_occurrences = sorted(self.shift_occurrences, key=lambda s: s["start_datetime"])
        
        for shift in sorted_occurrences:
            shift_id = shift["shift_id"]
            team_id = shift["team_id"]
            shift_date_str = shift["shift_date"]
            shift_d = date.fromisoformat(shift_date_str)
            week_num = shift_d.isocalendar()[1]
            candidates = team_employees.get(team_id, [])
            required_skill_id = shift_req_map.get(shift_id)
            
            selected_emp = None
            for emp in candidates:
                emp_id = emp["employee_id"]
                
                # Check 1: No double booking
                if (emp_id, shift_date_str) in emp_assignments_by_day:
                    continue
                    
                # Check 2: No approved leave conflict
                if (emp_id, shift_date_str) in approved_leaves:
                    continue
                    
                # Check 3: Max 40h standard / 48h total weekly
                curr_hours = emp_weekly_hours.get((emp_id, week_num), 0.0)
                if curr_hours + 8.0 > 40.0: # Keep baseline at regular 40h max
                    continue
                    
                # Check 4: Must possess the required IT skill
                if required_skill_id and required_skill_id not in emp_skills_lookup.get(emp_id, set()):
                    continue
                    
                selected_emp = emp
                break
                
            if selected_emp:
                emp_id = selected_emp["employee_id"]
                emp_assignments_by_day[(emp_id, shift_date_str)] = shift_id
                emp_weekly_hours[(emp_id, week_num)] = emp_weekly_hours.get((emp_id, week_num), 0.0) + 8.0
                
                self.shift_assignments.append({
                    "assignment_id": f"ASG-{asg_counter:07d}",
                    "shift_id": shift_id,
                    "employee_id": emp_id,
                    "schedule_run_id": "RUN-20260101-001",
                    "assignment_status": "ASSIGNED",
                    "assigned_role": selected_emp["it_job_role"],
                    "scheduled_hours": 8.0,
                    "created_at": "2025-12-30T10:00:00Z",
                    "updated_at": "2025-12-30T10:00:00Z"
                })
                asg_counter += 1

    def _generate_attendance_events(self):
        for asg in self.shift_assignments:
            asg_id = asg["assignment_id"]
            emp_id = asg["employee_id"]
            
            shift_lookup = next((s for s in self.shift_occurrences if s["shift_id"] == asg["shift_id"]), None)
            if not shift_lookup:
                continue
                
            start_dt = datetime.fromisoformat(shift_lookup["start_datetime"].replace("Z", "+00:00"))
            end_dt = datetime.fromisoformat(shift_lookup["end_datetime"].replace("Z", "+00:00"))
            
            roll = self.rng.random()
            if roll < 0.94:
                status = "ON_TIME"
                punch_in = start_dt
                punch_out = end_dt
                hours = 8.0
            elif roll < 0.98:
                status = "LATE"
                punch_in = start_dt + timedelta(minutes=self.rng.randint(10, 45))
                punch_out = end_dt
                hours = round((punch_out - punch_in).total_seconds() / 3600.0, 2)
            else:
                status = "EARLY_DEPARTURE"
                punch_in = start_dt
                punch_out = end_dt - timedelta(minutes=self.rng.randint(15, 60))
                hours = round((punch_out - punch_in).total_seconds() / 3600.0, 2)
                
            self.attendance_events.append({
                "attendance_id": f"ATT-{emp_id}-{int(punch_in.timestamp())}-IN",
                "employee_id": emp_id,
                "assignment_id": asg_id,
                "event_timestamp": punch_in.isoformat(),
                "event_type": "CHECK_IN",
                "status": status,
                "actual_hours_worked": None,
                "created_at": punch_in.isoformat()
            })
            
            self.attendance_events.append({
                "attendance_id": f"ATT-{emp_id}-{int(punch_out.timestamp())}-OUT",
                "employee_id": emp_id,
                "assignment_id": asg_id,
                "event_timestamp": punch_out.isoformat(),
                "event_type": "CHECK_OUT",
                "status": status,
                "actual_hours_worked": hours,
                "created_at": punch_out.isoformat()
            })

    def _generate_swap_requests(self):
        if len(self.shift_assignments) < 10:
            return
            
        team_manager_map = {t["team_id"]: t["manager_employee_id"] for t in self.teams}
        emp_team_map = {e["employee_id"]: e["primary_team_id"] for e in self.employees}
        
        swap_count = min(30, len(self.shift_assignments) // 4)
        for i in range(1, swap_count + 1):
            swap_id = f"SWP-2026-{i:06d}"
            asg1 = self.shift_assignments[i * 2]
            asg2 = self.shift_assignments[i * 2 + 1]
            
            req_emp = asg1["employee_id"]
            tgt_emp = asg2["employee_id"]
            team_id = emp_team_map[req_emp]
            manager_id = team_manager_map.get(team_id, "EMP-000001")
            if manager_id in (req_emp, tgt_emp):
                manager_id = "EMP-000001" if req_emp != "EMP-000001" else "EMP-000002"
                
            req_time = "2026-01-10T09:00:00Z"
            dec_time = "2026-01-10T11:00:00Z"
            applied_time = "2026-01-10T11:05:00Z"
            
            self.swap_requests.append({
                "swap_id": swap_id,
                "requesting_employee_id": req_emp,
                "original_assignment_id": asg1["assignment_id"],
                "target_employee_id": tgt_emp,
                "target_assignment_id": asg2["assignment_id"],
                "reason": "Shift exchange due to project release schedule.",
                "status": "APPLIED",
                "approver_employee_id": manager_id,
                "request_timestamp": req_time,
                "decision_timestamp": dec_time,
                "applied_timestamp": applied_time
            })
            
            self.audit_events.append({
                "event_id": f"AUD-{i:07d}",
                "actor_employee_id": manager_id,
                "action_type": "SWAP_APPLICATION",
                "target_entity": "swap_requests",
                "target_id": swap_id,
                "previous_state": "APPROVED",
                "new_state": "APPLIED",
                "timestamp": applied_time,
                "metadata": {"requester": req_emp, "target": tgt_emp}
            })

    def _generate_schedule_run_metadata(self):
        total_occurrences = len(self.shift_occurrences)
        total_assigned = len(self.shift_assignments)
        uncovered = max(0, total_occurrences - total_assigned)
        coverage_rate = round((total_assigned / total_occurrences) * 100.0, 2) if total_occurrences else 100.0
        
        self.schedule_runs.append({
            "run_id": "RUN-20260101-001",
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "algorithm": "CONSTRAINT_PROPAGATION_WITH_FAIRNESS",
            "status": "SUCCESS",
            "total_shifts": total_occurrences,
            "assigned_shifts": total_assigned,
            "uncovered_shifts": uncovered,
            "coverage_rate": coverage_rate,
            "skill_coverage_rate": 100.0,
            "runtime_seconds": 1.482,
            "created_at": "2025-12-30T10:00:00Z"
        })
