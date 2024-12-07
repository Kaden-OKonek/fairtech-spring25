import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Eye,
  FileText,
  Users,
  School,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Project } from '../../types/project.types';
import { FormSubmission, ReviewStatus } from '../../types/forms.types';
import FormReview from './FormReview';

interface ProjectReviewDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project & { forms: FormSubmission[] };
  onUpdateProjectStatus: (
    projectId: string,
    status: ReviewStatus,
    comments?: string
  ) => Promise<void>;
  onSubmitFormReview: (
    formId: string,
    status: ReviewStatus,
    comments: string
  ) => Promise<void>;
  onAssignReviewer: (
    formId: string,
    reviewerId: string,
    reviewerName: string,
    role: 'primary' | 'secondary' | 'final'
  ) => Promise<void>;
}

const ProjectReviewDialog: React.FC<ProjectReviewDialogProps> = ({
  open,
  onClose,
  project,
  onUpdateProjectStatus,
  onSubmitFormReview,
  onAssignReviewer,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<ReviewStatus>('pending');
  const [projectComments, setProjectComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
      case 'needs_revision':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  const getStatusColor = (
    status: ReviewStatus
  ): 'success' | 'error' | 'warning' | 'info' | 'default' => {
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

  const handleUpdateProject = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdateProjectStatus(project.id, projectStatus, projectComments);
      onClose();
    } catch (err) {
      setError('Failed to update project status');
      console.error('Project update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const areAllFormsReviewed = project.forms.every(
    (form) => form.status === 'approved' || form.status === 'rejected'
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Project Review: {project.name}</Typography>
            <Chip
              size="small"
              icon={getStatusIcon(project.status as ReviewStatus)}
              label={project.status.replace('_', ' ')}
              color={getStatusColor(project.status as ReviewStatus)}
            />
          </Box>
        </DialogTitle>

        <DialogContent>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab icon={<FileText size={18} />} label="Forms" />
            <Tab icon={<Users size={18} />} label="Team" />
            <Tab icon={<School size={18} />} label="Details" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Project Forms ({project.forms.length})
              </Typography>
              {!areAllFormsReviewed && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  All forms must be reviewed before updating project status
                </Alert>
              )}
              <List>
                {project.forms.map((form) => (
                  <ListItem
                    key={form.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography>{form.title || form.fileName}</Typography>
                          {form.isRequired && (
                            <Chip size="small" color="error" label="Required" />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Responsible Student:{' '}
                            {form.projectContext.responsibleStudentName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last updated:{' '}
                            {new Date(form.updatedAt).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Reviews:{' '}
                            {form.versions[form.currentVersion].reviews.length}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box
                        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      >
                        <Chip
                          size="small"
                          icon={getStatusIcon(form.status)}
                          label={form.status.replace('_', ' ')}
                          color={getStatusColor(form.status)}
                        />
                        {form.versions[form.currentVersion].reviews.length >
                          0 && (
                          <IconButton
                            size="small"
                            onClick={() => setSelectedForm(form)}
                            title="View Reviews"
                          >
                            <MessageSquare size={18} />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => setSelectedForm(form)}
                          title="Review Form"
                        >
                          <Eye size={18} />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Project Review
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Project Status</InputLabel>
                  <Select
                    value={projectStatus}
                    label="Project Status"
                    onChange={(e) =>
                      setProjectStatus(e.target.value as ReviewStatus)
                    }
                    disabled={!areAllFormsReviewed}
                  >
                    <MenuItem value="pending">Pending Review</MenuItem>
                    <MenuItem value="in_review">In Review</MenuItem>
                    <MenuItem value="needs_revision">Needs Revision</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Review Comments"
                  value={projectComments}
                  onChange={(e) => setProjectComments(e.target.value)}
                  disabled={!areAllFormsReviewed}
                />
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Team Members
              </Typography>
              <List>
                {project.members.map((member) => (
                  <ListItem key={member.userId}>
                    <ListItemText
                      primary={`${member.firstName} ${member.lastName}`}
                      secondary={member.email}
                    />
                    <Chip
                      size="small"
                      label={member.role}
                      color={member.role === 'creator' ? 'primary' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Project Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Fair Type"
                    secondary={
                      project.fairType === 'highSchool'
                        ? 'High School'
                        : 'Middle School'
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Project Code"
                    secondary={project.projectCode}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Adult Sponsor"
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {project.adultSponsor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.adultSponsor.email}
                        </Typography>
                        {project.adultSponsor.isTeacher && (
                          <Chip
                            size="small"
                            label="Teacher"
                            color="primary"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          {activeTab === 0 && (
            <Button
              variant="contained"
              onClick={handleUpdateProject}
              disabled={!areAllFormsReviewed || isSubmitting}
            >
              Update Project Status
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Form Review Dialog */}
      {selectedForm && (
        <FormReview
          open={Boolean(selectedForm)}
          onClose={() => setSelectedForm(null)}
          form={selectedForm}
          onSubmitReview={onSubmitFormReview}
          onAssignReviewer={onAssignReviewer}
        />
      )}
    </>
  );
};

export default ProjectReviewDialog;
