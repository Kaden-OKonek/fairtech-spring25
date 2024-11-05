import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Box,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationPage: React.FC = () => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );
  const { authStatus, logOut, refreshStatus } = useAuth();
  const [cooldownTime, setCooldownTime] = useState<number | null>(null);

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;

    setIsSendingEmail(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setSnackbarMessage('Verification email sent! Please check your inbox.');
      setSnackbarSeverity('success');
      // Set cooldown timer for 60 seconds
      setCooldownTime(60);
      const timer = setInterval(() => {
        setCooldownTime((prevTime) => {
          if (prevTime === null || prevTime <= 1) {
            clearInterval(timer);
            return null;
          }
          return prevTime - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      if (error.code === 'auth/too-many-requests') {
        setSnackbarMessage(
          'Too many attempts. Please wait a few minutes before trying again.'
        );
      } else {
        setSnackbarMessage(
          'Failed to send verification email. Please try again later.'
        );
      }
      setSnackbarSeverity('error');
    } finally {
      setIsSendingEmail(false);
      setSnackbarOpen(true);
    }
  };

  const handleVerificationCheck = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      await refreshStatus();
      if (!auth.currentUser.emailVerified) {
        setSnackbarMessage('Email not verified yet. Please check your inbox.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
      // AccessGuard will handle navigation if email is verified
    }
  };

  if (authStatus.isLoading) {
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
            onClick={handleVerificationCheck}
          >
            I've Verified My Email
          </Button>
          <Button
            variant="outlined"
            onClick={handleSendVerificationEmail}
            disabled={isSendingEmail || cooldownTime !== null}
          >
            {isSendingEmail
              ? 'Sending...'
              : cooldownTime
                ? `Resend Available in ${cooldownTime}s`
                : 'Resend Verification Email'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={logOut}>
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
};

export default EmailVerificationPage;
