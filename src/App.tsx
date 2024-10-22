import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import StudentDashboard from './pages/StudentDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserTypeSelection from './pages/UserTypeSelection';
import StudentRegistration from './pages/StudentRegistration';
import { UserTypeProvider, useUserType } from './contexts/UserTypeContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserStatusCheck from './components/UserStatusCheck';
import UploadPDF from './pages/UploadPDF';
import LandingPage from './pages/LandingPage';

function AppRoutes() {
  const [user, loading, error] = useAuthState(auth);
  const { userType } = useUserType();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication page */}
      <Route
        path="/login"
        element={!user ? <AuthPage /> : <Navigate to="/status-check" />}
      />

      {/* Status check after login */}
      <Route
        path="/status-check"
        element={
          <ProtectedRoute>
            <UserStatusCheck />
          </ProtectedRoute>
        }
      />

      {/* User Type Selection page */}
      <Route
        path="/user-type-selection"
        element={
          <ProtectedRoute>
            <UserTypeSelection />
          </ProtectedRoute>
        }
      />

      {/* Student Registration page */}
      <Route
        path="/student-registration"
        element={
          <ProtectedRoute>
            {userType === 'student' ? (
              <StudentRegistration />
            ) : (
              <Navigate to="/user-type-selection" />
            )}
          </ProtectedRoute>
        }
      />

      {/* Student Dashboard */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Volunteer Dashboard */}
      <Route
        path="/volunteer-dashboard"
        element={
          <ProtectedRoute>
            {userType === 'volunteer' ? (
              <VolunteerDashboard />
            ) : (
              <Navigate to="/user-type-selection" />
            )}
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Upload PDF page */}
      <Route
        path="/upload-pdf"
        element={
          <ProtectedRoute>
            <UploadPDF />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <UserTypeProvider>
      <AppRoutes />
    </UserTypeProvider>
  );
}

export default App;
