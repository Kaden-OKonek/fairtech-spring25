// Deprecated page

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Upload } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { formsService } from '../../../services/forms.service';
import FormSubmissionComponent from './FormSubmissionComponent';
import { FormSubmission } from '../../../types/forms.types';

const PaperworkContent: React.FC = () => {
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { authStatus } = useAuth();

  useEffect(() => {
    if (!authStatus.user?.uid) return;

    const unsubscribe = formsService.subscribeToForms(
      authStatus.user.uid,
      'student',
      (updatedForms) => {
        setForms(updatedForms);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authStatus.user?.uid]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        setError('Please select a PDF file');
      }
    }
  };

  const handleSubmitNewForm = async () => {
    if (!selectedFile || !authStatus.user?.uid) return;

    setIsSubmitting(true);
    try {
      await formsService.submitNewForm(
        authStatus.user.uid,
        `${authStatus.metadata?.firstName} ${authStatus.metadata?.lastName}`,
        newFormTitle,
        selectedFile,
        'general' // You might want to add form type selection
      );

      setIsSubmitDialogOpen(false);
      setNewFormTitle('');
      setSelectedFile(null);
      setError(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadNewVersion = async (formId: string, file: File) => {
    if (!authStatus.user?.uid) return;

    try {
      await formsService.uploadNewVersion(formId, file, authStatus.user.uid);
    } catch (error) {
      console.error('Error uploading new version:', error);
      setError('Failed to upload new version. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" color="primary" fontWeight="bold">
          My Forms
        </Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setIsSubmitDialogOpen(true)}
        >
          Submit New Form
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {forms.length === 0 ? (
        <Alert severity="info">
          You haven't submitted any forms yet. Click "Submit New Form" to get
          started.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {forms.map((form) => (
            <FormSubmissionComponent
              key={form.id}
              form={form}
              onUploadNewVersion={handleUploadNewVersion}
            />
          ))}
        </Box>
      )}

      {/* Submit New Form Dialog */}
      <Dialog
        open={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit New Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Title"
            fullWidth
            variant="outlined"
            value={newFormTitle}
            onChange={(e) => setNewFormTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="outlined" component="label" fullWidth>
            Select PDF File
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSubmitDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitNewForm}
            variant="contained"
            disabled={!selectedFile || !newFormTitle || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaperworkContent;
