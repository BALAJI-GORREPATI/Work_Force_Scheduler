-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) policies and RBAC security rules for Workforce Scheduler
-- RDBMS: PostgreSQL (Supabase)

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_ground_truth ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role from user_profiles
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to extract employee_id for authenticated user
CREATE OR REPLACE FUNCTION get_current_user_employee_id()
RETURNS VARCHAR AS $$
    SELECT employee_id FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Master Reference Data: Read access for all authenticated, write for admin / it_ops
CREATE POLICY "Allow read reference data for all users" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read teams for all users" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read shift_templates for all users" ON shift_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read holiday_calendars for all users" ON holiday_calendars FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin and ops to manage skills" ON skills FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'IT_OPS_PARTNER'));

CREATE POLICY "Allow admin to manage teams" ON teams FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'HR_PARTNER'));

-- 2. Employees & Profiles
CREATE POLICY "Allow read employees for authenticated users" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow HR and Admin to modify employees" ON employees FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'HR_PARTNER'));

CREATE POLICY "Allow read employee skills" ON employee_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin and ops to manage employee skills" ON employee_skills FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'IT_OPS_PARTNER', 'MANAGER'));

CREATE POLICY "Allow user to read own profile" ON user_profiles FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR get_current_user_role() = 'ADMIN');

-- 3. Shift Occurrences & Assignments
CREATE POLICY "Allow read shift occurrences" ON shift_occurrences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow managers and ops to manage occurrences" ON shift_occurrences FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'MANAGER', 'IT_OPS_PARTNER'));

CREATE POLICY "Allow read shift assignments" ON shift_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow managers to modify shift assignments" ON shift_assignments FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'MANAGER', 'IT_OPS_PARTNER'));

-- 4. Leave Requests
CREATE POLICY "Allow employees to view their own or managers to view all leave" ON leave_requests FOR SELECT TO authenticated 
USING (
    employee_id = get_current_user_employee_id() 
    OR get_current_user_role() IN ('ADMIN', 'MANAGER', 'HR_PARTNER')
);

CREATE POLICY "Allow employees to submit leave requests" ON leave_requests FOR INSERT TO authenticated 
WITH CHECK (
    employee_id = get_current_user_employee_id() 
    OR get_current_user_role() = 'ADMIN'
);

CREATE POLICY "Allow managers to approve/reject leave requests" ON leave_requests FOR UPDATE TO authenticated 
USING (
    get_current_user_role() IN ('ADMIN', 'MANAGER')
    AND employee_id != get_current_user_employee_id() -- Cannot approve own leave!
);

-- 5. Swap Requests
CREATE POLICY "Allow employees to view swaps they are part of" ON swap_requests FOR SELECT TO authenticated 
USING (
    requesting_employee_id = get_current_user_employee_id() 
    OR target_employee_id = get_current_user_employee_id()
    OR get_current_user_role() IN ('ADMIN', 'MANAGER')
);

CREATE POLICY "Allow employees to create swap requests" ON swap_requests FOR INSERT TO authenticated 
WITH CHECK (
    requesting_employee_id = get_current_user_employee_id()
);

CREATE POLICY "Allow managers to approve/reject/apply swaps" ON swap_requests FOR UPDATE TO authenticated 
USING (
    get_current_user_role() IN ('ADMIN', 'MANAGER')
);

-- 6. Attendance Events
CREATE POLICY "Allow employees to view own attendance and HR/managers to view all" ON attendance_events FOR SELECT TO authenticated 
USING (
    employee_id = get_current_user_employee_id() 
    OR get_current_user_role() IN ('ADMIN', 'MANAGER', 'HR_PARTNER')
);

CREATE POLICY "Allow employees to clock in/out" ON attendance_events FOR INSERT TO authenticated 
WITH CHECK (
    employee_id = get_current_user_employee_id() 
    OR get_current_user_role() = 'ADMIN'
);

-- 7. Coverage Requirements & Schedule Runs
CREATE POLICY "Allow read coverage requirements" ON coverage_requirements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow ops and managers to manage coverage" ON coverage_requirements FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'IT_OPS_PARTNER', 'MANAGER'));

CREATE POLICY "Allow read schedule runs" ON schedule_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow ops and managers to execute schedule runs" ON schedule_runs FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'IT_OPS_PARTNER', 'MANAGER'));

-- 8. Validation Issues & Ground Truth
CREATE POLICY "Allow read validation issues" ON validation_issues FOR SELECT TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'MANAGER', 'IT_OPS_PARTNER', 'HR_PARTNER'));

CREATE POLICY "Allow admin to manage validation issues" ON validation_issues FOR ALL TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'IT_OPS_PARTNER'));

CREATE POLICY "Allow admin to read ground truth" ON anomaly_ground_truth FOR SELECT TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'IT_OPS_PARTNER'));

-- 9. Audit Events
CREATE POLICY "Allow read audit events" ON audit_events FOR SELECT TO authenticated 
USING (get_current_user_role() IN ('ADMIN', 'HR_PARTNER', 'MANAGER'));

CREATE POLICY "Allow system to insert audit events" ON audit_events FOR INSERT TO authenticated 
WITH CHECK (true);

