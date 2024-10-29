import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Sidebar, {
  AdminContentType,
} from '../components/admin-dashboard/Sidebar';
import FormReviewTable from '../components/admin-dashboard/FormReviewTable';
import FormReviewDialog from '../components/admin-dashboard/FormReviewDialog';
import { FormSubmission } from '../types/forms.types';
import { formsService } from '../services/forms.service';
import { Student } from '../types/student.types';
import StudentsList from '../components/admin-dashboard/students/StudentsList';
import StudentDetails from '../components/admin-dashboard/students/StudentDetails';

const AdminDashboard: React.FC = () => {
  const [activeContent, setActiveContent] = useState<AdminContentType>('forms');
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [pendingFormsCount, setPendingFormsCount] = useState(0);

  useEffect(() => {
    // Subscribe to real-time form updates
    const unsubscribe = formsService.subscribeToForms((updatedForms) => {
      setForms(updatedForms);
      // Calculate pending forms count
      const pendingCount = updatedForms.filter(
        (form) => form.status === 'pending'
      ).length;
      setPendingFormsCount(pendingCount);
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const handleViewForm = (form: FormSubmission) => {
    // TODO: Implement view-only dialog
    console.log('Viewing form:', form);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentDetailsOpen(true);
  };

  const renderContent = () => {
    switch (activeContent) {
      case 'forms':
        return (
          <FormReviewTable
            onViewForm={handleViewForm}
            onEditForm={handleEditForm}
          />
        );
      case 'students':
        return <StudentsList onViewStudent={handleViewStudent} />;
      case 'settings':
        return <div>Settings (To be implemented)</div>;
      default:
        return null;
    }
  };

  const handleEditForm = (form: FormSubmission) => {
    setSelectedForm(form);
    setIsReviewDialogOpen(true);
  };

  const handleReviewSubmit = async (
    formId: string,
    status: FormSubmission['status'],
    comments: string
  ) => {
    await formsService.updateFormStatus(formId, status, comments);
    // Refresh the form list after update
    // TODO: Implement real-time updates using Firebase listeners
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activeContent={activeContent}
        onContentChange={setActiveContent}
        pendingFormsCount={pendingFormsCount}
      />
      <Box sx={{ flexGrow: 1, padding: 4 }}>{renderContent()}</Box>

      <FormReviewDialog
        open={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        form={selectedForm}
        onSubmit={handleReviewSubmit}
      />

      <StudentDetails
        open={isStudentDetailsOpen}
        onClose={() => setIsStudentDetailsOpen(false)}
        student={selectedStudent}
      />
    </Box>
  );
};

export default AdminDashboard;
