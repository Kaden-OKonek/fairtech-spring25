import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
} from '@mui/material';
import { FormSubmission } from '../../types/forms.types';
import PdfViewer from './PdfViewer';

interface FormReviewDialogProps {
  open: boolean;
  onClose: () => void;
  form: FormSubmission | null;
  onSubmit: (
    formId: string,
    status: FormSubmission['status'],
    comments: string
  ) => Promise<void>;
}

const FormReviewDialog: React.FC<FormReviewDialogProps> = ({
  open,
  onClose,
  form,
  onSubmit,
}) => {
  const [status, setStatus] =
    React.useState<FormSubmission['status']>('pending');
  const [comments, setComments] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (form) {
      setStatus(form.status);
      setComments(form.comments || '');
    }
  }, [form]);

  const handleSubmit = async () => {
    if (!form) return;

    setIsSubmitting(true);
    try {
      await onSubmit(form.id, status, comments);
      onClose();
    } catch (error) {
      console.error('Error updating form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '900px',
        },
      }}
    >
      <DialogTitle>Review Form</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ height: 'calc(100% - 64px)' }}>
          {/* Left side - Form info and controls */}
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Student Name"
                value={form.studentName}
                fullWidth
                disabled
              />
              <TextField
                label="Upload Date"
                value={form.uploadDate.toLocaleDateString()}
                fullWidth
                disabled
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) =>
                    setStatus(e.target.value as FormSubmission['status'])
                  }
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="needs_revision">Needs Revision</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Comments"
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
              />
            </Box>
          </Grid>

          {/* Right side - PDF Viewer */}
          <Grid item xs={8} sx={{ height: '100%' }}>
            <PdfViewer fileUrl={form.fileUrl} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormReviewDialog;
