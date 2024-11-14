import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  FileUp,
  History,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Eye,
  MessageSquare,
} from 'lucide-react';
import {
  FormSubmission,
  FormVersion,
  ReviewStatus,
} from '../../../types/forms.types';

interface FormSubmissionComponentProps {
  form: FormSubmission;
  onUploadNewVersion: (formId: string, file: File) => Promise<void>;
}

const FormSubmissionComponent: React.FC<FormSubmissionComponentProps> = ({
  form,
  onUploadNewVersion,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<FormVersion | null>(
    null
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUploadNewVersion(form.id, selectedFile);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading new version:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'needs_revision':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'in_review':
        return <Clock size={20} className="text-blue-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
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
        return 'info';
    }
  };

  const currentVersion = form.versions[form.currentVersion];
  const lastReview = currentVersion.reviews[currentVersion.reviews.length - 1];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Form Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6">{form.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date(form.updatedAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={form.status}
            color={getStatusColor(form.status)}
            size="small"
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<History size={16} />}
            onClick={() => setShowHistory(true)}
          >
            History
          </Button>
        </Box>
      </Box>

      {/* Current Version Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Current Version: {currentVersion.versionNumber}
        </Typography>
        {lastReview && (
          <Alert
            severity={getStatusColor(lastReview.status)}
            action={
              <Button
                size="small"
                onClick={() => {
                  setSelectedVersion(currentVersion);
                  setShowFeedbackDialog(true);
                }}
              >
                View Feedback
              </Button>
            }
          >
            {lastReview.comments}
          </Alert>
        )}
      </Box>

      {/* Upload New Version */}
      {form.status === 'needs_revision' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload New Version
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<FileUp size={16} />}
            >
              Select File
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={handleFileSelect}
              />
            </Button>
            {selectedFile && (
              <>
                <Typography variant="body2">{selectedFile.name}</Typography>
                <Button
                  variant="contained"
                  disabled={isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Upload New Version'
                  )}
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}

      {/* Version History Dialog */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          <List>
            {form.versions.map((version, index) => (
              <React.Fragment key={version.versionNumber}>
                <ListItem>
                  <ListItemIcon>{getStatusIcon(version.status)}</ListItemIcon>
                  <ListItemText
                    primary={`Version ${version.versionNumber}`}
                    secondary={new Date(version.uploadedAt).toLocaleString()}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      href={version.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye size={16} />
                    </IconButton>
                    <IconButton href={version.fileUrl} download>
                      <Download size={16} />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedVersion(version);
                        setShowFeedbackDialog(true);
                      }}
                    >
                      <MessageSquare size={16} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < form.versions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={showFeedbackDialog && selectedVersion !== null}
        onClose={() => {
          setShowFeedbackDialog(false);
          setSelectedVersion(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Feedback - Version {selectedVersion?.versionNumber}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedVersion?.reviews.map((review, index) => (
              <ListItem key={index}>
                <ListItemIcon>{getStatusIcon(review.status)}</ListItemIcon>
                <ListItemText
                  primary={review.comments}
                  secondary={`${new Date(review.timestamp).toLocaleString()} - ${review.role} reviewer`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowFeedbackDialog(false);
              setSelectedVersion(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FormSubmissionComponent;
