import React from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import LogoutButton from '../components/LogoutButton';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const VolunteerDashboard: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
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
            Hi Volunteer
          </Typography>
          <List>
            <ListItem component="button">
              <ListItemText primary="Volunteer Information" />
            </ListItem>
            <ListItem component="button">
              <ListItemText primary="Account Settings" />
            </ListItem>
          </List>
        </Box>
        <LogoutButton variant="outlined" color="inherit" />
      </Box>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Volunteer Homepage
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <Button
            variant="outlined"
            sx={{ borderColor: '#512da8', color: '#512da8' }}
            onClick={() => navigate('/admin-dashboard')}
          >
            Click to be promoted to Admin (test feature)
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VolunteerDashboard;
