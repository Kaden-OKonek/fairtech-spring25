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
  Paper,
  //AppBar,
  //Toolbar,
} from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
//import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import dnaBackgroundImage from '../assets/images/SciFairProjectBackgroundNew.png';

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

//const dnaBackgroundImage = '../assets/images/SciFairProjectBackground.png';

const AuthPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const { signIn, signUp } = useAuth();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // AuthContext will handle the navigation based on user state
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
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
      await signUp(email, password);
      setMessage(
        'A verification email has been sent. Please check your inbox.'
      );
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // AuthContext will handle the navigation based on user state
    } catch (error) {
      setError('Google sign-in failed');
    }
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
    <Box
      sx={{
        position: 'fixed', // Fixed to cover entire viewport
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '100vh', // Ensure it covers full height
        backgroundImage: `url(${dnaBackgroundImage})`,
        backgroundSize: 'cover', // Scale image to cover entire area
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat', // Prevent image from repeating
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto', // Allow scrolling if content exceeds viewport
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          margin: 'auto',
          mt: 4,
          px: 2,
        }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Welcome to the Southern Minnesota Science Fair
          </Typography>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 3,
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {error && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                color="error"
                align="center"
                sx={{
                  backgroundColor: 'error.light',
                  color: 'error.main',
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {error}
              </Typography>
            </Box>
          )}

          {message && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                align="center"
                sx={{
                  backgroundColor: 'success.light',
                  color: 'success.main',
                  p: 1,
                  borderRadius: 1,
                }}
              >
                {message}
              </Typography>
            </Box>
          )}

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ mt: 1 }}
                >
                  Login
                </Button>
              </Box>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSignup}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                />
                <Collapse in={showPasswordRequirements}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <List dense>
                      {Object.entries(passwordRequirements).map(
                        ([key, met]) => (
                          <ListItem key={key} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {met ? (
                                <CheckCircleOutlineIcon className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {key === 'length'
                                    ? 'At least 6 characters'
                                    : key === 'lowercase'
                                      ? 'Contains lowercase letter'
                                      : key === 'uppercase'
                                        ? 'Contains uppercase letter'
                                        : 'Contains non-alphanumeric character'}
                                </Typography>
                              }
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </Paper>
                </Collapse>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ mt: 1 }}
                >
                  Sign Up
                </Button>
              </Box>
            </form>
          </TabPanel>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignIn}
            size="large"
          >
            Sign in with Google
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default AuthPage;
