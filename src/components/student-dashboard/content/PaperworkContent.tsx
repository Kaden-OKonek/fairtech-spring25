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

const PaperworkContent: React.FC = () => {
  const {
    selectedFile,
    isUploading,
    uploadStatus,
    errorMessage,
    handleFileChange,
    handleUpload,
  } = useFileUpload();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Typography variant="h4" gutterBottom>
        Upload PDF
      </Typography>

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
          sx={{ backgroundColor: '#512da8', width: '100%', height: '60px' }}
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
    </Box>
  );
};

export default PaperworkContent;
