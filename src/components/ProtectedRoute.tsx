import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { sendEmailVerification, User, onAuthStateChanged } from 'firebase/auth';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );

  useEffect(() => {
    let unsubscribe = () => {};

    if (user) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            await user.reload();
          } catch (error) {
            console.error('Error refreshing user:', error);
          }
        }
      });
    }

    return () => unsubscribe();
  }, [user]); // Added user to dependency array

  const handleSendVerificationEmail = async (user: User) => {
    setIsSendingEmail(true);
    try {
      await sendEmailVerification(user);
      setSnackbarMessage(
        'Verification email sent! Please check your inbox and click the verification link.'
      );
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error sending verification email:', error);
      setSnackbarMessage(
        'Failed to send verification email. Please try again later.'
      );
      setSnackbarSeverity('error');
    }
    setIsSendingEmail(false);
    setSnackbarOpen(true);
  };

  if (loading) {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="#f0f2f5"
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Typography variant="h5" gutterBottom align="center">
            Email Verification Required
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Please check your email and click the verification link. After
            verifying, click the button below to continue.
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
            >
              I've Verified My Email
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleSendVerificationEmail(user)}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => auth.signOut()}
            >
              Sign Out
            </Button>
          </Box>
        </Paper>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
