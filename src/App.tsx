import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import StudentDashboard from './pages/StudentDashboard';
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
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={!user ? <AuthPage /> : <Navigate to="/status-check" />}
      />
      <Route
        path="/status-check"
        element={
          <ProtectedRoute>
            <UserStatusCheck />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-type-selection"
        element={
          <ProtectedRoute>
            <UserTypeSelection />
          </ProtectedRoute>
        }
      />
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
      <Route
        path="/stud_dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
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
