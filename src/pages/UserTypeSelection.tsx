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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserType } from '../contexts/UserTypeContext';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';

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
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleUserTypeSelection = (userType: string) => {
    setSelectedType(userType);
    setOpenConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!user || !selectedType) {
      console.error('No user logged in or no type selected');
      return;
    }

    try {
      // Save user type to Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          userType: selectedType,
          createdAt: new Date(),
        },
        { merge: true }
      );

      setUserType(
        selectedType as 'student' | 'teacher' | 'judge' | 'volunteer'
      );

      if (selectedType === 'student') {
        navigate('/student-registration');
      } else if (selectedType === 'volunteer') {
        navigate('/volunteer-dashboard');
      } else {
        alert(`${selectedType} registration is not implemented yet.`);
      }
    } catch (error) {
      console.error('Error saving user type:', error);
      alert('An error occurred. Please try again.');
    }

    setOpenConfirmDialog(false);
  };

  const handleCancel = () => {
    setOpenConfirmDialog(false);
    setSelectedType(null);
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Select User Type
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Please choose your role carefully. This cannot be changed later.
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

      <Dialog
        open={openConfirmDialog}
        onClose={handleCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Confirm User Type Selection'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You have selected <strong>{selectedType}</strong> as your user type.
            This choice cannot be changed later. Are you sure you want to
            proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTypeSelection;
