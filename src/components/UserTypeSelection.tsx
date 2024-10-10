import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserType } from '../contexts/UserTypeContext';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { db } from '../firebase';

const userTypes = [
	{ label: 'Student', value: 'student' },
	{ label: 'Teacher', value: 'teacher' },
	{ label: 'Judge', value: 'judge' },
	{ label: 'Volunteer', value: 'volunteer' },
];

const UserTypeSelection: React.FC = () => {
	const navigate = useNavigate();
	const { setUserType } = useUserType();
	const [user] = useAuthState(auth);

	const handleUserTypeSelection = async (userType: string) => {
		if (!user) {
			console.error('No user logged in');
			return;
		}

		try {
			// Save user type to Firestore
			await setDoc(
				doc(db, 'users', user.uid),
				{
					userType: userType,
					createdAt: new Date(),
				},
				{ merge: true }
			);

			setUserType(userType as 'student' | 'teacher' | 'judge' | 'volunteer');

			if (userType === 'student') {
				navigate('/student-registration');
			} else {
				alert(`${userType} registration is not implemented yet.`);
			}
		} catch (error) {
			console.error('Error saving user type:', error);
			alert('An error occurred. Please try again.');
		}
	};

	return (
		<Box sx={{ maxWidth: 400, margin: 'auto', mt: 4, textAlign: 'center' }}>
			<Typography variant="h5" gutterBottom>
				Select User Type
			</Typography>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
				{userTypes.map((type) => (
					<Button
						key={type.value}
						variant="contained"
						onClick={() => handleUserTypeSelection(type.value)}
					>
						{type.label}
					</Button>
				))}
			</Box>
		</Box>
	);
};

export default UserTypeSelection;
