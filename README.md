# WorkForce Scheduler — Workforce Scheduling, Constraint Validation & Decision Traceability

[![Deployment Live](https://img.shields.io/badge/Deployment-Live%20on%20Netlify-00C7B7?logo=netlify&logoColor=white)](https://workforce-scheduler-balaji.netlify.app)
[![Database Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://kjjrhgfmkbjrexzwhgyt.supabase.co)
[![GitHub Repository](https://img.shields.io/badge/GitHub-BALAJI--GORREPATI%2FWork__Force__Scheduler-181717?logo=github&logoColor=white)](https://github.com/BALAJI-GORREPATI/Work_Force_Scheduler)
[![Production Build](https://img.shields.io/badge/Production%20Build-Passing-emerald.svg)](https://github.com/BALAJI-GORREPATI/Work_Force_Scheduler)
[![Benchmark F1](https://img.shields.io/badge/Benchmark%20F1-1.0000-blue.svg)](https://github.com/BALAJI-GORREPATI/Work_Force_Scheduler)
[![Coverage Rate](https://img.shields.io/badge/Coverage%20Rate-98.5%25-teal.svg)](https://github.com/BALAJI-GORREPATI/Work_Force_Scheduler)
[![Deterministic Seed](https://img.shields.io/badge/Seed-20261022-purple.svg)](https://github.com/BALAJI-GORREPATI/Work_Force_Scheduler)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

**Enterprise-grade autonomous workforce management platform** engineered for high-concurrency IT engineering organizations. Built with **React 18, TypeScript, Vite, Tailwind CSS, Python constraint optimization engines, Supabase PostgreSQL with Row Level Security (RLS), and Netlify Edge SPA deployment**.

---

## 🔗 Live Access & Deployment Links

| Resource | URL | Status |
| :--- | :--- | :---: |
| **Live Production Web App** | [https://workforce-scheduler-balaji.netlify.app](https://workforce-scheduler-balaji.netlify.app) | **Live (HTTP 200)** |
| **GitHub Source Repository** | [https://github.com/BALAJI-GORREPATI/Work_Force_Scheduler](https://github.com/BALAJI-GORREPATI/Work_Force_Scheduler) | **Synchronized (`main`)** |
| **Supabase Cloud Database** | [https://kjjrhgfmkbjrexzwhgyt.supabase.co](https://kjjrhgfmkbjrexzwhgyt.supabase.co) | **Connected & Active** |

---

## 1. Executive Summary & Core Pillars

Organizations require dynamic workforce schedules that reconcile:
- Complex multi-tier employee availability and labor caps.
- 5,000 leave requests with self-approval guards and audit trails.
- 100 engineering squads across 7 IT technical domains.
- 90 consecutive days of operational shift occurrences.
- High-priority IT skill proficiencies (Kubernetes, Python, PostgreSQL, Security, etc.).
- 40h standard weekly hours with an 8h overtime cap (48h max ceiling).
- Public holidays, clock-in/out attendance reconciliation, and manager-approved shift swaps.
- Traceable, unalterable historical decision records.

---

## 2. Key Features & Live Database Capabilities

### 2.1 Interactive Employee Directory & Mutation Engine
- **Add Employee**: Create new IT engineering personnel with automatic ID generation (`EMP-XXXXXX`), instant validation, and direct persistence to Supabase without duplicate records.
- **Edit Employee**: Live modal dialog allowing operators to update an employee's first name, last name, primary squad, IT job role, employment status, contract type, and weekly working hours. Changes execute an immediate SQL `UPDATE` against the live database.
- **Soft Deactivation & Reactivation**: Toggle an employee's status to `TERMINATED` (inactive) or `ACTIVE` with one click. Preserves 100% of historical shift assignments, punches, and schedule logs without data deletion.
- **Skill Competency Management**: Assign and remove competencies from the 60 curated IT skills taxonomy with granular proficiency ratings (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`) and years of experience, synchronized in real time to the `employee_skills` table.

### 2.2 End-to-End Leave Lifecycle & Persistence
- **Approve / Reject Workflow**: Operations managers can review, approve, or reject leave requests across 5,000+ records.
- **Permanent Cloud Sync**: Status transitions (`APPROVED` / `REJECTED`) are committed directly to Supabase with approver attribution and decision timestamps, permanently persisting across browser page reloads.
- **Self-Approval Guard**: Built-in authorization constraint prevents employees from approving their own time-off requests.

### 2.3 High-Concurrency Data Hydration
- **PostgREST Range Pagination**: Overcomes default 1,000-row query limits by executing parallel range queries (`range(0, 999)`, `range(1000, 1999)`, etc.) to load 2,000+ employees and 5,000+ leave records seamlessly on app hydration.
- **Optimistic State Management**: Instant UI feedback on mutations backed by reliable cloud database synchronization.

---

## 3. Core Entities & Mandatory Scale

| Entity Name | Required Volume | Key Identifier Convention | Relational Meaning |
| :--- | :--- | :--- | :--- |
| **Employee** | **2,000 distinct** | `EMP-000001` to `EMP-002000` | IT professionals eligible for scheduling |
| **Team** | **100 squads** | `TEAM-001` to `TEAM-100` | Engineering squads (Platform, Backend, SRE, etc.) |
| **Skill** | **60 curated** | `SKILL-001` to `SKILL-060` | Curated IT-only competencies across 7 categories |
| **EmployeeSkill** | **24,000+ mappings**| `ESK-0000001` | Multi-proficiency bridge (Beginner &rarr; Expert) |
| **ShiftTemplate** | **3 shifts (24h)** | `TMPL-01` to `TMPL-03` | 8-hour operational patterns (includes overnight) |
| **ShiftOccurrence**| **90 days** | `SHIFT-YYYY-MM-DD-<code>-<team>`| Concrete dated shift instances across Q1 2026 |
| **CoverageRequirement**| **4,500+ demands** | `REQ-0000001` | Mandatory headcount & critical IT skill slots |
| **ShiftAssignment**| **5,400+ allocations**| `ASG-0000001` | Constraint-satisfied employee-to-shift pairings |
| **LeaveRequest** | **5,000 distinct** | `LVE-2026-000001` to `LVE-2026-005000`| Time-off lifecycle records (Approved, Rejected) |
| **HolidayCalendar**| **Q1 Holidays** | `HOL-2026-01` | Corporate & statutory observed holidays |
| **AttendanceEvent**| **10,800+ punches** | `ATT-<emp>-<timestamp>-<type>` | Reconciled clock-in/out timestamps & worked hours |
| **SwapRequest** | **Full lifecycle** | `SWP-2026-000001` | Peer-to-peer trades with manager authorization |
| **ValidationIssue**| **Audited findings** | `ISS-0000001` | Structured violations detected by engine |
| **AnomalyGroundTruth**| **5 Scenarios** | `ANOM-0001` to `ANOM-0005` | Decoupled benchmark ground-truth labels |
| **ScheduleRun** | **Traceable runs** | `RUN-YYYYMMDD-OPT` | Solver execution logs & fairness metrics |
| **AuditEvent** | **Decision log** | `AUD-0000001` | Immutable security and state-transition trail |

---

## 4. Labelled Anomaly Scenarios & Benchmark Performance

To rigorously audit the constraint validation engine, five explicit anomalies were injected into an isolated benchmark partition:

| Anomaly ID | Scenario Category | Injected Offending Record | Rule Violated | Expected Severity | Detection Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ANOM-0001** | **Scenario 1: Employee Double-Booking** | `ASG-ANOM-0001` | `NO_OVERLAPPING_SHIFTS` | `CRITICAL` | **DETECTED (PASS)** |
| **ANOM-0002** | **Scenario 2: Approved Leave Collision** | `ASG-ANOM-0002` | `NO_SHIFT_DURING_APPROVED_LEAVE` | `CRITICAL` | **DETECTED (PASS)** |
| **ANOM-0003** | **Scenario 3: Required IT Skill Absent** | `ASG-0000001` | `REQUIRED_SKILL_SATISFACTION` | `HIGH` | **DETECTED (PASS)** |
| **ANOM-0004** | **Scenario 4: Overtime Cap Exceeded** | `ASG-ANOM-OT-06` | `WEEKLY_HOURS_CEILING_48H` | `HIGH` | **DETECTED (PASS)** |
| **ANOM-0005** | **Scenario 5: Unapproved Swap Applied** | `SWP-ANOM-0005` | `SWAP_APPLICATION_REQUIRES_MANAGER_APPROVAL`| `CRITICAL` | **DETECTED (PASS)** |

### Precision, Recall and F1-Score Benchmark

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}} = \frac{5}{5 + 0} = 1.0000 \quad (100.0\%)$$

$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}} = \frac{5}{5 + 0} = 1.0000 \quad (100.0\%)$$

$$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} = 1.0000$$

- **Baseline Data**: **0 violations** (100% valid baseline).
- **Perturbed Data**: **5 detections matching 5 ground-truth records**.
- **Bitwise Reproducibility**: 100% verified across independent cycles with seed `20261022`.

---

## 5. System Architecture & Tech Stack

```
WorkForce_Scheduler/
├── frontend/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── public/data/              # Authoritative JSON/CSV exports and manifests
│   └── src/
│       ├── components/           # Navbar, Sidebar, Layout
│       ├── context/              # AuthContext & RBAC Persona Switcher
│       ├── lib/                  # Supabase Client SDK & Configuration
│       ├── pages/                # Operational Modules (Dashboard, Schedule, Employees, Leave, Swaps, Attendance)
│       ├── services/             # Client-side DataService & Optimizer
│       └── types/                # Comprehensive TypeScript Interfaces
├── backend/app/                  # Autonomous Python Computational Engine
│   ├── api/                      # Optional FastAPI endpoints
│   ├── models/                   # Pydantic v2 domain schemas
│   └── services/
│       ├── data_generator.py     # Deterministic Synthetic Generator (Seed: 20261022)
│       ├── scheduler.py          # Constraint Propagation & Fairness Solver
│       ├── validator.py          # Rule Audit & Constraint Integrity Engine
│       ├── anomaly_injector.py   # Labelled Anomaly Benchmark Injector
│       ├── evaluator.py          # Record-level Evaluator (Precision, Recall, F1)
│       └── it_skills_data.py     # 60 Curated IT Skills Taxonomy
├── data/
│   ├── generated/                # CSV & JSON datasets
│   ├── manifests/                # dataset_manifest.json with SHA-256 hashes
│   └── reports/                  # Generation, Validation & Evaluation markdown reports
├── docs/                         # Formal system specifications
│   ├── data_dictionary.md        # Comprehensive data dictionary
│   ├── schema.md                 # Relational schema & Mermaid ER diagram
│   ├── architecture.md           # Full-stack architectural specification
│   └── deployment.md             # Supabase & Netlify deployment manual
├── scripts/
│   ├── generate_and_seed.py      # Master dataset generation & export pipeline
│   └── reproducibility_test.py   # Two-run bitwise reproducibility test
├── supabase/
│   ├── migrations/               # PostgreSQL schema & Row Level Security (RLS)
│   └── seed.sql                  # Direct SQL seeding script
├── tests/
│   └── test_scheduler_suite.py   # Pytest automated test suite (6/6 passing)
├── netlify.toml                  # Netlify production build & SPA redirects
└── requirements.txt              # Python dependencies
```

---

## 6. Quickstart & Local Development

### 6.1 Prerequisites
- Python 3.10+
- Node.js v20+ and npm

### 6.2 Python Engine Setup & Data Generation
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run deterministic generation (Full mode: 2,000 emps, 100 teams, 90 days, 5,000 leaves)
python scripts/generate_and_seed.py --mode full

# 3. Verify reproducibility with two independent cycles
python scripts/reproducibility_test.py

# 4. Run automated pytest test suite
pytest tests/ -v
```

### 6.3 Frontend Single-Page Application Setup
```bash
# 1. Navigate to frontend
cd frontend

# 2. Configure environment
# Ensure .env contains:
# VITE_SUPABASE_URL=https://kjjrhgfmkbjrexzwhgyt.supabase.co
# VITE_SUPABASE_ANON_KEY=<your-supabase-key>

# 3. Install dependencies
npm install

# 4. Launch Vite development server
npm run dev
# Open http://localhost:5173
```

---

## 7. Supabase Database Configuration

1. Create or connect your project in [Supabase](https://supabase.com).
2. Run database migrations located in `supabase/migrations/`:
   - `001_initial_schema.sql` (Creates all tables: `employees`, `teams`, `skills`, `employee_skills`, `shift_templates`, `shift_occurrences`, `shift_assignments`, `coverage_requirements`, `leave_requests`, `attendance_events`, `swap_requests`, `validation_issues`, `anomaly_ground_truth`, `schedule_runs`, `audit_events`).
   - `002_rls_policies.sql` (Configures Row Level Security policies).
3. Populate database records using the automated generator:
   ```bash
   python scripts/generate_and_seed.py --mode full
   ```
4. Set credentials in `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-or-service-role-key>
   ```

---

## 8. Netlify Edge Deployment

The frontend is deployed to Netlify with single-page application fallback routing:
1. Automated build command: `npm run build` inside `frontend/`.
2. Output directory: `frontend/dist/`.
3. SPA URL redirection defined in `netlify.toml` and `frontend/public/_redirects`:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
4. Live deployment URL: **[https://workforce-scheduler-balaji.netlify.app](https://workforce-scheduler-balaji.netlify.app)**
