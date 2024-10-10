import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useUserType } from '../contexts/UserTypeContext';

const validationSchema = Yup.object().shape({
	firstName: Yup.string().required('First name is required'),
	lastName: Yup.string().required('Last name is required'),
	school: Yup.string().required('School name is required'),
	grade: Yup.number()
		.required('Grade is required')
		.min(1, 'Grade must be at least 1')
		.max(12, 'Grade must be at most 12'),
});

const StudentRegistration: React.FC = () => {
	const navigate = useNavigate();
	const [user] = useAuthState(auth);
	const { userType } = useUserType();
	const [registrationError, setRegistrationError] = useState<string | null>(
		null
	);

	const handleSubmit = async (values: any, { setSubmitting }: any) => {
		if (!user) {
			setRegistrationError('User not authenticated');
			setSubmitting(false);
			return;
		}

		if (userType !== 'student') {
			setRegistrationError('Invalid user type');
			setSubmitting(false);
			return;
		}

		try {
			// Update the user document in Firestore
			await setDoc(
				doc(db, 'users', user.uid),
				{
					firstName: values.firstName,
					lastName: values.lastName,
					school: values.school,
					grade: values.grade,
					updatedAt: new Date(),
				},
				{ merge: true }
			);

			console.log('Registration successful');
			setSubmitting(false);
			navigate('/stud_dashboard');
		} catch (error) {
			console.error('Error during registration:', error);
			setRegistrationError(
				'An error occurred during registration. Please try again.'
			);
			setSubmitting(false);
		}
	};

	return (
		<Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
			<Typography variant="h5" gutterBottom>
				Student Registration
			</Typography>
			{registrationError && (
				<Typography color="error" sx={{ mb: 2 }}>
					{registrationError}
				</Typography>
			)}
			<Formik
				initialValues={{
					firstName: '',
					lastName: '',
					school: '',
					grade: '',
					interests: '',
				}}
				validationSchema={validationSchema}
				onSubmit={handleSubmit}
			>
				{({ errors, touched, isSubmitting }) => (
					<Form>
						<Field
							as={TextField}
							fullWidth
							name="firstName"
							label="First Name"
							error={touched.firstName && errors.firstName}
							helperText={touched.firstName && errors.firstName}
							margin="normal"
						/>
						<Field
							as={TextField}
							fullWidth
							name="lastName"
							label="Last Name"
							error={touched.lastName && errors.lastName}
							helperText={touched.lastName && errors.lastName}
							margin="normal"
						/>
						<Field
							as={TextField}
							fullWidth
							name="school"
							label="School"
							error={touched.school && errors.school}
							helperText={touched.school && errors.school}
							margin="normal"
						/>
						<Field
							as={TextField}
							fullWidth
							name="grade"
							label="Grade"
							type="number"
							error={touched.grade && errors.grade}
							helperText={touched.grade && errors.grade}
							margin="normal"
						/>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							disabled={isSubmitting}
							sx={{ mt: 2 }}
						>
							Submit
						</Button>
					</Form>
				)}
			</Formik>
		</Box>
	);
};

export default StudentRegistration;
