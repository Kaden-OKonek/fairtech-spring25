import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import { projectsService } from '../../../services/projects.service';
import { teacherService } from '../../../services/teacher.service';
import { FairType, AdultSponsor } from '../../../types/project.types';
import { Teacher } from '../../../types/teacher.types';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const steps = ['Project Details', 'Class Association', 'Adult Sponsor'];

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onClose,
  onProjectCreated,
}) => {
  const { authStatus } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Project Details
  const [projectName, setProjectName] = useState('');
  const [fairType, setFairType] = useState<FairType>('highSchool');

  // Class Association
  const [joinClass, setJoinClass] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  // Adult Sponsor
  const [useTeacherAsSponsor, setUseTeacherAsSponsor] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorEmail, setSponsorEmail] = useState('');

  const verifyClassCode = async () => {
    if (!classCode.trim()) {
      setError('Please enter a class code');
      return false;
    }

    try {
      setIsVerifyingCode(true);
      setError(null);

      const teacherData = await teacherService.getTeacherByClassCode(classCode);

      if (!teacherData) {
        setError('Invalid class code');
        return false;
      }

      setTeacher(teacherData);
      return true;
    } catch (err) {
      setError('Failed to verify class code');
      return false;
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!projectName.trim()) {
        setError('Please enter a project name');
        return;
      }
      setError(null);
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      if (joinClass) {
        const isValid = await verifyClassCode();
        if (!isValid) return;
      }
      setError(null);
      setActiveStep(2);
      return;
    }

    if (activeStep === 2) {
      if (
        !useTeacherAsSponsor &&
        (!sponsorName.trim() || !sponsorEmail.trim())
      ) {
        setError('Please fill in all sponsor information');
        return;
      }
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!authStatus.user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Check if student can create a project
      const canCreate = await projectsService.canCreateProject(
        authStatus.user.uid
      );
      if (!canCreate) {
        throw new Error('You already have an active project');
      }

      // Prepare adult sponsor data - with proper type checking and defaults
      const adultSponsorData: AdultSponsor = {
        name: useTeacherAsSponsor
          ? `${teacher?.firstName || ''} ${teacher?.lastName || ''}`.trim()
          : sponsorName,
        email: useTeacherAsSponsor ? teacher?.email || '' : sponsorEmail,
        isTeacher: useTeacherAsSponsor,
        // Only include teacherId if sponsor is a teacher and teacher id exists
        ...(useTeacherAsSponsor && teacher?.id
          ? { teacherId: teacher.id }
          : {}),
      };

      // Only include classId if using teacher as sponsor and teacher has an id
      const classId =
        useTeacherAsSponsor && teacher?.id ? teacher.id : undefined;

      // Create project
      await projectsService.createProject(
        projectName,
        fairType,
        {
          userId: authStatus.user.uid,
          firstName: authStatus.metadata?.firstName || '',
          lastName: authStatus.metadata?.lastName || '',
          email: authStatus.user.email,
          joinedAt: new Date(),
          role: 'creator',
        },
        adultSponsorData,
        classId || undefined
      );

      onProjectCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              margin="normal"
              required
            />

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Fair Type</FormLabel>
              <RadioGroup
                value={fairType}
                onChange={(e) => setFairType(e.target.value as FairType)}
              >
                <FormControlLabel
                  value="highSchool"
                  control={<Radio />}
                  label="High School"
                />
                <FormControlLabel
                  value="middleSchool"
                  control={<Radio />}
                  label="Middle School"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={joinClass}
                  onChange={(e) => {
                    setJoinClass(e.target.checked);
                    if (!e.target.checked) {
                      setClassCode('');
                      setTeacher(null);
                      setUseTeacherAsSponsor(false);
                    }
                  }}
                />
              }
              label="Join a teacher's class"
            />

            {joinClass && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Class Code"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  required
                  disabled={isVerifyingCode}
                  InputProps={{
                    startAdornment: isVerifyingCode ? (
                      <CircularProgress size={20} />
                    ) : undefined,
                  }}
                />

                {teacher && (
                  <Paper sx={{ mt: 2, p: 2, bgcolor: 'success.light' }}>
                    <Typography
                      variant="subtitle2"
                      color="success.contrastText"
                    >
                      Teacher Found:
                    </Typography>
                    <Typography color="success.contrastText">
                      {teacher.firstName} {teacher.lastName}
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                      {teacher.school}
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            {joinClass && teacher && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useTeacherAsSponsor}
                    onChange={(e) => setUseTeacherAsSponsor(e.target.checked)}
                  />
                }
                label={`Use ${teacher.firstName} ${teacher.lastName} as adult sponsor`}
              />
            )}

            {!useTeacherAsSponsor && (
              <>
                <TextField
                  fullWidth
                  label="Sponsor Name"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Sponsor Email"
                  type="email"
                  value={sponsorEmail}
                  onChange={(e) => setSponsorEmail(e.target.value)}
                  margin="normal"
                  required
                />
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' },
      }}
    >
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={isSubmitting || isVerifyingCode}
        >
          {isSubmitting ? (
            <CircularProgress size={24} />
          ) : activeStep === steps.length - 1 ? (
            'Create Project'
          ) : (
            'Next'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectDialog;
