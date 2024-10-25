import React from 'react';
import { Typography, Box, Paper, TextField, Button, Grid } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { UserProfile, StudentProfile } from '../../../types/auth.types';

const AccountSettingsContent: React.FC = () => {
  const { authStatus } = useAuth();
  const userData = authStatus.metadata || {};

  // Type guard for checking if metadata contains student-specific fields
  const hasStudentData = (
    data: Partial<UserProfile>
  ): data is Partial<StudentProfile> => {
    return data?.userType === 'student';
  };

  const renderProfileSpecificFields = () => {
    if (hasStudentData(userData)) {
      return (
        <>
          {userData.school !== undefined && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School"
                value={userData.school}
                disabled
              />
            </Grid>
          )}
          {userData.grade !== undefined && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade"
                value={userData.grade}
                disabled
              />
            </Grid>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={userData.firstName || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={userData.lastName || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={authStatus.user?.email || ''}
              disabled
            />
          </Grid>
          {userData.phone !== undefined && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={userData.phone}
                disabled
              />
            </Grid>
          )}
          {renderProfileSpecificFields()}
          <Grid item xs={12}>
            <Button variant="contained" color="primary" sx={{ mr: 2 }}>
              Update Password
            </Button>
            <Button variant="outlined" color="primary">
              Update Contact Info
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AccountSettingsContent;
