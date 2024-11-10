import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Sidebar from '../components/student-dashboard/Sidebar';
import ProjectsContent from '../components/student-dashboard/content/ProjectsContent';
import PaperworkContent from '../components/student-dashboard/content/PaperworkContent';
import AccountSettingsContent from '../components/student-dashboard/content/AccountSettingsContent';
import { ContentType } from '../types/studentDashboard';
import FormQuestions from '../components/student-dashboard/content/FormQuestions';
import DocumentsPage from '../components/student-dashboard/content/MyDocuments';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const [activeContent, setActiveContent] = useState<ContentType>('projects');
  const [reviewedFormsCount] = useState(0);
  const { authStatus } = useAuth();

  const renderContent = () => {
    switch (activeContent) {
      case 'paperwork':
        return <PaperworkContent />;
      case 'form-questionnaire':
        return <FormQuestions />;
      case 'my-documents':
        return <DocumentsPage />;
      case 'projects':
        return <ProjectsContent />;
      case 'settings':
        return <AccountSettingsContent />;
      default:
        return <ProjectsContent />;
    }
  };

  if (authStatus.isLoading) {
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
        activeContent={activeContent}
        onContentChange={setActiveContent}
        reviewedFormsCount={reviewedFormsCount}
      />
      <Box sx={{ flexGrow: 1, padding: 4 }}>{renderContent()}</Box>
    </Box>
  );
};

export default StudentDashboard;
