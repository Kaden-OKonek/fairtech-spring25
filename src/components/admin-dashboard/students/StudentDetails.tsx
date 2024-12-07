import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { Student } from '../../../types/student.types';
import { FormSubmission } from '../../../types/forms.types';
import { studentsService } from '../../../services/students.service';

interface StudentDetailsProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({
  open,
  onClose,
  student,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forms, setForms] = useState<FormSubmission[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForms = async () => {
      if (student) {
        setLoading(true);
        try {
          const studentForms = await studentsService.getStudentForms(
            student.id
          );
          setForms(studentForms);
          setError(null);
        } catch (err) {
          console.error('Error loading student forms:', err);
          setError('Failed to load student forms');
        } finally {
          setLoading(false);
        }
      }
    };

    loadForms();
  }, [student]);

  if (!student) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Student Details - {student.firstName} {student.lastName}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Typography>Email: {student.email}</Typography>
            <Typography>School: {student.school}</Typography>
            <Typography>Grade: {student.grade}</Typography>
            <Typography>
              Registration Date: {student.registrationDate.toLocaleDateString()}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Status: ${student.status}`}
                color={student.status === 'active' ? 'success' : 'default'}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetails;
