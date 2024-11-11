import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from '../components/super-admin-dashboard/Sidebar';
import UserManagement from '../components/super-admin-dashboard/UserManagement';
import Analytics from '../components/super-admin-dashboard/Analytics';
import Settings from '../components/super-admin-dashboard/Settings';
import { SuperAdminContentType } from '../types/superAdmin.types';

const SuperAdminDashboard: React.FC = () => {
  const [activeContent, setActiveContent] =
    useState<SuperAdminContentType>('users');

  const renderContent = () => {
    switch (activeContent) {
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Container maxWidth="xl">{renderContent()}</Container>
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;
