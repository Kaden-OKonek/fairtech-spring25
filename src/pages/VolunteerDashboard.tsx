import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../contexts/AuthContext';

const VolunteerDashboard: React.FC = () => {
  const { authStatus, setUserRole } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Volunteer';

  const handleAdminPromotion = async () => {
    try {
      await setUserRole('admin');
      // AccessGuard will handle navigation
    } catch (error) {
      console.error('Error promoting to admin:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: '20%',
          backgroundColor: '#6a1b9a',
          color: 'white',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Hi {userName}
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Volunteer Information" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Account Settings" />
            </ListItem>
          </List>
        </Box>
        <LogoutButton variant="outlined" color="inherit" />
      </Box>

      <Box sx={{ flexGrow: 1, padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Volunteer Homepage
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <Button
            variant="outlined"
            sx={{ borderColor: '#512da8', color: '#512da8' }}
            onClick={handleAdminPromotion}
          >
            Click to be promoted to Admin (test feature)
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VolunteerDashboard;
