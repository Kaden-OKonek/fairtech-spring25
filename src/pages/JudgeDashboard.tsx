// pages/JudgeDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import JudgeSidebar, {
  JudgeContentType,
} from '../components/judge-dashboard/Sidebar';
import ProjectScoringList from '../components/judge-dashboard/content/ProjectScoringList';
import ProjectScoringDialog from '../components/judge-dashboard/content/ProjectScoringDialog';
import { judgingService } from '../services/judging.service';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types/project.types';
import { ProjectScore } from '../types/judging.types';

const JudgeDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const [activeContent, setActiveContent] =
    useState<JudgeContentType>('scoring');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [existingScore, setExistingScore] = useState<
    ProjectScore | undefined
  >();
  const [isScoringDialogOpen, setScoringDialogOpen] = useState(false);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);

  // Get pending tasks count on component mount
  useEffect(() => {
    const loadPendingTasks = async () => {
      if (authStatus.user?.uid) {
        const stats = await judgingService.getJudgeStats(authStatus.user.uid);
        setPendingTasksCount(stats.pending);
      }
    };

    loadPendingTasks();
  }, [authStatus.user?.uid]);

  const handleViewProject = async (project: Project) => {
    setSelectedProject(project);
    if (authStatus.user?.uid) {
      // Check if there's an existing score for this project
      const projectData = await judgingService.getProjectScore(
        project.id,
        authStatus.user.uid
      );
      setExistingScore(projectData);
    }
    setScoringDialogOpen(true);
  };

  const handleCloseScoringDialog = () => {
    setScoringDialogOpen(false);
    setSelectedProject(null);
    setExistingScore(undefined);
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'scoring':
        return <ProjectScoringList onViewProject={handleViewProject} />;
      default:
        return null;
    }
  };

  if (authStatus.isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <JudgeSidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
        pendingTasksCount={pendingTasksCount}
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 2 }}>{renderContent()}</Box>
        </Container>
      </Box>

      {/* Scoring Dialog */}
      {selectedProject && (
        <ProjectScoringDialog
          open={isScoringDialogOpen}
          onClose={handleCloseScoringDialog}
          project={selectedProject}
          existingScore={existingScore}
          isAssigned={false} // This would be determined by checking assignments
        />
      )}
    </Box>
  );
};

export default JudgeDashboard;
