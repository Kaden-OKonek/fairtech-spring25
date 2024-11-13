import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import Sidebar, {
  AdminContentType,
} from '../components/admin-dashboard/Sidebar';
import ReviewList from '../components/admin-dashboard/ReviewList';
import { FormReviewDialog } from '../components/admin-dashboard/FormReviewDialog';
import { FormSubmission } from '../types/forms.types';
import { formsService } from '../services/forms.service';
import { Student } from '../types/student.types';
import StudentsList from '../components/admin-dashboard/students/StudentsList';
import StudentDetails from '../components/admin-dashboard/students/StudentDetails';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const [activeContent, setActiveContent] = useState<AdminContentType>('forms');
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [pendingFormsCount, setPendingFormsCount] = useState(0);

  useEffect(() => {
    if (!authStatus.user?.uid) return;

    // Subscribe to forms updates
    const unsubscribe = formsService.subscribeToForms(
      authStatus.user.uid,
      'admin',
      (updatedForms) => {
        setForms(updatedForms);
        // Calculate pending forms count
        const pendingCount = updatedForms.filter(
          (form) => form.status === 'pending'
        ).length;
        setPendingFormsCount(pendingCount);
      }
    );

    return () => unsubscribe();
  }, [authStatus.user?.uid]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentDetailsOpen(true);
  };

  const handleReviewFormSubmit = async (
    formId: string,
    status: FormSubmission['status'],
    comments: string
  ) => {
    if (!authStatus.user?.uid) return;

    await formsService.submitReview(
      formId,
      authStatus.user.uid,
      'primary', // You might want to make this dynamic based on role
      status,
      comments
    );
    setIsReviewDialogOpen(false);
    setSelectedForm(null);
  };

  const handleAssignReviewer = async (
    formId: string,
    reviewerId: string,
    role: 'primary' | 'secondary' | 'final'
  ) => {
    await formsService.assignReviewer(formId, reviewerId, role);
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'forms':
        return (
          <ReviewList
            forms={forms}
            currentUserId={authStatus.user?.uid || ''}
            onViewForm={(form) => {
              setSelectedForm(form);
              setIsReviewDialogOpen(true);
            }}
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
        backgroundColor: 'background.default',
      }}
    >
      <Sidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
        pendingFormsCount={pendingFormsCount}
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

      {/* Form Review Dialog */}
      <FormReviewDialog
        open={isReviewDialogOpen}
        onClose={() => {
          setIsReviewDialogOpen(false);
          setSelectedForm(null);
        }}
        form={selectedForm}
        onSubmit={handleReviewFormSubmit}
        onAssignReviewer={handleAssignReviewer}
      />

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
