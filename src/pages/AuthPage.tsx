import React, { useState } from 'react';
import {
  TextField,
  Button,
  Tab,
  Tabs,
  Box,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  AuthError,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const navigate = useNavigate();

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    nonAlphanumeric: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPasswordRequirements({
      length: false,
      lowercase: false,
      uppercase: false,
      nonAlphanumeric: false,
    });
    setShowPasswordRequirements(false);
  };

  const handleSuccessfulAuth = (): void => {
    navigate('/status-check');
  };

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleSuccessfulAuth();
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const handleSignup = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!Object.values(passwordRequirements).every(Boolean)) {
      setError("Password doesn't meet all requirements.");
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

  const handleGoogleSignIn = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleSuccessfulAuth();
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

  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      nonAlphanumeric: /[^a-zA-Z0-9]/.test(password),
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordRequirements(newPassword);
  };

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    setShowPasswordRequirements(false);
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
            onChange={handlePasswordChange}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            margin="normal"
          />
          <Collapse in={showPasswordRequirements}>
            <List dense>
              {Object.entries(passwordRequirements).map(([key, met]) => (
                <ListItem key={key}>
                  <ListItemIcon>
                    {met ? (
                      <CheckCircleOutlineIcon color="success" />
                    ) : (
                      <ErrorOutlineIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      key === 'length'
                        ? 'At least 6 characters'
                        : key === 'lowercase'
                          ? 'Contains lowercase letter'
                          : key === 'uppercase'
                            ? 'Contains uppercase letter'
                            : 'Contains non-alphanumeric character'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
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
