import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import Sidebar, {
  AdminContentType,
} from '../components/admin-dashboard/Sidebar';
import ProjectReviewList from '../components/admin-dashboard/ProjectReviewList';
import ProjectReviewDialog from '../components/admin-dashboard/ProjectReviewDialog';
import StudentsList from '../components/admin-dashboard/students/StudentsList';
import StudentDetails from '../components/admin-dashboard/students/StudentDetails';
import { useAuth } from '../contexts/AuthContext';
import { projectsService } from '../services/projects.service';
import { projectFormsService } from '../services/project-forms.service';
import { Project } from '../types/project.types';
import { FormSubmission, ReviewStatus } from '../types/forms.types';
import { Student } from '../types/student.types';

interface ProjectWithForms extends Project {
  forms: FormSubmission[];
  totalForms: number;
  reviewedForms: number;
}

const AdminDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const [activeContent, setActiveContent] =
    useState<AdminContentType>('projects');
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // Projects state
  const [projects, setProjects] = useState<ProjectWithForms[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithForms | null>(null);
  const [isProjectReviewOpen, setIsProjectReviewOpen] = useState(false);
  const [pendingProjectsCount, setPendingProjectsCount] = useState(0);

  // Students state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);

  useEffect(() => {
    if (!authStatus.user?.uid) return;

    const unsubscribe = projectsService.subscribeToProjects(
      (updatedProjects) => {
        Promise.all(
          updatedProjects.map(async (project) => {
            // Get forms for each project
            const forms = await new Promise<FormSubmission[]>((resolve) => {
              const unsubForms = projectFormsService.subscribeToProjectForms(
                project.id,
                (projectForms) => {
                  unsubForms(); // Unsubscribe immediately as we just want one snapshot
                  resolve(projectForms);
                }
              );
            });

            const reviewedForms = forms.filter(
              (form) => form.status === 'approved' || form.status === 'rejected'
            ).length;

            return {
              ...project,
              forms,
              totalForms: forms.length,
              reviewedForms,
            };
          })
        ).then((projectsWithForms) => {
          setProjects(projectsWithForms);
          setPendingProjectsCount(
            projectsWithForms.filter((p) => p.status === 'submitted').length
          );
          setLoading(false);
        });
      }
    );

    return () => unsubscribe();
  }, [authStatus.user?.uid]);

  const handleViewProject = (project: ProjectWithForms) => {
    setSelectedProject(project);
    setIsProjectReviewOpen(true);
  };

  const handleUpdateProjectStatus = async (
    projectId: string,
    status: ReviewStatus,
    comments?: string
  ) => {
    try {
      if (!authStatus.user?.uid) return;

      await projectsService.updateProjectStatus(
        projectId,
        status,
        authStatus.user.uid,
        comments
      );

      setIsProjectReviewOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Error updating project status:', err);
      setError('Failed to update project status');
    }
  };

  const handleFormReview = async (
    formId: string,
    status: ReviewStatus,
    comments: string
  ) => {
    try {
      if (!authStatus.user?.uid || !authStatus.metadata) return;

      const reviewerName = `${authStatus.metadata.firstName} ${authStatus.metadata.lastName}`;

      await projectFormsService.submitReview(
        formId,
        {
          reviewerId: authStatus.user.uid,
          reviewerName,
          reviewerEmail: authStatus.user.email,
          comments,
          role: 'primary',
          status,
        },
        status
      );
    } catch (err) {
      console.error('Error submitting form review:', err);
      throw err;
    }
  };

  const handleAssignReviewer = async (
    formId: string,
    reviewerId: string,
    reviewerName: string,
    role: 'primary' | 'secondary' | 'final'
  ) => {
    try {
      await projectFormsService.assignReviewer(
        formId,
        reviewerId,
        reviewerName,
        role
      );
    } catch (err) {
      console.error('Error assigning reviewer:', err);
      setError('Failed to assign reviewer');
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentDetailsOpen(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      );
    }

    switch (activeContent) {
      case 'projects':
        return (
          <ProjectReviewList
            projects={projects}
            currentUserId={authStatus.user?.uid || ''}
            onViewProject={handleViewProject}
          />
        );
      case 'students':
        return <StudentsList onViewStudent={handleViewStudent} />;
      case 'settings':
        return <div>Settings Content</div>;
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
        pendingProjectsCount={pendingProjectsCount}
      />

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 2 }}>{renderContent()}</Box>
        </Container>
      </Box>

      {/* Project Review Dialog */}
      {selectedProject && (
        <ProjectReviewDialog
          open={isProjectReviewOpen}
          onClose={() => {
            setIsProjectReviewOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onUpdateProjectStatus={handleUpdateProjectStatus}
          onSubmitFormReview={handleFormReview}
          onAssignReviewer={handleAssignReviewer}
        />
      )}

      {/* Student Details Dialog */}
      <StudentDetails
        open={isStudentDetailsOpen}
        onClose={() => {
          setIsStudentDetailsOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </Box>
  );
};

export default AdminDashboard;
