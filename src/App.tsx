import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './theme/ThemeProvider';
import AccessGuard from './components/AccessGuard';

import AuthPage from './pages/AuthPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import UserTypeSelection from './pages/UserTypeSelection';
import JudgeRegistration from './pages/JudgeRegistration';
import StudentRegistration from './pages/StudentRegistration';
import VolunteerRegistration from './pages/VolunteerRegistration';
import JudgeDashboard from './pages/JudgeDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <AccessGuard>
                <LandingPage />
              </AccessGuard>
            }
          />

          <Route
            path="/login"
            element={
              <AccessGuard>
                <AuthPage />
              </AccessGuard>
            }
          />

          {/* Auth flow routes */}
          <Route
            path="/verify-email"
            element={
              <AccessGuard>
                <EmailVerificationPage />
              </AccessGuard>
            }
          />

          <Route
            path="/user-type-selection"
            element={
              <AccessGuard>
                <UserTypeSelection />
              </AccessGuard>
            }
          />

          {/* Role-specific registration routes */}
          <Route
            path="/judge-registration"
            element={
              <AccessGuard>
                <JudgeRegistration />
              </AccessGuard>
            }
          />

          <Route
            path="/student-registration"
            element={
              <AccessGuard>
                <StudentRegistration />
              </AccessGuard>
            }
          />

          <Route
            path="/volunteer-registration"
            element={
              <AccessGuard>
                <VolunteerRegistration />
              </AccessGuard>
            }
          />

          {/* Dashboard routes */}
          <Route
            path="/judge-dashboard"
            element={
              <AccessGuard>
                <JudgeDashboard />
              </AccessGuard>
            }
          />

          <Route
            path="/student-dashboard"
            element={
              <AccessGuard>
                <StudentDashboard />
              </AccessGuard>
            }
          />

          <Route
            path="/volunteer-dashboard"
            element={
              <AccessGuard>
                <VolunteerDashboard />
              </AccessGuard>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <AccessGuard>
                <AdminDashboard />
              </AccessGuard>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
