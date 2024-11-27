import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { projectsService } from '../../../services/projects.service';

interface JoinProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onProjectJoined: () => void;
}

const JoinProjectDialog: React.FC<JoinProjectDialogProps> = ({
  open,
  onClose,
  onProjectJoined,
}) => {
  const { authStatus } = useAuth();
  const [projectCode, setProjectCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!authStatus.user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Check if student already has a project
      const existingProject = await projectsService.getStudentProject(
        authStatus.user.uid
      );
      if (existingProject) {
        throw new Error('You are already part of a project');
      }

      // Join project
      await projectsService.joinProject(projectCode.toUpperCase(), {
        userId: authStatus.user.uid,
        firstName: authStatus.metadata?.firstName || '',
        lastName: authStatus.metadata?.lastName || '',
        email: authStatus.user.email,
        joinedAt: new Date(),
        role: 'member',
      });

      onProjectJoined();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Join Project</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Project Code"
          value={projectCode}
          onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
          margin="normal"
          required
          inputProps={{
            maxLength: 5,
            style: { textTransform: 'uppercase' },
          }}
          helperText="Enter the 5-character project code"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || projectCode.length !== 5}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Join Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JoinProjectDialog;
