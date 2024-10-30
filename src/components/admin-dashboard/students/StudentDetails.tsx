import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
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
  const [forms, setForms] = useState<FormSubmission[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForms = async () => {
      if (student) {
        try {
          const studentForms = await studentsService.getStudentForms(
            student.id
          );
          setForms(studentForms);
        } catch (error) {
          console.error('Error loading student forms:', error);
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
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Forms Summary
            </Typography>
            <Typography>
              Total Forms: {student.formSubmissions?.total || 0}
            </Typography>
            <Typography>
              Pending: {student.formSubmissions?.pending || 0}
            </Typography>
            <Typography>
              Approved: {student.formSubmissions?.approved || 0}
            </Typography>
            <Typography>
              Needs Revision: {student.formSubmissions?.needsRevision || 0}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Form Submissions
            </Typography>
            <List>
              {forms.map((form) => (
                <ListItem key={form.id}>
                  <ListItemText
                    primary={form.fileName}
                    secondary={`Submitted: ${form.uploadDate.toLocaleDateString()} - Status: ${form.status}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetails;
