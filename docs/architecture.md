# System Architecture and Design Specification

**Project**: Workforce Scheduling, Constraint Validation and Decision Traceability  
**System Architecture**: Decoupled Full-Stack Architecture with Autonomous Engine  

---

## 1. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                  USER / BROWSER                                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        FRONTEND WEB APPLICATION (NETLIFY)                         |
|   - React 18 + TypeScript + Vite                                                  |
|   - Tailwind CSS Component System                                                 |
|   - Lucide Icons & Recharts Analytics                                             |
|   - Role-Based Access Control (Employee, Manager, HR, IT/Ops, Admin)             |
|   - Dynamic Views: Dashboard, Employees, Teams, Shifts, Leave, Swaps, Audits      |
+-----------------------------------------------------------------------------------+
                 |                                                   |
      (Auth, Direct Data Reads,                              (Optimization API /
       Realtime via Supabase SDK)                             Validation Engine)
                 |                                                   |
                 v                                                   v
+----------------------------------+               +--------------------------------+
|       SUPABASE CLOUD / DB        |               |      PYTHON ENGINE / SERVICE   |
| - Supabase Authentication (JWT)  | <-----------> | - Deterministic Generator      |
| - PostgreSQL Database            |               | - Scheduling Optimizer         |
| - Row Level Security (RLS)       |               | - Constraint Validation Engine |
| - SQL Migrations & Stored Procs  |               | - Anomaly Injection & GT Eval  |
+----------------------------------+               +--------------------------------+
```

---

## 2. Core Architectural Subsystems

### 2.1 Frontend Application (SPA)
- **Framework**: React 18, TypeScript, Vite.
- **Routing**: React Router v6 with route guards for authenticated sessions and role-specific access.
- **State & Data Access**: Supabase Client SDK with optimistic caching, resilient fallbacks, and local dataset hydration.
- **Analytics Visualization**: Recharts library delivering interactive charts for:
  - Skill distribution and coverage gaps.
  - Anomaly precision, recall, and F1-score evaluation.
  - Weekly overtime and employee workload distribution (fairness curve).
- **Deployment Platform**: Netlify, with SPA redirects (`/* /index.html 200`) configured in `netlify.toml`.

### 2.2 Relational Data Tier (Supabase PostgreSQL)
- **Master Data**: Employees (2,000), Teams (100), Skills (60), Shift Templates, Holidays.
- **Transactional Data**: Shift Occurrences, Shift Assignments, Leave Requests (5,000), Attendance Events, Swap Requests.
- **Audit & Governance**: Schedule Runs, Validation Issues, Anomaly Ground Truth, Audit Events, User Profiles.
- **Security**: PostgreSQL Row Level Security (RLS) restricting modification privileges to authorized manager and admin roles, while allowing employees read access to team schedules and write access to their own leave and swap requests.

### 2.3 Python Autonomous Engine
The computational engine handles intensive analytical workloads:
1. **Deterministic Synthetic Data Generator (`data_generator.py`)**:
   - Seed: `20261022`.
   - Generates 2,000 employees, 100 teams, 90-day scheduling horizon, 5,000 leave requests, attendance events, and shift demand.
   - Enforces strict foreign-key dependency hierarchy.
2. **Scheduling Optimization Engine (`scheduler.py`)**:
   - Implements constraint propagation with hard constraint pruning and soft fairness optimization.
   - Respects availability, approved leaves, working hour caps (40h standard, 8h max overtime), and required IT skill proficiencies.
   - Computes explicit coverage gaps when staffing capacity is insufficient.
3. **Constraint Validation Engine (`validator.py`)**:
   - Audits database state against all business rules: double-booking, leave collisions, skill deficiency, overtime breach, unapproved swaps.
4. **Labelled Anomaly Injector & Evaluator (`evaluator.py`)**:
   - Injects the five required test anomalies into an isolated benchmark dataset.
   - Generates decoupled `ground_truth.json` / `ground_truth.csv`.
   - Evaluates detections against ground truth calculating TP, FP, FN, Precision, Recall, and F1-score.

---

## 3. The 5 Labelled Anomaly Scenarios

To ensure rigorous validation of the constraint engine, five explicit anomalies are injected into a controlled test partition:

1. **Scenario 1: Employee Double-Booking**
   - An employee is scheduled for two overlapping shift occurrences on the same day.
   - Rule: `NO_OVERLAPPING_SHIFTS`
   - Detection: Validator detects intersection between `[start_datetime, end_datetime)` for the same employee.
2. **Scenario 2: Approved Leave Collision**
   - An employee with an `APPROVED` leave request is allocated a shift within the leave interval.
   - Rule: `NO_SHIFT_DURING_APPROVED_LEAVE`
   - Detection: Validator matches shift date against `[start_date, end_date]` of approved leaves.
3. **Scenario 3: Required IT Skill Absent**
   - A shift requires a critical IT skill (e.g., Kubernetes Expert), but the assigned employee lacks the skill or required proficiency.
   - Rule: `REQUIRED_SKILL_SATISFACTION`
   - Detection: Validator cross-references assigned employee skills against `coverage_requirements`.
4. **Scenario 4: Overtime Cap Exceeded**
   - An employee's scheduled or actual hours exceed the weekly ceiling of 48.0 hours.
   - Rule: `WEEKLY_HOURS_CEILING_48H`
   - Detection: Rolling 7-day window summation identifies cumulative hours $> 48.0$.
5. **Scenario 5: Shift Swap Applied Without Approval**
   - A swap request transitions directly to `APPLIED` without manager review or while in `REJECTED`/`PENDING` state.
   - Rule: `SWAP_APPLICATION_REQUIRES_MANAGER_APPROVAL`
   - Detection: Lifecycle validator audits `swap_requests` and verifies `decision_timestamp` and `approver_employee_id`.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Workflow / Resource | Employee | Manager | HR Partner | IT/Ops Partner | System Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Personal Schedule | Read | Read | Read | Read | Read |
| View Team Schedules | Read | Read | Read | Read | Read |
| Submit Leave Request | Create | Create | - | - | Create |
| Approve / Reject Leave | - | Full | - | - | Full |
| Request Shift Swap | Create | Create | - | - | Create |
| Approve / Reject Swap | - | Full | - | - | Full |
| Run Schedule Optimizer | - | Execute | - | Execute | Full |
| Manage Skills & Demand | - | - | - | Full | Full |
| View Compliance & Audits | - | Read | Full | Full | Full |
| Run Anomaly Benchmarks | - | - | - | Read | Full |

