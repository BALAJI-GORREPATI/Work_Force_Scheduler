import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { TeamsSkillsPage } from './pages/TeamsSkillsPage';
import { SchedulePage } from './pages/SchedulePage';
import { LeavePage } from './pages/LeavePage';
import { SwapsPage } from './pages/SwapsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExportsPage } from './pages/ExportsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Direct Default Entry Point: Redirect Root to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Authenticated / Application Shell */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/teams-skills" element={<TeamsSkillsPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/swaps" element={<SwapsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/exports" element={<ExportsPage />} />
          </Route>

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

