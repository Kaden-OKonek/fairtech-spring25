import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from '../components/teacher-dashboard/Sidebar';
import ClassContent from '../components/teacher-dashboard/content/ClassContent';
import ProjectsContent from '../components/teacher-dashboard/content/ProjectsContent';
import { TeacherContentType } from '../types/teacher.types';
import { useAuth } from '../contexts/AuthContext';
import { teacherService } from '../services/teacher.service';

const TeacherDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const [activeContent, setActiveContent] =
    useState<TeacherContentType>('class');
  const [pendingProjectsCount, setPendingProjectsCount] = useState(0);

  useEffect(() => {
    const loadPendingProjects = async () => {
      if (authStatus.user?.uid) {
        try {
          const stats = await teacherService.getTeacherStats(
            authStatus.user.uid
          );
          // Consider projects that are active but not yet submitted as pending
          setPendingProjectsCount(stats.activeProjects);
        } catch (error) {
          console.error('Error loading pending projects:', error);
        }
      }
    };

    loadPendingProjects();
  }, [authStatus.user?.uid]);

  const renderContent = () => {
    switch (activeContent) {
      case 'class':
        return <ClassContent />;
      case 'projects':
        return <ProjectsContent />;
      default:
        return <ClassContent />;
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
      <Sidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
        pendingProjectsCount={pendingProjectsCount}
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
        <Container maxWidth="xl">{renderContent()}</Container>
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
