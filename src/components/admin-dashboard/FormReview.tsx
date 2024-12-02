import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  FormSubmission,
  ReviewStatus,
  ReviewerRole,
} from '../../types/forms.types';

interface FormReviewProps {
  open: boolean;
  onClose: () => void;
  form: FormSubmission;
  onSubmitReview: (
    formId: string,
    status: ReviewStatus,
    comments: string
  ) => Promise<void>;
  onAssignReviewer: (
    formId: string,
    reviewerId: string,
    reviewerName: string,
    role: ReviewerRole
  ) => Promise<void>;
}

const FormReview: React.FC<FormReviewProps> = ({
  open,
  onClose,
  form,
  onSubmitReview,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('pending');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (!comments.trim()) {
      setError('Please enter review comments');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Send the review
      await onSubmitReview(form.id, reviewStatus, comments.trim());

      // Clear form and close
      setReviewStatus('pending');
      setComments('');
      onClose();
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Review submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected':
      case 'needs_revision':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'in_review':
      case 'pending':
        return <Clock className="text-blue-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (
    status: ReviewStatus
  ): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_revision':
        return 'warning';
      case 'in_review':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">{form.title || form.fileName}</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              size="small"
              icon={getStatusIcon(form.status)}
              label={form.status.replace('_', ' ')}
              color={getStatusColor(form.status)}
            />
            <IconButton onClick={onClose} size="small">
              <X size={18} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Document" />
          <Tab label="Reviews & Comments" />
          <Tab label="Version History" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ height: '70vh' }}>
            <iframe
              src={form.versions[form.currentVersion].fileUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Viewer"
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Current Reviews
            </Typography>
            <List>
              {form.versions[form.currentVersion].reviews.map(
                (review, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant="subtitle2">
                            {review.reviewerName} ({review.role} Reviewer)
                          </Typography>
                          <Chip
                            size="small"
                            label={review.status.replace('_', ' ')}
                            color={getStatusColor(review.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {review.comments}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                )
              )}
            </List>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Submit Review
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={reviewStatus}
                  label="Status"
                  onChange={(e) =>
                    setReviewStatus(e.target.value as ReviewStatus)
                  }
                >
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="needs_revision">Needs Revision</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Review Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Version History
            </Typography>
            <List>
              {form.versions.map((version, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`Version ${index + 1}`}
                    secondary={
                      <>
                        <Typography variant="body2">
                          Uploaded:{' '}
                          {new Date(version.uploadedAt).toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => window.open(version.fileUrl)}
                          >
                            <Eye size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            href={version.fileUrl}
                            download
                          >
                            <Download size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setActiveTab(1)}
                          >
                            <MessageSquare size={16} />
                          </IconButton>
                        </Box>
                      </>
                    }
                  />
                  <Chip
                    size="small"
                    icon={getStatusIcon(version.status)}
                    label={version.status.replace('_', ' ')}
                    color={getStatusColor(version.status)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeTab === 1 && (
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={isSubmitting || !comments.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Submit Review'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FormReview;
