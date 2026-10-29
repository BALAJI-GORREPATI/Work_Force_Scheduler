import os
import sys
import json
import urllib.request
import urllib.error
import time

SUPABASE_URL = "https://kjjrhgfmkbjrexzwhgyt.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqanJoZ2Zta2JqcmV4endoZ3l0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzI4NzU4MywiZXhwIjoyMTA4ODYzNTgzfQ.wWE6bPxK-rYxl_pXALhpXqnsl8iJurAuquhN2YRrHIA"

project_root = r"D:\YottaFlex_2.0\WorkForce_Scheduler"
gen_dir = os.path.join(project_root, "data", "generated")

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def post_chunk(table_name, records):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    data = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        print(f"  [ERROR] {table_name}: HTTP {e.code} - {err_msg[:200]}")
        raise

def seed_table(table_name, file_name, chunk_size=500, preprocessor=None):
    filepath = os.path.join(gen_dir, file_name)
    if not os.path.exists(filepath):
        print(f"Skipping {table_name}: {file_name} not found.")
        return
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if preprocessor:
        data = [preprocessor(dict(row)) for row in data]
        
    total = len(data)
    print(f"Seeding {table_name} ({total:,} records)...")
    
    for i in range(0, total, chunk_size):
        chunk = data[i:i + chunk_size]
        post_chunk(table_name, chunk)
        print(f"  -> Uploaded {min(i + chunk_size, total):,}/{total:,}")
        time.sleep(0.1)
    
    print(f"[DONE] {table_name} seeded successfully ({total:,} records)!\n")

def main():
    print("==================================================")
    print("  WorkForce Scheduler - Automated Supabase Seeder ")
    print("==================================================\n")
    
    # 1. Skills
    seed_table("skills", "skills.json")
    
    # 2. Teams (initial insert without manager_employee_id to avoid circular FK)
    def team_without_mgr(t):
        t["manager_employee_id"] = None
        return t
    seed_table("teams", "teams.json", preprocessor=team_without_mgr)
    
    # 3. Shift Templates & Holidays
    seed_table("shift_templates", "shift_templates.json")
    seed_table("holiday_calendars", "holiday_calendars.json")
    
    # 4. Employees (All 2,000 Employees)
    seed_table("employees", "employees.json", chunk_size=500)
    
    # 5. Restore Teams manager_employee_id now that employees exist
    print("Restoring team managers...")
    seed_table("teams", "teams.json")
    
    # 6. Employee Skills Bridge
    seed_table("employee_skills", "employee_skills.json", chunk_size=1000)
    
    # 7. Schedule & Coverage
    seed_table("schedule_runs", "schedule_runs.json")
    seed_table("shift_occurrences", "shift_occurrences.json", chunk_size=1000)
    seed_table("coverage_requirements", "coverage_requirements.json", chunk_size=1000)
    seed_table("shift_assignments", "shift_assignments.json", chunk_size=1000)
    
    # 8. Operational Activity
    seed_table("leave_requests", "leave_requests.json", chunk_size=1000)
    seed_table("attendance_events", "attendance_events.json", chunk_size=1000)
    seed_table("swap_requests", "swap_requests.json")
    seed_table("validation_issues", "validation_issues.json")
    seed_table("anomaly_ground_truth", "ground_truth.json")
    seed_table("audit_events", "audit_events.json")

    print("==================================================")
    print("  ALL TABLES SEEDED SUCCESSFULLY INTO SUPABASE!   ")
    print("==================================================")

if __name__ == "__main__":
    main()
