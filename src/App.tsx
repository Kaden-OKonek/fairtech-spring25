import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthPage />} /> {/* Login Page */}
          <Route path="/stud_dashboard" element={<StudentDashboard />} />{' '}
          {/* Dashboard Page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
