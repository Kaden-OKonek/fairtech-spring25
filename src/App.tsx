import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import StudentDashboard from './pages/StudentDashboard';
import UserTypeSelection from './components/UserTypeSelection';
import StudentRegistration from './components/StudentRegistration';
import { UserTypeProvider, useUserType } from './contexts/UserTypeContext';

function AppRoutes() {
	const [user, loading, error] = useAuthState(auth);
	const { userType } = useUserType();
	const navigate = useNavigate();

	useEffect(() => {
		if (user && !userType) {
			navigate('/user-type-selection');
		}
	}, [user, userType, navigate]);

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
				element={user ? <UserTypeSelection /> : <Navigate to="/login" />}
			/>
			<Route
				path="/student-registration"
				element={
					user && userType === 'student' ? (
						<StudentRegistration />
					) : (
						<Navigate to={user ? '/user-type-selection' : '/login'} />
					)
				}
			/>
			<Route
				path="/stud_dashboard"
				element={user ? <StudentDashboard /> : <Navigate to="/login" />}
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
