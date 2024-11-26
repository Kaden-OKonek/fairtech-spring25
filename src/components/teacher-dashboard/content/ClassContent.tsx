import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Copy, AlertCircle, Trash2, School } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { teacherService } from '../../../services/teacher.service';
import {
  StudentInClass,
  TeacherClass,
  TeacherDashboardStats,
} from '../../../types/teacher.types';

const ClassContent: React.FC = () => {
  const { authStatus } = useAuth();
  const [classData, setClassData] = useState<TeacherClass | null>(null);
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentInClass | null>(
    null
  );
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const loadClassData = async () => {
      if (!authStatus.user?.uid) return;

      try {
        setLoading(true);
        const [teacherClass, teacherStats] = await Promise.all([
          teacherService.getTeacherClass(authStatus.user.uid),
          teacherService.getTeacherStats(authStatus.user.uid),
        ]);

        setClassData(teacherClass);
        setStats(teacherStats);
      } catch (err) {
        setError('Failed to load class information');
        console.error('Error loading class data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClassData();
  }, [authStatus.user?.uid]);

  const handleCopyCode = () => {
    if (authStatus.metadata?.classCode) {
      navigator.clipboard.writeText(authStatus.metadata.classCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleRemoveStudent = async () => {
    if (!selectedStudent || !authStatus.user?.uid) return;

    try {
      await teacherService.removeStudentFromClass(
        authStatus.user.uid,
        selectedStudent.userId
      );

      // Refresh class data
      const updatedClass = await teacherService.getTeacherClass(
        authStatus.user.uid
      );
      setClassData(updatedClass);

      setConfirmRemoveOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      setError('Failed to remove student');
    }
  };

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        My Class
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Class Code Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <School size={24} />
            <Box>
              <Typography variant="h6">Class Code</Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {authStatus.metadata?.classCode}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Copy size={16} />}
              onClick={handleCopyCode}
              sx={{ ml: 'auto' }}
            >
              {copySuccess ? 'Copied!' : 'Copy Code'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">{stats?.totalStudents || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Projects
              </Typography>
              <Typography variant="h4">{stats?.activeProjects || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Submitted Projects
              </Typography>
              <Typography variant="h4">
                {stats?.submittedProjects || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h4">{stats?.totalProjects || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Students List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Students
          </Typography>
          <List>
            {classData?.students && classData.students.length > 0 ? (
              classData.students.map((student) => (
                <ListItem key={student.userId}>
                  <ListItemText
                    primary={`${student.firstName} ${student.lastName}`}
                    secondary={student.email}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Remove student">
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setSelectedStudent(student);
                          setConfirmRemoveOpen(true);
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlertCircle size={18} />
                      <Typography>No students in your class yet</Typography>
                    </Box>
                  }
                  secondary="Share your class code with students to get started"
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Confirm Remove Dialog */}
      <Dialog
        open={confirmRemoveOpen}
        onClose={() => setConfirmRemoveOpen(false)}
      >
        <DialogTitle>Remove Student</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedStudent?.firstName}{' '}
            {selectedStudent?.lastName} from your class?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRemoveStudent}
            color="error"
            variant="contained"
          >
            Remove Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassContent;
