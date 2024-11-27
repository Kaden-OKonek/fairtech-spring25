import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Upload,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  X,
} from 'lucide-react';
import {
  FormSubmission,
  FormType,
  ProjectContext,
} from '../../../types/forms.types';
import { ProjectMember } from '../../../types/project.types';
import { formsService } from '../../../services/forms.service';

interface ProjectDocumentsProps {
  projectId: string;
  projectName: string;
  projectMembers: ProjectMember[];
}

const formTypeLabels: Record<FormType, string> = {
  '1B': '1B',
  '1': '1',
  '1A': '1A',
  research_plan: 'Research Plan',
  abstract: 'Abstract',
  '1C': '1C',
  '2': '2',
  '3': '3',
  '4': '4',
  '5A': '5A',
  '5B': '5B',
  '6A': '6A',
  '6B': '6B',
  '7': '7',
};

interface ProjectDocumentsDialogProps extends ProjectDocumentsProps {
  open: boolean;
  onClose: () => void;
}

const ProjectDocuments: React.FC<ProjectDocumentsDialogProps> = ({
  open,
  onClose,
  projectId,
  projectName,
  projectMembers,
}) => {
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formType, setFormType] = useState<FormType>('1B');
  const [formTitle, setFormTitle] = useState('');
  const [responsibleStudentId, setResponsibleStudentId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const unsubscribe = formsService.subscribeToProjectForms(
      projectId,
      (updatedForms) => {
        setForms(updatedForms);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
      case 'needs_revision':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !responsibleStudentId || !formTitle) return;

    try {
      setUploading(true);
      setError(null);

      const projectContext: ProjectContext = {
        projectId,
        projectName,
        responsibleStudentId,
        assignedAt: new Date(),
      };

      await formsService.submitProjectForm(
        projectContext,
        formTitle,
        selectedFile,
        formType,
        false // isRequired - could be determined by form type or passed as prop
      );

      setUploadDialogOpen(false);
      resetUploadForm();
    } catch (err) {
      setError('Failed to upload form. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFormType('1B');
    setFormTitle('');
    setResponsibleStudentId('');
  };

  // Group forms by student
  const formsByStudent = forms.reduce(
    (acc, form) => {
      const student = projectMembers.find(
        (m) => m.userId === form.projectContext.responsibleStudentId
      );
      if (student) {
        if (!acc[student.userId]) {
          acc[student.userId] = {
            student,
            forms: [],
          };
        }
        acc[student.userId].forms.push(form);
      }
      return acc;
    },
    {} as Record<string, { student: ProjectMember; forms: FormSubmission[] }>
  );

  // Filter forms by type for the "By Type" tab
  const formsByType = forms.reduce(
    (acc, form) => {
      if (!acc[form.formType]) {
        acc[form.formType] = [];
      }
      acc[form.formType].push(form);
      return acc;
    },
    {} as Record<FormType, FormSubmission[]>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' },
      }}
    >
      <DialogTitle>
        <Box className="flex justify-between items-center">
          <Typography variant="h6">Project Documents</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent className="space-y-6">
        {/* Header */}
        <Box className="flex justify-between items-center mb-4">
          <Typography variant="h5">Project Documents</Typography>
          <Button
            variant="contained"
            startIcon={<Upload size={16} />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Form
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            className="mb-4"
          >
            {error}
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="By Student" />
          <Tab label="By Type" />
        </Tabs>

        {/* Content by Student */}
        {activeTab === 0 && (
          <Box className="space-y-4">
            {Object.entries(formsByStudent).map(
              ([studentId, { student, forms }]) => (
                <Card key={studentId}>
                  <CardContent>
                    <Typography variant="h6" className="mb-2">
                      {student.firstName} {student.lastName}
                    </Typography>
                    <List>
                      {forms.map((form) => (
                        <ListItem
                          key={form.id}
                          className="flex items-center p-4 border-b last:border-b-0"
                        >
                          <div className="flex-grow">
                            <Typography
                              variant="subtitle1"
                              className="font-medium"
                            >
                              {form.title || form.fileName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formTypeLabels[form.formType]} • Last updated:{' '}
                              {form.updatedAt.toLocaleDateString()}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip
                              size="small"
                              icon={getStatusIcon(form.status)}
                              label={form.status.replace('_', ' ')}
                              color={getStatusColor(form.status)}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                window.open(
                                  form.versions[form.currentVersion].fileUrl
                                )
                              }
                            >
                              <Eye size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              href={form.versions[form.currentVersion].fileUrl}
                              download
                            >
                              <Download size={16} />
                            </IconButton>
                          </div>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )
            )}
          </Box>
        )}

        {/* Content by Type */}
        {activeTab === 1 && (
          <Box className="space-y-4">
            {Object.entries(formsByType).map(([type, forms]) => (
              <Card key={type}>
                <CardContent>
                  <Typography variant="h6" className="mb-2">
                    {formTypeLabels[type as FormType]}
                  </Typography>
                  <List>
                    {forms.map((form) => {
                      const student = projectMembers.find(
                        (m) =>
                          m.userId === form.projectContext.responsibleStudentId
                      );
                      return (
                        <ListItem
                          key={form.id}
                          className="flex items-center p-4 border-b last:border-b-0"
                        >
                          <div className="flex-grow">
                            <Typography
                              variant="subtitle1"
                              className="font-medium"
                            >
                              {form.title || form.fileName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Responsible: {student?.firstName}{' '}
                              {student?.lastName} • Last updated:{' '}
                              {form.updatedAt.toLocaleDateString()}
                            </Typography>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip
                              size="small"
                              icon={getStatusIcon(form.status)}
                              label={form.status.replace('_', ' ')}
                              color={getStatusColor(form.status)}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                window.open(
                                  form.versions[form.currentVersion].fileUrl
                                )
                              }
                            >
                              <Eye size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              href={form.versions[form.currentVersion].fileUrl}
                              download
                            >
                              <Download size={16} />
                            </IconButton>
                          </div>
                        </ListItem>
                      );
                    })}
                  </List>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false);
            resetUploadForm();
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Upload Project Form</DialogTitle>
          <DialogContent>
            <Box className="space-y-4 mt-4">
              <FormControl fullWidth>
                <InputLabel>Form Type</InputLabel>
                <Select
                  value={formType}
                  label="Form Type"
                  onChange={(e) => setFormType(e.target.value as FormType)}
                >
                  {Object.entries(formTypeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Form Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />

              <FormControl fullWidth>
                <InputLabel>Responsible Student</InputLabel>
                <Select
                  value={responsibleStudentId}
                  label="Responsible Student"
                  onChange={(e) => setResponsibleStudentId(e.target.value)}
                >
                  {projectMembers.map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {member.firstName} {member.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant="outlined" component="label" fullWidth>
                {selectedFile ? selectedFile.name : 'Select PDF File'}
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setUploadDialogOpen(false);
                resetUploadForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={
                !selectedFile ||
                !responsibleStudentId ||
                !formTitle ||
                uploading
              }
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDocuments;
