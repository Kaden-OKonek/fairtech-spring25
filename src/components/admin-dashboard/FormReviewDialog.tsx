import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  History,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  FormSubmission,
  ReviewStatus,
  FormVersion,
} from '../../types/forms.types';
import ReviewerSelect from './ReviewerSelect';

interface FormReviewDialogProps {
  open: boolean;
  onClose: () => void;
  form: FormSubmission | null;
  onSubmit: (
    formId: string,
    status: ReviewStatus,
    comments: string
  ) => Promise<void>;
  onAssignReviewer: (
    formId: string,
    reviewerId: string,
    role: 'primary' | 'secondary' | 'final'
  ) => Promise<void>;
}

export const FormReviewDialog: React.FC<FormReviewDialogProps> = ({
  open,
  onClose,
  form,
  onSubmit,
  onAssignReviewer,
}) => {
  const [status, setStatus] = useState<ReviewStatus>('pending');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(
    null
  );
  const [selectedReviewerRole, setSelectedReviewerRole] = useState<
    'primary' | 'secondary' | 'final'
  >('primary');
  const [selectedVersion, setSelectedVersion] = useState<number>(0); // Track currently viewed version
  const [currentTab, setCurrentTab] = useState(0);

  if (!form) return null;

  const versions = form.versions;
  const currentVersionData = versions[selectedVersion];
  const allReviews = currentVersionData.reviews;

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
      case 'needs_revision':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'in_review':
      case 'pending':
        return <Clock size={20} className="text-blue-500" />;
      default:
        return <MessageSquare size={20} />;
    }
  };

  const getStatusColor = (status: ReviewStatus) => {
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

  const handleSubmit = async () => {
    if (!form) return;
    setIsSubmitting(true);
    try {
      await onSubmit(form.id, status, comments);
      setComments('');
      setStatus('pending');
    } catch (error) {
      console.error('Error updating form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Version navigation handlers
  const handlePreviousVersion = () => {
    if (selectedVersion > 0) {
      setSelectedVersion(selectedVersion - 1);
    }
  };

  const handleNextVersion = () => {
    if (selectedVersion < versions.length - 1) {
      setSelectedVersion(selectedVersion + 1);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            Review Form - Version {selectedVersion + 1} of {versions.length}
          </Typography>
          <Box>
            <IconButton
              onClick={handlePreviousVersion}
              disabled={selectedVersion === 0}
            >
              <ArrowLeft />
            </IconButton>
            <IconButton
              onClick={handleNextVersion}
              disabled={selectedVersion === versions.length - 1}
            >
              <ArrowRight />
            </IconButton>
            <Chip
              icon={getStatusIcon(currentVersionData.status)}
              label={currentVersionData.status.replace('_', ' ')}
              color={getStatusColor(currentVersionData.status)}
            />
          </Box>
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          Uploaded{' '}
          {formatDistanceToNow(currentVersionData.uploadedAt, {
            addSuffix: true,
          })}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
          >
            <Tab label="Document" />
            <Tab label="Reviews & Comments" />
            <Tab label="Version History" />
          </Tabs>
        </Box>

        {currentTab === 0 && (
          <Box sx={{ height: '70vh' }}>
            <iframe
              src={currentVersionData.fileUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Viewer"
            />
          </Box>
        )}

        {currentTab === 1 && (
          <Box>
            {/* Reviewer Assignments */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Assigned Reviewers
              </Typography>
              <List dense>
                {form.reviewers.map((reviewer, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <User />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${reviewer.firstName} ${reviewer.lastName}`}
                      secondary={`${reviewer.role} reviewer - ${reviewer.status}`}
                    />
                    <Chip
                      size="small"
                      label={reviewer.status}
                      color={
                        reviewer.status === 'completed' ? 'success' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                size="small"
                startIcon={<User />}
                onClick={() => setShowAssignDialog(true)}
                sx={{ mt: 1 }}
              >
                Assign Reviewer
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Reviews */}
            <Typography variant="h6" gutterBottom>
              Reviews for Version {selectedVersion + 1}
            </Typography>
            <List sx={{ mb: 2 }}>
              {allReviews.map((review, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        <User />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle2">
                            {review.reviewerName} ({review.role} Reviewer)
                          </Typography>
                          <Chip
                            size="small"
                            label={review.status.replace('_', ' ')}
                            color={getStatusColor(review.status)}
                            icon={getStatusIcon(review.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {review.comments}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            {formatDistanceToNow(review.timestamp, {
                              addSuffix: true,
                            })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < allReviews.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>

            {/* New Review Form */}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value as ReviewStatus)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_review">In Review</MenuItem>
                  <MenuItem value="needs_revision">Needs Revision</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Add Comment"
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Box>
          </Box>
        )}

        {currentTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Version History
            </Typography>
            <List>
              {versions.map((version: FormVersion, index: number) => (
                <ListItemButton
                  key={index}
                  selected={index === selectedVersion}
                  onClick={() => setSelectedVersion(index)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <History />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Version ${index + 1}`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Uploaded{' '}
                          {formatDistanceToNow(version.uploadedAt, {
                            addSuffix: true,
                          })}
                        </Typography>
                        <br />
                        <Chip
                          size="small"
                          label={version.status.replace('_', ' ')}
                          color={getStatusColor(version.status)}
                        />
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {currentTab === 1 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !comments.trim()}
          >
            Submit Review
          </Button>
        )}
      </DialogActions>

      {/* Assign Reviewer Dialog */}
      <Dialog
        open={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Reviewer</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Reviewer Role</InputLabel>
            <Select
              value={selectedReviewerRole}
              label="Reviewer Role"
              onChange={(e) =>
                setSelectedReviewerRole(
                  e.target.value as 'primary' | 'secondary' | 'final'
                )
              }
            >
              <MenuItem value="primary">Primary Reviewer</MenuItem>
              <MenuItem value="secondary">Secondary Reviewer</MenuItem>
              <MenuItem value="final">Final Reviewer</MenuItem>
            </Select>
          </FormControl>

          <ReviewerSelect
            value={selectedReviewerId}
            onChange={setSelectedReviewerId}
            excludeUserIds={form.reviewers.map((r) => r.userId)}
            label="Select Reviewer"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              if (selectedReviewerId) {
                await onAssignReviewer(
                  form.id,
                  selectedReviewerId,
                  selectedReviewerRole
                );
                setShowAssignDialog(false);
                setSelectedReviewerId(null);
                setSelectedReviewerRole('primary');
              }
            }}
            variant="contained"
            disabled={!selectedReviewerId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default FormReviewDialog;
