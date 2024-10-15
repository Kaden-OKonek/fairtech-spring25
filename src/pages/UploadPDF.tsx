import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Input,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LogoutButton from '../components/LogoutButton';

const PdfUploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'User');
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      setUploadStatus('idle');
      try {
        const storage = getStorage();
        const auth = getAuth();
        const db = getFirestore();

        if (!auth.currentUser) {
          throw new Error('No authenticated user');
        }

        const userId = auth.currentUser.uid;

        // Create a reference to the file location in Firebase Storage
        const fileRef = ref(storage, `pdfs/${userId}/${selectedFile.name}`);

        // Upload the file
        const snapshot = await uploadBytes(fileRef, selectedFile);
        console.log('Uploaded a file!');

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Save the file metadata to Firestore
        const docRef = await addDoc(collection(db, 'pdfs'), {
          name: selectedFile.name,
          url: downloadURL,
          userId: userId,
          uploadDate: new Date(),
        });

        console.log('Document written with ID: ', docRef.id);

        // Reset the selected file after upload
        setSelectedFile(null);
        setUploadStatus('success');
      } catch (error) {
        console.error('Error uploading file: ', error);
        setUploadStatus('error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '20%',
          backgroundColor: '#6a1b9a',
          color: 'white',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Hi {userName}
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="My Documents" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary="Account Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        <LogoutButton variant="outlined" color="inherit" />
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
        }}
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
                '&:hover': {
                  backgroundColor: '#4527a0',
                },
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
            File uploaded successfully!
          </Alert>
        )}
        {uploadStatus === 'error' && (
          <Alert
            severity="error"
            sx={{ marginTop: 2, width: '80%', maxWidth: '500px' }}
          >
            Error uploading file. Please try again.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default PdfUploadPage;
