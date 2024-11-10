import React from 'react';
import {
  Box,
  Typography,
  Button,
  Input,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useFormUpload } from '../../../hooks/useFormUpload';

const PaperworkContent: React.FC = () => {
  const {
    selectedFile,
    isUploading,
    uploadStatus,
    errorMessage,
    handleFileChange,
    handleUpload,
  } = useFormUpload();

  const navigate = useNavigate();
  const auth = getAuth();

  const handleGoToQuestionnaire = () => {
    navigate('/form-questionnaire');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'center',
        padding: 4,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Paperwork
      </Typography>

      {/* Custom Information Section */}
      <Box
        sx={{
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: 4,
          width: '100%',
          maxWidth: '800px',
          textAlign: 'center',
        }}
      >
        {/* Questionnaire Section */}
        <Box sx={{ marginBottom: 6 }}>
          <Typography variant="h5" sx={{ marginBottom: 3, color: '#555' }}>
            Not sure what documents you need? Complete the{' '}
            <strong>Form Questionnaire</strong> to get a customized list.
          </Typography>

          <Button
            onClick={handleGoToQuestionnaire}
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#512da8',
              fontSize: '1.2rem',
              padding: '12px 24px',
              height: '60px',
              marginBottom: 3,
              '&:hover': { backgroundColor: '#4527a0' },
            }}
          >
            Form Questionnaire
          </Button>

          <Typography variant="body1" sx={{ marginBottom: 2, color: '#666' }}>
            If your project conditions have changed, you can retake the
            questionnaire anytime by going to the Form Questionnaire under
            paperwork.
          </Typography>

          <Typography variant="body1" sx={{ color: '#666' }}>
            To track the review status of your uploaded files, visit{' '}
            <strong>My Documents</strong> under Paperwork.
          </Typography>
        </Box>

        {/* Upload Section */}
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, color: '#333' }}>
            Upload New Form
          </Typography>

          {!auth.currentUser && (
            <Alert severity="warning" sx={{ marginBottom: 2 }}>
              Please login to upload files.
            </Alert>
          )}

          {auth.currentUser && !auth.currentUser.emailVerified && (
            <Alert severity="warning" sx={{ marginBottom: 2 }}>
              Please verify your email before uploading files.
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
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
                sx={{
                  backgroundColor: '#512da8',
                  padding: '8px 24px',
                  '&:hover': { backgroundColor: '#4527a0' },
                }}
              >
                Select PDF
              </Button>
            </label>

            {selectedFile && (
              <Typography variant="body2" sx={{ color: '#333' }}>
                Selected: {selectedFile.name}
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={
                !selectedFile ||
                isUploading ||
                !auth.currentUser ||
                !auth.currentUser.emailVerified
              }
              sx={{
                backgroundColor: '#512da8',
                width: '200px',
                '&:hover': { backgroundColor: '#4527a0' },
              }}
            >
              {isUploading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Upload PDF'
              )}
            </Button>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {uploadStatus === 'success' && (
              <Alert severity="success">
                File uploaded successfully! It will be reviewed shortly.
              </Alert>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PaperworkContent;
