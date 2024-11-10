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
  Chip,
  Box,
  CircularProgress,
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
  const [loading, setLoading] = useState(true);
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

  const getStatusChipColor = (status: FormSubmission['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_revision':
        return 'warning';
      default:
        return 'default';
    }
  };

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

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Forms Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip
                label={`Total Forms: ${student.formSubmissions?.total || 0}`}
                color="primary"
              />
              <Chip
                label={`Pending: ${student.formSubmissions?.pending || 0}`}
                color="warning"
              />
              <Chip
                label={`Approved: ${student.formSubmissions?.approved || 0}`}
                color="success"
              />
              <Chip
                label={`Needs Revision: ${student.formSubmissions?.needsRevision || 0}`}
                color="error"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Form Submissions
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <List>
                {forms.map((form) => (
                  <ListItem
                    key={form.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={form.fileName}
                      secondary={
                        <>
                          Submitted: {form.uploadDate.toLocaleDateString()}
                          {form.comments && (
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              Comments: {form.comments}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <Chip
                      label={form.status.replace('_', ' ')}
                      color={getStatusChipColor(form.status)}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </ListItem>
                ))}
                {forms.length === 0 && (
                  <Typography color="text.secondary">
                    No forms submitted yet
                  </Typography>
                )}
              </List>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetails;
