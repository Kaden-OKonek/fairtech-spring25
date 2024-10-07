import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/stud_dashboard');
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/stud_dashboard" element={<StudentDashboard />} />
    </Routes>
  );
}

export default App;
