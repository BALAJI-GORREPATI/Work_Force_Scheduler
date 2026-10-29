# Dataset Validation Audit Report

**Audited At**: 2026-10-29T07:03:47.926112Z  
**Baseline Issues**: 0 (Zero integrity breaches in baseline)  
**Perturbed Issues Detected**: 5  

---

## Detected Anomaly Issues in Benchmark Partition

| Issue ID | Issue Type | Entity | Offending Record | Rule Violated | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ISS-0000001` | `DOUBLE_BOOKING` | `shift_assignments` | `ASG-ANOM-0001` | `NO_OVERLAPPING_SHIFTS` | **CRITICAL** |
| `ISS-0000002` | `LEAVE_CONFLICT` | `shift_assignments` | `ASG-ANOM-0002` | `NO_SHIFT_DURING_APPROVED_LEAVE` | **CRITICAL** |
| `ISS-0000003` | `SKILL_MISSING` | `shift_assignments` | `ASG-0000001` | `REQUIRED_SKILL_SATISFACTION` | **HIGH** |
| `ISS-0000004` | `OVERTIME_EXCEEDED` | `shift_assignments` | `ASG-ANOM-OT-06` | `WEEKLY_HOURS_CEILING_48H` | **HIGH** |
| `ISS-0000005` | `UNAPPROVED_SWAP_APPLIED` | `swap_requests` | `SWP-ANOM-0005` | `SWAP_APPLICATION_REQUIRES_MANAGER_APPROVAL` | **CRITICAL** |
