import React from 'react';
import {
  Box,
  Typography,
  Button,
  Input,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useFormUpload } from '../../../hooks/useFormUpload';
import { FormSubmission } from '../../../types/forms.types';

const PaperworkContent: React.FC = () => {
  const {
    selectedFile,
    isUploading,
    uploadStatus,
    errorMessage,
    submissions,
    handleFileChange,
    handleUpload,
  } = useFormUpload();

  const getStatusColor = (status: FormSubmission['status']) => {
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
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Form Submissions
      </Typography>

      {/* Upload Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Upload New Form
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Input
            type="file"
            onChange={handleFileChange}
            sx={{ display: 'none' }}
            id="pdf-upload-input"
            inputProps={{ accept: '.pdf' }}
          />
          <label htmlFor="pdf-upload-input">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ minWidth: '150px' }}
            >
              Select PDF
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2">
              Selected: {selectedFile.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          sx={{ maxWidth: '200px' }}
        >
          {isUploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Upload Form'
          )}
        </Button>

        {errorMessage && (
          <Alert severity="error" sx={{ maxWidth: '500px' }}>
            {errorMessage}
          </Alert>
        )}

        {uploadStatus === 'success' && (
          <Alert severity="success" sx={{ maxWidth: '500px' }}>
            Form uploaded successfully! It will be reviewed shortly.
          </Alert>
        )}
      </Box>

      {/* Submissions List */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" gutterBottom color="text.secondary">
          Your Submissions
        </Typography>
        <List>
          {submissions.map((submission) => (
            <ListItem
              key={submission.id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={submission.fileName}
                secondary={`Submitted: ${submission.uploadDate.toLocaleDateString()}`}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={submission.status.replace('_', ' ')}
                  color={getStatusColor(submission.status)}
                  size="small"
                />
                {submission.comments && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {submission.comments}
                  </Typography>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default PaperworkContent;
