import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from '../components/student-dashboard/Sidebar';
import ProjectsContent from '../components/student-dashboard/content/ProjectsContent';
import PaperworkContent from '../components/student-dashboard/content/PaperworkContent';
import AccountSettingsContent from '../components/student-dashboard/content/AccountSettingsContent';
import { ContentType } from '../types/studentDashboard';
import { useUserData } from '../hooks/useUserData';

const StudentDashboard: React.FC = () => {
  const [activeContent, setActiveContent] = useState<ContentType>('projects');
  const { userName, isLoading } = useUserData();

  const renderContent = () => {
    switch (activeContent) {
      case 'paperwork':
        return <PaperworkContent />;
      case 'projects':
        return <ProjectsContent />;
      case 'settings':
        return <AccountSettingsContent />;
      default:
        return <ProjectsContent />;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        userName={userName}
        activeContent={activeContent}
        onContentChange={setActiveContent}
      />
      <Box sx={{ flexGrow: 1, padding: 4 }}>{renderContent()}</Box>
    </Box>
  );
};

export default StudentDashboard;
