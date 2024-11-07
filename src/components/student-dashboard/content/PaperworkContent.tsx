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

  const handleGoToQuestionnaire = () => {
    // Implement navigation logic to go to the questionnaire page
    console.log("Navigating to Form Questionnaire");
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Paperwork
      </Typography>

      {/* Custom Information Section */}
      <Box
        className="w-full max-w-xl p-6"
        sx={{
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          padding: 4,
          marginBottom: 4,
        }}
      >
        {/* Questionnaire Section */}
        <Box className="flex flex-col items-center mb-12">
          
          <Box
            className="text-center w-4/5 max-w-[400px] mb-6"
            sx={{ marginBottom: 3 }}
          >
            <Typography
              variant="h4"
              className="text-xl mb-4"
              sx={{ marginBottom: 2, color: '#555' }}
            >
              Not sure what documents you need? Complete the <strong>Form Questionnaire</strong> to get a customized list.
            </Typography>
            <Button
              onClick={handleGoToQuestionnaire}
              className="w-1/2 h-20 text-xl bg-purple-700 hover:bg-purple-800"
              variant="contained"
              color="primary"
              sx={{
                fontSize: '1rem',
                padding: '12px 24px',
                backgroundColor: '#6a1b9a',
                '&:hover': {
                  backgroundColor: '#4a148c',
                },
              }}
            >
              Form Questionnaire
            </Button>
          </Box>

          <Typography
            variant="h5"
            className="text-xl text-center w-4/5 max-w-[400px] mb-6"
            sx={{ marginBottom: 2, color: '#666' }}
          >
            If your project conditions have changed, you can retake the questionnaire anytime by going to the Form Questionnaire under paperwork.
          <br/>
          </Typography>

          <Typography
            variant="h5"
            className="text-xl text-center w-4/5 max-w-[400px] mb-12"
            sx={{ color: '#666' }}
          >
            To track the review status of your uploaded files, visit <strong>My Documents</strong> under Paperwork.
          </Typography>
        </Box>
      </Box>

      {/* Upload Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#333' }}>Upload New Form</Typography>
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
              sx={{ minWidth: '150px', backgroundColor: '#0288d1', color: '#fff', '&:hover': { backgroundColor: '#0277bd' } }}
            >
              Select PDF
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2" sx={{ color: '#333' }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          sx={{ maxWidth: '200px', backgroundColor: '#0288d1', color: '#fff', '&:hover': { backgroundColor: '#0277bd' } }}
        >
          {isUploading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Upload Form'
          )}
        </Button>

        {errorMessage && (
          <Alert severity="error" sx={{ maxWidth: '500px', marginTop: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {uploadStatus === 'success' && (
          <Alert severity="success" sx={{ maxWidth: '500px', marginTop: 2 }}>
            Form uploaded successfully! It will be reviewed shortly.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default PaperworkContent;
