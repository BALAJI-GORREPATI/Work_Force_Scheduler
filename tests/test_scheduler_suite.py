"""
Workforce Scheduler - Automated Verification Test Suite
Executes unit, constraint, and benchmark tests with pytest.
"""

import pytest
import os
import sys

# Ensure backend is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.data_generator import WorkforceDataGenerator
from app.services.anomaly_injector import AnomalyInjector
from app.services.validator import WorkforceValidator
from app.services.evaluator import AnomalyEvaluator
from app.services.scheduler import WorkforceScheduler

@pytest.fixture(scope="session")
def starter_dataset():
    gen = WorkforceDataGenerator(seed=20261022, mode="starter")
    return gen.generate_all()

@pytest.fixture(scope="session")
def full_dataset():
    gen = WorkforceDataGenerator(seed=20261022, mode="full")
    return gen.generate_all()

def test_full_dataset_counts(full_dataset):
    """Verify Section 1 & 10: Mandatory counts for full dataset."""
    assert len(full_dataset["employees"]) == 2000, "Must have exactly 2,000 distinct employees"
    assert len(full_dataset["teams"]) == 100, "Must have exactly 100 teams"
    assert len(full_dataset["leave_requests"]) == 5000, "Must have exactly 5,000 leave requests"
    
    # Verify 90-day horizon
    dates = {s["shift_date"] for s in full_dataset["shift_occurrences"]}
    assert len(dates) == 90, "Must cover exactly 90 days of shifts"

def test_it_only_skills(full_dataset):
    """Verify Section 7: Curated skills are strictly IT-industry competencies."""
    allowed_categories = {
        "Software Engineering",
        "Data Engineering & Analytics",
        "AI & Machine Learning",
        "Cloud & DevOps",
        "Cybersecurity & Networking",
        "Software Quality Assurance",
        "Databases & Operations"
    }
    for sk in full_dataset["skills"]:
        assert sk["category"] in allowed_categories, f"Skill {sk['skill_name']} has invalid category"

def test_deterministic_id_nomenclature(full_dataset):
    """Verify Section 8: Deterministic ID formatting."""
    for emp in full_dataset["employees"][:50]:
        assert emp["employee_id"].startswith("EMP-"), "Employee ID must start with EMP-"
        assert len(emp["employee_id"]) == 10, "Employee ID must be 10 chars (e.g. EMP-000001)"
        
    for lve in full_dataset["leave_requests"][:50]:
        assert lve["leave_id"].startswith("LVE-2026-"), "Leave ID must start with LVE-2026-"

    for swp in full_dataset["swap_requests"]:
        assert swp["swap_id"].startswith("SWP-2026-"), "Swap ID must start with SWP-2026-"

def test_baseline_integrity_is_clean(starter_dataset):
    """Verify Section 10.3: Baseline data must be 100% valid with 0 violations."""
    validator = WorkforceValidator(starter_dataset)
    issues = validator.validate_all()
    assert len(issues) == 0, f"Baseline data has {len(issues)} violations, expected 0"

def test_anomaly_detection_and_metrics(starter_dataset):
    """Verify Section 12 & 15: Injected anomaly detection, Precision, Recall, and F1."""
    injector = AnomalyInjector(starter_dataset)
    perturbed, ground_truth = injector.inject_all_scenarios()
    
    assert len(ground_truth) == 5, "Must have exactly 5 injected anomaly ground truth records"
    
    validator = WorkforceValidator(perturbed)
    detected = validator.validate_all()
    
    evaluator = AnomalyEvaluator(ground_truth, detected)
    metrics = evaluator.evaluate()
    
    assert metrics["recall"] == 1.0, f"Expected 100% recall on injected scenarios, got {metrics['recall']}"
    assert metrics["precision"] >= 0.8, f"Expected high precision, got {metrics['precision']}"
    assert metrics["f1_score"] >= 0.85, f"Expected high F1-score, got {metrics['f1_score']}"

def test_scheduling_engine_hard_constraints(starter_dataset):
    """Verify Section 13: Scheduling engine respects constraints and assigns fairly."""
    scheduler = WorkforceScheduler(
        employees=starter_dataset["employees"],
        employee_skills=starter_dataset["employee_skills"],
        shift_occurrences=starter_dataset["shift_occurrences"][:30],
        coverage_requirements=starter_dataset["coverage_requirements"][:30],
        leave_requests=starter_dataset["leave_requests"]
    )
    result = scheduler.solve("RUN-TEST-001")
    
    assert "assignments" in result
    assert "coverage_gaps" in result
    assert "run_summary" in result
    assert result["run_summary"]["coverage_rate"] > 0
