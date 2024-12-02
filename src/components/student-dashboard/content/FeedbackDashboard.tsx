import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Award, FileText } from 'lucide-react';
import ProjectScoring from './ProjectScoring';
import FormFeedback from './FormFeedback';
import { formsService } from '../../../services/forms.service';
import { judgingService } from '../../../services/judging.service';
import { projectsService } from '../../../services/projects.service';
import { useAuth } from '../../../contexts/AuthContext';
import { FormSubmission } from '../../../types/forms.types';
import { Project } from '../../../types/project.types';
import { ProjectJudgingData } from '../../../types/judging.types';

const FeedbackDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [projectScore, setProjectScore] = useState<ProjectJudgingData | null>(
    null
  );
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!authStatus.user?.uid) return;

      try {
        setLoading(true);
        setError(null);

        // Load student's project
        const project = await projectsService.getStudentProject(
          authStatus.user.uid
        );
        setCurrentProject(project);

        if (project) {
          // Subscribe to project scoring
          const unsubscribeScore = judgingService.subscribeToProjectScores(
            project.id,
            (data) => {
              setProjectScore(data);
            }
          );

          // Subscribe to forms
          const unsubscribeForms = formsService.subscribeToProjectForms(
            project.id,
            (updatedForms) => {
              setForms(updatedForms);
            }
          );

          return () => {
            unsubscribeScore();
            unsubscribeForms();
          };
        }
      } catch (err) {
        console.error('Error loading feedback data:', err);
        setError('Failed to load feedback data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authStatus.user?.uid]);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        {error}
      </Alert>
    );
  }

  if (!currentProject) {
    return (
      <Alert severity="info" className="mb-4">
        You need to create or join a project to see feedback.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" color="primary" className="mb-6">
        Project Feedback
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        className="mb-6"
      >
        <Tab
          icon={<Award className="w-4 h-4" />}
          label="Project Score"
          iconPosition="start"
        />
        <Tab
          icon={<FileText className="w-4 h-4" />}
          label="Form Reviews"
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 ? (
        <ProjectScoring projectScore={projectScore} />
      ) : (
        <Box className="space-y-4">
          {forms.length === 0 ? (
            <Alert severity="info">
              No forms submitted yet. Submit your forms to receive feedback.
            </Alert>
          ) : (
            forms.map((form) => <FormFeedback key={form.id} form={form} />)
          )}
        </Box>
      )}
    </Box>
  );
};

export default FeedbackDashboard;
