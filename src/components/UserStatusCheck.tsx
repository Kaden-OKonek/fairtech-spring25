import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CircularProgress, Box } from '@mui/material';

const UserStatusCheck: React.FC = () => {
	const [user, loading] = useAuthState(auth);
	const [checkingStatus, setCheckingStatus] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const checkUserStatus = async () => {
			if (user) {
				const userDoc = await getDoc(doc(db, 'users', user.uid));
				if (userDoc.exists()) {
					const userData = userDoc.data();
					if (!userData.userType) {
						navigate('/user-type-selection');
					} else if (userData.userType === 'student' && !userData.firstName) {
						navigate('/student-registration');
					} else {
						navigate('/stud_dashboard');
					}
				} else {
					navigate('/user-type-selection');
				}
			}
			setCheckingStatus(false);
		};

		if (!loading) {
			checkUserStatus();
		}
	}, [user, loading, navigate]);

	if (loading || checkingStatus) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				height="100vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	return null;
};

export default UserStatusCheck;
