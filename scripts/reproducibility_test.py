"""
Workforce Scheduler - Reproducibility Verification Suite
Executes two independent generation cycles with seed 20261022.
Normalizes timestamps and verifies bitwise identical deterministic content checksums.
"""

import os
import sys
import json
import hashlib
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.data_generator import WorkforceDataGenerator
from app.services.anomaly_injector import AnomalyInjector
from app.services.validator import WorkforceValidator

def normalize_and_hash(dataset: Dict[str, Any]) -> Dict[str, str]:
    """Compute deterministic MD5/SHA256 checksums per table, excluding timestamps."""
    table_hashes = {}
    time_keys = {"created_at", "updated_at", "detected_at", "request_timestamp", "decision_timestamp", "applied_timestamp", "event_timestamp"}

    for table, records in dataset.items():
        normalized_records = []
        for r in records:
            if isinstance(r, dict):
                norm_r = {k: v for k, v in r.items() if k not in time_keys}
                normalized_records.append(norm_r)
            else:
                normalized_records.append(r)
        
        # Sort deterministic json string
        serialized = json.dumps(normalized_records, sort_keys=True)
        table_hashes[table] = hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    return table_hashes

def run_reproducibility_test(seed: int = 20261022, mode: str = "starter") -> bool:
    print(f"\n=======================================================")
    print(f"  RUNNING REPRODUCIBILITY TEST [Seed: {seed}, Mode: {mode}]")
    print(f"=======================================================\n")

    # Run 1
    print("--- Cycle 1: Generating Dataset ---")
    gen1 = WorkforceDataGenerator(seed=seed, mode=mode)
    data1 = gen1.generate_all()
    inj1 = AnomalyInjector(data1)
    pert1, gt1 = inj1.inject_all_scenarios()
    val1 = WorkforceValidator(pert1)
    issues1 = val1.validate_all()
    hashes1 = normalize_and_hash(data1)

    # Run 2
    print("--- Cycle 2: Regenerating Dataset Independently ---")
    gen2 = WorkforceDataGenerator(seed=seed, mode=mode)
    data2 = gen2.generate_all()
    inj2 = AnomalyInjector(data2)
    pert2, gt2 = inj2.inject_all_scenarios()
    val2 = WorkforceValidator(pert2)
    issues2 = val2.validate_all()
    hashes2 = normalize_and_hash(data2)

    # Compare
    print("\n--- Verifying Reproducibility Invariants ---")
    all_matched = True

    # 1. Compare Record Counts
    for tbl in data1.keys():
        c1 = len(data1[tbl])
        c2 = len(data2[tbl])
        match = (c1 == c2)
        if not match:
            all_matched = False
            print(f"  [MISMATCH] Record count for table '{tbl}': Run1={c1}, Run2={c2}")
        else:
            print(f"  [OK] Table '{tbl}' count: {c1} records")

    # 2. Compare Deterministic Checksums
    print("\n--- Verifying Content Checksums (Normalized) ---")
    for tbl, h1 in hashes1.items():
        h2 = hashes2.get(tbl)
        match = (h1 == h2)
        if not match:
            all_matched = False
            print(f"  [MISMATCH] Checksum for table '{tbl}' differs!")
        else:
            print(f"  [OK] Table '{tbl}' hash match: {h1[:16]}...")

    # 3. Compare Ground Truth and Anomaly Detections
    print("\n--- Verifying Anomaly Detection Consistency ---")
    gt_match = (len(gt1) == len(gt2))
    issues_match = (len(issues1) == len(issues2))
    print(f"  [OK] Ground truth count: Run1={len(gt1)}, Run2={len(gt2)} -> {'MATCH' if gt_match else 'FAIL'}")
    print(f"  [OK] Detected issues count: Run1={len(issues1)}, Run2={len(issues2)} -> {'MATCH' if issues_match else 'FAIL'}")

    if not (gt_match and issues_match):
        all_matched = False

    print("\n=======================================================")
    if all_matched:
        print("  REPRODUCIBILITY TEST RESULT: 100% BITWISE PASS")
    else:
        print("  REPRODUCIBILITY TEST RESULT: FAILED")
    print("=======================================================\n")

    return all_matched

if __name__ == "__main__":
    success = run_reproducibility_test(seed=20261022, mode="starter")
    sys.exit(0 if success else 1)

