# Production Deployment and Environment Configuration Guide

**Project**: Workforce Scheduling, Constraint Validation and Decision Traceability  
**Target Hosts**: Netlify (Frontend) & Supabase (Auth + PostgreSQL)  

---

## 1. Environment Variable Configuration

### 1.1 Frontend (.env)
The frontend uses standard Vite environment variables prefixed with `VITE_`:

```bash
# Supabase Public API Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Backend Service URL (optional for remote optimization engine)
VITE_API_BASE_URL=
```

### 1.2 Backend & Data Generator (.env)
Server-side secrets used for administrative tasks, data migration, and engine execution:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:your-db-password@db.your-project-id.supabase.co:5432/postgres
PORT=8000
RANDOM_SEED=20261022
```

> [!WARNING]
> Never commit `.env` or expose the Supabase `SERVICE_ROLE_KEY` in frontend source code or git history.

---

## 2. Supabase Configuration Step-by-Step

1. **Create Supabase Project**:
   - Log into [Supabase Dashboard](https://supabase.com).
   - Create a new project (e.g., `workforce-scheduler`).
   - Copy the `Project URL` and `anon public` key to your `.env`.

2. **Execute Database Migrations**:
   - Open the **SQL Editor** in your Supabase Dashboard.
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`.
   - Run the RLS policy file: `supabase/migrations/002_rls_policies.sql`.

3. **Seed Database Records**:
   - For fast initialization, run `supabase/seed.sql`.
   - To seed the full dataset (2,000 employees, 100 teams, 90 days, 5,000 leaves), execute the Python generator script:
     ```bash
     python scripts/generate_and_seed.py --mode full
     ```

4. **Configure Authentication**:
   - In Supabase Auth -> Settings, configure URL Configuration:
     - Site URL: `https://your-site-name.netlify.app`
     - Redirect URLs: `https://your-site-name.netlify.app/**`

---

## 3. Netlify Deployment Step-by-Step

1. **Verify `netlify.toml`**:
   Ensure `netlify.toml` resides in the project root with the following configuration:
   ```toml
   [build]
     base = "frontend"
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Connect GitHub to Netlify**:
   - Log in to [Netlify](https://app.netlify.com).
   - Select **Add new site** -> **Import an existing project** -> **GitHub**.
   - Select the `WorkForce_Scheduler` repository.
   - Set Build command: `npm run build` (or automatic from `netlify.toml`).
   - Set Publish directory: `dist`.

3. **Configure Netlify Environment Variables**:
   - Navigate to **Site configuration** -> **Environment variables**.
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Trigger a deploy.

---

## 4. Local Development Instructions

### 4.1 Running the Python Engine & Tests
```bash
# Setup Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt

# Run dataset generation (deterministic seed 20261022)
python scripts/generate_and_seed.py --mode starter # or --mode full

# Run comprehensive test suite
pytest tests/ -v
```

### 4.2 Running the Frontend
```bash
cd frontend
npm install
npm run dev
# The application will launch at http://localhost:5173
```

