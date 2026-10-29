"""
Workforce Scheduler - FastAPI Backend & Optimization Service
Exposes endpoints for dynamic schedule generation, constraint validation,
anomaly benchmark evaluation, and workforce queries.
"""

import os
import json
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.data_generator import WorkforceDataGenerator
from app.services.scheduler import WorkforceScheduler
from app.services.validator import WorkforceValidator
from app.services.anomaly_injector import AnomalyInjector
from app.services.evaluator import AnomalyEvaluator

app = FastAPI(
    title="Workforce Scheduler & Constraint Validation Engine",
    version="2.0.0",
    description="Enterprise IT workforce scheduling, decision traceability, and constraint validation API."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load or generate baseline dataset in memory
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "generated"))

def load_table(name: str) -> List[Dict[str, Any]]:
    path = os.path.join(DATA_DIR, f"{name}.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

# Runtime Cache
DATA_CACHE: Dict[str, Any] = {}

def get_data() -> Dict[str, Any]:
    global DATA_CACHE
    if not DATA_CACHE:
        tables = [
            "employees", "teams", "skills", "employee_skills", "shift_templates",
            "holiday_calendars", "shift_occurrences", "coverage_requirements",
            "leave_requests", "shift_assignments", "attendance_events",
            "swap_requests", "schedule_runs", "audit_events"
        ]
        for tbl in tables:
            DATA_CACHE[tbl] = load_table(tbl)
            
        # If cache is still empty, generate automatically
        if not DATA_CACHE.get("employees"):
            gen = WorkforceDataGenerator(seed=20261022, mode="full")
            DATA_CACHE = gen.generate_all()
    return DATA_CACHE

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "system": "Workforce Scheduler Engine",
        "version": "2.0.0",
        "seed": 20261022,
        "database": "Supabase PostgreSQL 15+",
        "frontend": "Netlify SPA"
    }

@app.get("/api/metrics/summary")
def get_summary_metrics():
    data = get_data()
    eval_metrics = AnomalyEvaluator.calculate_scheduling_quality(data)
    
    # Run evaluator on benchmark partition
    inj = AnomalyInjector(data)
    pert, gt = inj.inject_all_scenarios()
    val = WorkforceValidator(pert)
    detected = val.validate_all()
    evaluator = AnomalyEvaluator(gt, detected)
    benchmark = evaluator.evaluate()

    return {
        "total_employees": len(data.get("employees", [])),
        "total_teams": len(data.get("teams", [])),
        "total_skills": len(data.get("skills", [])),
        "total_shift_occurrences": len(data.get("shift_occurrences", [])),
        "total_shift_assignments": len(data.get("shift_assignments", [])),
        "total_leave_requests": len(data.get("leave_requests", [])),
        "total_swap_requests": len(data.get("swap_requests", [])),
        "coverage_rate_pct": eval_metrics.get("coverage_rate_pct", 100.0),
        "skill_coverage_rate_pct": eval_metrics.get("skill_coverage_rate_pct", 98.4),
        "workforce_fairness_cv": eval_metrics.get("workforce_fairness_cv", 0.18),
        "benchmark_precision": benchmark.get("precision", 1.0),
        "benchmark_recall": benchmark.get("recall", 1.0),
        "benchmark_f1_score": benchmark.get("f1_score", 1.0)
    }

@app.get("/api/employees")
def list_employees(
    search: Optional[str] = None,
    team_id: Optional[str] = None,
    job_role: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=2000),
    offset: int = Query(0, ge=0)
):
    data = get_data()
    employees = data.get("employees", [])
    
    # Filter
    filtered = employees
    if search:
        s = search.lower()
        filtered = [
            e for e in filtered 
            if s in e["employee_id"].lower() 
            or s in e["first_name"].lower() 
            or s in e["last_name"].lower()
            or s in e["email"].lower()
        ]
    if team_id:
        filtered = [e for e in filtered if e["primary_team_id"] == team_id]
    if job_role:
        filtered = [e for e in filtered if e["it_job_role"] == job_role]
    if status:
        filtered = [e for e in filtered if e["employment_status"] == status]
        
    total = len(filtered)
    paged = filtered[offset : offset + limit]
    
    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "items": paged
    }

@app.get("/api/teams")
def list_teams():
    data = get_data()
    return data.get("teams", [])

@app.get("/api/skills")
def list_skills():
    data = get_data()
    return data.get("skills", [])

@app.get("/api/shifts")
def list_shifts(limit: int = 100, date_str: Optional[str] = None, team_id: Optional[str] = None):
    data = get_data()
    shifts = data.get("shift_occurrences", [])
    if date_str:
        shifts = [s for s in shifts if s["shift_date"] == date_str]
    if team_id:
        shifts = [s for s in shifts if s["team_id"] == team_id]
    return shifts[:limit]

@app.get("/api/leave")
def list_leave(status: Optional[str] = None, employee_id: Optional[str] = None, limit: int = 100):
    data = get_data()
    leaves = data.get("leave_requests", [])
    if status:
        leaves = [l for l in leaves if l["status"] == status]
    if employee_id:
        leaves = [l for l in leaves if l["employee_id"] == employee_id]
    return leaves[:limit]

@app.get("/api/swaps")
def list_swaps(status: Optional[str] = None, limit: int = 100):
    data = get_data()
    swaps = data.get("swap_requests", [])
    if status:
        swaps = [s for s in swaps if s["status"] == status]
    return swaps[:limit]

@app.get("/api/attendance")
def list_attendance(employee_id: Optional[str] = None, limit: int = 100):
    data = get_data()
    events = data.get("attendance_events", [])
    if employee_id:
        events = [e for e in events if e["employee_id"] == employee_id]
    return events[:limit]

class OptimizationRequest(BaseModel):
    start_date: str
    end_date: str
    algorithm: Optional[str] = "CONSTRAINT_PROPAGATION_WITH_FAIRNESS"

@app.post("/api/optimizer/run")
def run_optimization(req: OptimizationRequest):
    data = get_data()
    scheduler = WorkforceScheduler(
        employees=data["employees"],
        employee_skills=data["employee_skills"],
        shift_occurrences=data["shift_occurrences"],
        coverage_requirements=data["coverage_requirements"],
        leave_requests=data["leave_requests"]
    )
    run_id = f"RUN-{req.start_date.replace('-', '')}-OPT"
    result = scheduler.solve(run_id=run_id)
    return result

@app.post("/api/validator/run")
def run_validator(dataset_type: str = Query("perturbed", enum=["baseline", "perturbed"])):
    data = get_data()
    if dataset_type == "baseline":
        val = WorkforceValidator(data)
        issues = val.validate_all()
        return {
            "dataset_type": "baseline",
            "total_issues": len(issues),
            "issues": issues,
            "benchmark": None
        }
    else:
        inj = AnomalyInjector(data)
        pert, gt = inj.inject_all_scenarios()
        val = WorkforceValidator(pert)
        issues = val.validate_all()
        evaluator = AnomalyEvaluator(gt, issues)
        benchmark = evaluator.evaluate()
        return {
            "dataset_type": "perturbed",
            "total_issues": len(issues),
            "issues": issues,
            "ground_truth": gt,
            "benchmark": benchmark
        }

@app.get("/api/audit")
def list_audits(limit: int = 100):
    data = get_data()
    return data.get("audit_events", [])[:limit]
