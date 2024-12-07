import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Save, MessageCircle, Users } from 'lucide-react';
import { Project } from '../../../types/project.types';
import { ProjectScore, Comment } from '../../../types/judging.types';
import { judgingService } from '../../../services/judging.service';
import { useAuth } from '../../../contexts/AuthContext';

interface ProjectScoringDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  existingScore?: ProjectScore;
  isAssigned?: boolean;
}

const ProjectScoringDialog: React.FC<ProjectScoringDialogProps> = ({
  open,
  onClose,
  project,
  existingScore,
  isAssigned = false,
}) => {
  const { authStatus } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [score, setScore] = useState(existingScore?.score || 0);
  const [publicComment, setPublicComment] = useState('');
  const [internalComment, setInternalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingScore) {
      setScore(existingScore.score);
      // Populate comments based on visibility
      existingScore.comments.forEach((comment) => {
        if (comment.visibility === 'public') {
          setPublicComment(comment.content);
        } else {
          setInternalComment(comment.content);
        }
      });
    }
  }, [existingScore]);

  const handleSubmit = async () => {
    if (!authStatus.user?.uid) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const comments: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>[] = [];
      const authorName = `${authStatus.metadata?.firstName} ${authStatus.metadata?.lastName}`;

      // Add public comment if provided
      if (publicComment.trim()) {
        comments.push({
          authorId: authStatus.user.uid,
          authorName,
          content: publicComment.trim(),
          visibility: 'public',
        });
      }

      // Add internal comment if provided
      if (internalComment.trim()) {
        comments.push({
          authorId: authStatus.user.uid,
          authorName,
          content: internalComment.trim(),
          visibility: 'judges_only',
        });
      }

      await judgingService.submitProjectScore(
        project.id,
        authStatus.user.uid,
        authorName,
        score,
        comments,
        isAssigned
      );

      onClose();
    } catch (err) {
      console.error('Error submitting score:', err);
      setError('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderScoring = () => (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Score (0-100)
      </Typography>
      <TextField
        type="number"
        fullWidth
        value={score}
        onChange={(e) => {
          const newScore = Math.min(100, Math.max(0, Number(e.target.value)));
          setScore(newScore);
        }}
        InputProps={{
          inputProps: {
            min: 0,
            max: 100,
          },
        }}
        variant="outlined"
        sx={{ mt: 2 }}
      />
    </Box>
  );

  const renderComments = () => (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Users size={18} />
          <Typography variant="subtitle1">Public Comments</Typography>
          <Chip size="small" label="Visible to students" />
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Enter feedback that will be visible to students..."
          value={publicComment}
          onChange={(e) => setPublicComment(e.target.value)}
          variant="outlined"
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MessageCircle size={18} />
          <Typography variant="subtitle1">Internal Comments</Typography>
          <Chip size="small" label="Judges & Admins only" color="primary" />
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Enter comments visible only to judges and admins..."
          value={internalComment}
          onChange={(e) => setInternalComment(e.target.value)}
          variant="outlined"
        />
      </Paper>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">{project.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {project.members
            .map((m) => `${m.firstName} ${m.lastName}`)
            .join(', ')}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<Save />} label="Score & Comments" />
        </Tabs>

        {activeTab === 0 ? (
          <Box>
            {renderScoring()}
            {renderComments()}
          </Box>
        ) : (
          <Box>
            {renderScoring()}
            {renderComments()}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
        >
          {isSubmitting ? 'Submitting...' : 'Save Score'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectScoringDialog;
