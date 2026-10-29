# Synthetic Dataset Generation Report

**System**: Workforce Scheduler  
**Generated At**: 2026-10-29T07:03:47.926112Z  
**Generator Version**: 2.0.0  
**Deterministic Seed**: 20261022  
**Execution Mode**: FULL  

---

## 1. Summary of Generated Entities

| Entity / Table | Record Count | CSV Checksum (SHA-256) |
| :--- | :--- | :--- |
| `employees` | **2,000** | `3c6d2bb60336f5c5...` |
| `teams` | **100** | `fa5f2948686c6c7c...` |
| `skills` | **60** | `dbb0f1019c03b347...` |
| `employee_skills` | **24,471** | `6df422d0b3bf4e02...` |
| `shift_templates` | **3** | `5abb81ab92b447eb...` |
| `holiday_calendars` | **4** | `dbbbb1cda3493301...` |
| `shift_occurrences` | **5,400** | `18be192fe02fec80...` |
| `coverage_requirements` | **5,400** | `a293c6e58fddfd12...` |
| `leave_requests` | **5,000** | `15554ddc1f100d72...` |
| `shift_assignments` | **5,400** | `1ddc2c19713a7491...` |
| `attendance_events` | **10,800** | `c28a5138a90ef37f...` |
| `swap_requests` | **30** | `ab55e6190c5da18b...` |
| `schedule_runs` | **1** | `f4c50a3def7faa3d...` |
| `audit_events` | **30** | `09c2b4025acdbb81...` |
| `anomaly_ground_truth` | **5** | `624a4e929369db87...` |

---

## 2. Key Dataset Milestones
- **Employees**: 2000 distinct employees.
- **Teams**: 100 IT squads across 10 functional departments.
- **Scheduling Horizon**: 90 days (2026-01-01 to 2026-03-31).
- **Leave Requests**: 5000 distinct leave submissions.
- **Shift Assignments**: 5400 valid baseline allocations.
- **Attendance Punches**: 10800 reconciled check-in/out records.
- **Injected Anomaly Scenarios**: 5 labelled anomalies across 5 required categories.
