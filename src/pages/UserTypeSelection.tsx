import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth.types';
import LogoutButton from '../components/LogoutButton';

const userTypes: { label: string; value: UserRole }[] = [
  { label: 'Student', value: 'student' },
  { label: 'Teacher', value: 'teacher' },
  { label: 'Judge', value: 'judge' },
  { label: 'Volunteer', value: 'volunteer' },
];

const UserTypeSelection: React.FC = () => {
  const { setUserRole, logOut } = useAuth();
  const [selectedType, setSelectedType] = useState<UserRole>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleUserTypeSelection = (userType: UserRole) => {
    setSelectedType(userType);
    setOpenConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedType) return;

    try {
      await setUserRole(selectedType);
      // The AccessGuard will automatically redirect based on the new state
    } catch (error) {
      console.error('Error saving user type:', error);
      alert('An error occurred. Please try again.');
    }

    setOpenConfirmDialog(false);
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <LogoutButton onClick={logOut} />
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4, px: 2 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Select User Type
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
            align="center"
          >
            Please choose your role carefully. This cannot be changed later.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {userTypes.map((type) => (
              <Button
                key={type.value}
                variant="contained"
                size="large"
                onClick={() => handleUserTypeSelection(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm User Type Selection
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have selected <strong>{selectedType}</strong> as your user type.
            This choice cannot be changed later. Are you sure you want to
            proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserTypeSelection;
