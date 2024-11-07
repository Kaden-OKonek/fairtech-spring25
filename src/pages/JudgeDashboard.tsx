import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import JudgeSidebar, {
  JudgeContentType,
} from '../components/judge-dashboard/Sidebar';

const JudgeDashboard: React.FC = () => {
  const [activeContent, setActiveContent] =
    useState<JudgeContentType>('scoring');
  const [pendingTasksCount] = useState(0);

  const renderContent = () => {
    switch (activeContent) {
      case 'scoring':
        return (
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                color="primary"
                fontWeight="bold"
              >
                Project Scoring
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Score and review projects
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
              <p>Projects list and information will go here.</p>
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
                Judge Profile
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your judge information and preferences
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
      <JudgeSidebar
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

export default JudgeDashboard;
