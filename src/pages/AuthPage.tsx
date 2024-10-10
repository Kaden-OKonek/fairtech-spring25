import React, { useState } from 'react';
import {
	TextField,
	Button,
	Tab,
	Tabs,
	Box,
	Divider,
	Typography,
} from '@mui/material';
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	sendEmailVerification,
	AuthError,
	User,
} from 'firebase/auth';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';

interface UserStatusResult {
	isActive: boolean;
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

const AuthPage: React.FC = () => {
	const [tabValue, setTabValue] = useState(0);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
		setError('');
		setEmail('');
		setPassword('');
		setConfirmPassword('');
	};

	const handleSuccessfulAuth = (user: User) => {
		if (user.emailVerified) {
			navigate('/user-type-selection');
		} else {
			setMessage('Please verify your email before accessing the application.');
		}
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			const checkUserStatus = httpsCallable<
				{ userId: string },
				UserStatusResult
			>(functions, 'checkUserStatus');
			const result = await checkUserStatus({ userId: userCredential.user.uid });
			if (result.data.isActive) {
				handleSuccessfulAuth(userCredential.user);
			} else {
				setError('Your account is not active. Please verify your email.');
			}
		} catch (error) {
			handleAuthError(error as AuthError);
		}
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Passwords don't match.");
			return;
		}
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			await sendEmailVerification(userCredential.user);
			setMessage(
				'A verification email has been sent. Please check your inbox and verify your email to activate your account.'
			);
		} catch (error) {
			handleAuthError(error as AuthError);
		}
	};

	const handleGoogleSignIn = async () => {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const checkUserStatus = httpsCallable<
				{ userId: string },
				UserStatusResult
			>(functions, 'checkUserStatus');
			const statusResult = await checkUserStatus({ userId: result.user.uid });
			if (statusResult.data.isActive) {
				handleSuccessfulAuth(result.user);
			} else {
				setError('Your account is not active. Please contact support.');
			}
		} catch (error) {
			handleAuthError(error as AuthError);
		}
	};

	const handleAuthError = (error: AuthError) => {
		switch (error.code) {
			case 'auth/email-already-in-use':
				setError('This email is already in use. Please try another one.');
				break;
			case 'auth/invalid-email':
				setError('Invalid email address. Please check and try again.');
				break;
			case 'auth/weak-password':
				setError('Password is too weak. Please choose a stronger password.');
				break;
			case 'auth/user-not-found':
			case 'auth/wrong-password':
				setError('Invalid email or password. Please try again.');
				break;
			default:
				setError('An error occurred. Please try again.');
				break;
		}
		console.error(error);
	};

	return (
		<Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', mt: 4 }}>
			<Tabs value={tabValue} onChange={handleTabChange} centered>
				<Tab label="Login" />
				<Tab label="Sign Up" />
			</Tabs>

			{error && (
				<Box sx={{ color: 'error.main', textAlign: 'center', mt: 2 }}>
					<Typography variant="body1">{error}</Typography>
				</Box>
			)}

			{message && (
				<Box sx={{ color: 'success.main', textAlign: 'center', mt: 2 }}>
					<Typography variant="body1">{message}</Typography>
				</Box>
			)}

			<TabPanel value={tabValue} index={0}>
				<form onSubmit={handleLogin}>
					<TextField
						fullWidth
						label="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						margin="normal"
					/>
					<TextField
						fullWidth
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						margin="normal"
					/>
					<Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
						Login
					</Button>
				</form>
			</TabPanel>

			<TabPanel value={tabValue} index={1}>
				<form onSubmit={handleSignup}>
					<TextField
						fullWidth
						label="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						margin="normal"
					/>
					<TextField
						fullWidth
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						margin="normal"
						helperText="Please choose a strong password"
					/>
					<TextField
						fullWidth
						label="Confirm Password"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						margin="normal"
					/>
					<Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
						Sign Up
					</Button>
				</form>
			</TabPanel>

			<Divider sx={{ my: 3 }}>OR</Divider>

			<Button
				fullWidth
				variant="outlined"
				onClick={handleGoogleSignIn}
				sx={{ mt: 2 }}
			>
				Sign in with Google
			</Button>
		</Box>
	);
};

export default AuthPage;
