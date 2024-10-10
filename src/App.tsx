import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import StudentDashboard from './pages/StudentDashboard';
import UserTypeSelection from './components/UserTypeSelection';
import StudentRegistration from './components/StudentRegistration';
import { UserTypeProvider, useUserType } from './contexts/UserTypeContext';
import ProtectedRoute from './components/ProtectedRoute';

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
			<Route
				path="/login"
				element={!user ? <AuthPage /> : <Navigate to="/user-type-selection" />}
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
				path="*"
				element={<Navigate to={user ? '/user-type-selection' : '/login'} />}
			/>
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
