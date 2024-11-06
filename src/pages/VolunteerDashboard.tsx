import React, { useState } from 'react';
import { Box, Container, Button, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import VolunteerSidebar, {
  VolunteerContentType,
} from '../components/volunteer-dashboard/Sidebar';

const VolunteerDashboard: React.FC = () => {
  const [activeContent, setActiveContent] =
    useState<VolunteerContentType>('tasks');
  const [pendingTasksCount] = useState(0);
  const { setUserRole } = useAuth();

  const handleAdminPromotion = async () => {
    try {
      await setUserRole('admin');
    } catch (error) {
      console.error('Error promoting to admin:', error);
    }
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'tasks':
        return (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                color="primary"
                fontWeight="bold"
              >
                Volunteer Tasks
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track your volunteer activities
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '12px',
                boxShadow: 1,
                p: 3,
              }}
            >
              <p>Task content will go here</p>
              <Button
                variant="outlined"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  mt: 2,
                }}
                onClick={handleAdminPromotion}
              >
                Request Admin Access (test feature)
              </Button>
            </Box>
          </Box>
        );
      case 'profile':
        return (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                color="primary"
                fontWeight="bold"
              >
                Volunteer Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your volunteer information and preferences
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '12px',
                boxShadow: 1,
                p: 3,
              }}
            >
              <p>Profile information will go here</p>
            </Box>
          </Box>
        );
      case 'settings':
        return (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                color="primary"
                fontWeight="bold"
              >
                Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account settings and preferences
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: '12px',
                boxShadow: 1,
                p: 3,
              }}
            >
              <p>Settings options will go here</p>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <VolunteerSidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
        pendingTasksCount={pendingTasksCount}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: 2 }}>{renderContent()}</Box>
        </Container>
      </Box>
    </Box>
  );
};

export default VolunteerDashboard;
