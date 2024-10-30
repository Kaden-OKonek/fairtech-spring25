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
import { useFileUpload } from '../../../hooks/useFileUpload';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const PaperworkContent: React.FC = () => {
  const {
    selectedFile,
    isUploading,
    uploadStatus,
    errorMessage,
    submissions,
    handleFileChange,
    handleUpload,
  } = useFileUpload();

  const navigate = useNavigate(); // Initialize useNavigate

  const handleGoToQuestionnaire = () => {
    navigate('/form-questionnaire'); // Navigate to the Form Questionnaire page
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Typography variant="h4" gutterBottom>
        PaperWork
      </Typography>

      <Typography
        variant="h5"
        align="justify"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        Not sure what documents you need? Complete the{' '}
        <strong>Form Questionnaire</strong> to get a customized list.
        <br />
      </Typography>
      <Typography
        variant="h5"
        align="center"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        Click here to get the Form Questionnaire.
        <br />
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToQuestionnaire} // Add the onClick event
          sx={{
            backgroundColor: '#512da8',
            marginRight: 2,
            fontSize: '1.5rem',
            padding: '12px 24px',
            width: '50%',
            height: '80px',
            '&:hover': { backgroundColor: '#4527a0' },
          }}
        >
          Form Questionnaire
        </Button>
      </Typography>
      <br />
      <Typography
        variant="h5"
        align="center"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        If your project conditions have changed , you can retake the
        questionnaire anytime by going to the Form Questionnaire under
        paperwork. .
      </Typography>
      <br />
      <br />
      <Typography
        variant="h5"
        align="center"
        sx={{ marginTop: 1, width: '80%', maxWidth: '500px' }}
      >
        To track the review status of your uploaded files, visit{' '}
        <strong>My Documents</strong> under Paperwork.
      </Typography>

      {!auth.currentUser && (
        <Alert
          severity="warning"
          sx={{ marginTop: 4, width: '80%', maxWidth: '500px' }}
        >
          Please login to upload files.
        </Alert>
      )}

      {auth.currentUser && !auth.currentUser.emailVerified && (
        <Alert
          severity="warning"
          sx={{ marginTop: 4, width: '80%', maxWidth: '500px' }}
        >
          Please verify your email before uploading files.
        </Alert>
      )}

      <Box
        sx={{
          marginTop: 4,
          textAlign: 'center',
          width: '80%',
          maxWidth: '500px',
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
              marginRight: 2,
              fontSize: '1.5rem',
              padding: '12px 24px',
              width: '100%',
              height: '100px',
              '&:hover': { backgroundColor: '#4527a0' },
            }}
          >
            Select PDF
          </Button>
        </label>
        {selectedFile && (
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            Selected file: {selectedFile.name}
          </Typography>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </Box>

      <Box sx={{ marginTop: 2, width: '80%', maxWidth: '500px' }}>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          sx={{
            backgroundColor: '#512da8',
            width: '100%',
            height: '60px',
            alignItems: 'center',
          }}
        >
          {isUploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Upload PDF'
          )}
        </Button>
      </Box>

      {uploadStatus === 'success' && (
        <Alert
          severity="success"
          sx={{ marginTop: 2, width: '80%', maxWidth: '500px' }}
        >
          File uploaded successfully! It will be reviewed shortly.
        </Alert>
      )}

      {submissions.length > 0 && (
        <Box
          sx={{
            marginTop: 4,
            width: '80%',
            maxWidth: '500px',
            textAlign: 'left',
          }}
        >
          <Typography variant="h5" gutterBottom>
            My Documents
          </Typography>
          {submissions.map((submission) => (
            <Box key={submission.id} sx={{ marginBottom: 2 }}>
              <Typography variant="body1">
                File: {submission.fileName}
              </Typography>
              <Typography variant="body1">
                Status: {submission.status}
              </Typography>
              <Typography variant="body1">
                Uploaded: {submission.uploadDate.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PaperworkContent;