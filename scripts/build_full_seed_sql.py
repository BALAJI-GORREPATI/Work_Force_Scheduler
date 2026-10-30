import json
import os

project_root = r"D:\YottaFlex_2.0\WorkForce_Scheduler"
gen_dir = os.path.join(project_root, "data", "generated")
out_sql = os.path.join(project_root, "supabase", "seed.sql")

def escape_str(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

with open(out_sql, "w", encoding="utf-8") as f:
    f.write("-- Master Seed Script for Workforce Scheduler (Deterministic Seed: 20261022)\n\n")

    # 1. Skills
    with open(os.path.join(gen_dir, "skills.json"), "r", encoding="utf-8") as sf:
        skills = json.load(sf)
    f.write("-- 1. Skills (60 Curated IT Skills)\n")
    f.write("INSERT INTO skills (skill_id, skill_name, category, description) VALUES\n")
    s_rows = [f"({escape_str(s['skill_id'])}, {escape_str(s['skill_name'])}, {escape_str(s['category'])}, {escape_str(s['description'])})" for s in skills]
    f.write(",\n".join(s_rows) + "\nON CONFLICT (skill_id) DO NOTHING;\n\n")

    # 2. Teams
    with open(os.path.join(gen_dir, "teams.json"), "r", encoding="utf-8") as tf:
        teams = json.load(tf)
    f.write("-- 2. Teams (100 IT Squads)\n")
    f.write("INSERT INTO teams (team_id, team_name, department) VALUES\n")
    t_rows = [f"({escape_str(t['team_id'])}, {escape_str(t['team_name'])}, {escape_str(t['department'])})" for t in teams]
    f.write(",\n".join(t_rows) + "\nON CONFLICT (team_id) DO NOTHING;\n\n")

    # 3. Shift Templates
    with open(os.path.join(gen_dir, "shift_templates.json"), "r", encoding="utf-8") as stf:
        templates = json.load(stf)
    f.write("-- 3. Shift Templates\n")
    f.write("INSERT INTO shift_templates (template_id, shift_name, shift_code, start_time, end_time, duration_hours, is_overnight) VALUES\n")
    st_rows = [f"({escape_str(st['template_id'])}, {escape_str(st['shift_name'])}, {escape_str(st['shift_code'])}, {escape_str(st['start_time'])}, {escape_str(st['end_time'])}, {st['duration_hours']}, {str(st['is_overnight']).lower()})" for st in templates]
    f.write(",\n".join(st_rows) + "\nON CONFLICT (template_id) DO NOTHING;\n\n")

    # 4. Holiday Calendars
    with open(os.path.join(gen_dir, "holiday_calendars.json"), "r", encoding="utf-8") as hf:
        holidays = json.load(hf)
    f.write("-- 4. Holiday Calendars\n")
    f.write("INSERT INTO holiday_calendars (holiday_id, holiday_date, holiday_name, region_scope, is_paid) VALUES\n")
    h_rows = [f"({escape_str(h['holiday_id'])}, {escape_str(h['holiday_date'])}, {escape_str(h['holiday_name'])}, {escape_str(h['region_scope'])}, {str(h['is_paid']).lower()})" for h in holidays]
    f.write(",\n".join(h_rows) + "\nON CONFLICT (holiday_id) DO NOTHING;\n\n")

    # 5. Employees (All 2,000 Employees)
    with open(os.path.join(gen_dir, "employees.json"), "r", encoding="utf-8") as ef:
        employees = json.load(ef)
    f.write("-- 5. Employees (All 2,000 Employees)\n")
    for i in range(0, len(employees), 500):
        chunk = employees[i:i+500]
        f.write("INSERT INTO employees (employee_id, first_name, last_name, email, primary_team_id, it_job_role, employment_status, employment_type, weekly_max_hours, overtime_cap_hours, hire_date) VALUES\n")
        e_rows = [f"({escape_str(e['employee_id'])}, {escape_str(e['first_name'])}, {escape_str(e['last_name'])}, {escape_str(e['email'])}, {escape_str(e['primary_team_id'])}, {escape_str(e['it_job_role'])}, {escape_str(e['employment_status'])}, {escape_str(e['employment_type'])}, {e['weekly_max_hours']}, {e['overtime_cap_hours']}, {escape_str(e['hire_date'])})" for e in chunk]
        f.write(",\n".join(e_rows) + "\nON CONFLICT (employee_id) DO NOTHING;\n\n")

print(f"Generated seed.sql ({os.path.getsize(out_sql):,} bytes) with all 2,000 employees, 100 teams, 60 skills!")

