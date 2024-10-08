import React, { useState } from 'react';
import { TextField, Button, Tab, Tabs, Box, Divider } from '@mui/material';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully');
      // Handle successful login (e.g., redirect to dashboard)
      navigate('/stud_dashboard'); // Navigate to StudentDashboard
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error(error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up successfully');
      // Handle successful signup (e.g., redirect to dashboard)
      navigate('/stud_dashboard'); // Navigate to StudentDashboard
    } catch (error) {
      setError('Failed to create an account. Please try again.');
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('User signed in with Google successfully');
      // Handle successful Google sign-in (e.g., redirect to dashboard)
      navigate('/stud_dashboard'); // Navigate to StudentDashboard
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>

      {error && (
        <Box sx={{ color: 'error.main', textAlign: 'center', mt: 2 }}>
          {error}
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
