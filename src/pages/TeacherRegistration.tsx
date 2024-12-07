import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { useAuth } from '../contexts/AuthContext';
import { teacherService } from '../services/teacher.service';
import LogoutButton from '../components/LogoutButton';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Zip code must be 5 digits')
    .required('Zip code is required'),
  school: Yup.string().required('School is required'),
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
}));

const StyledForm = styled(Form)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

const TeacherRegistration: React.FC = () => {
  const { authStatus, completeRegistration } = useAuth();
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [classCode, setClassCode] = useState<string>('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const generateClassCode = async () => {
    try {
      setIsGeneratingCode(true);
      const code = await teacherService.generateUniqueClassCode();
      setClassCode(code);
    } catch (error) {
      console.error('Error generating class code:', error);
      setRegistrationError('Failed to generate class code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  React.useEffect(() => {
    generateClassCode();
  }, []);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setRegistrationError(null);

      if (!authStatus.user) {
        throw new Error('User not authenticated');
      }

      if (!classCode) {
        throw new Error('Class code generation failed');
      }

      const registrationData = {
        ...values,
        userType: 'teacher',
        classCode,
        status: 'active',
      };

      // Register the teacher
      await completeRegistration(registrationData);

      // Create the initial class document
      await teacherService.initializeClass(authStatus.user.uid, classCode);
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationError(
        'An error occurred during registration. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Teacher Registration
          </Typography>
          <LogoutButton />
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4, px: 2 }}>
        <StyledPaper elevation={3}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Complete Your Registration
          </Typography>

          {registrationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registrationError}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Class Code
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'grey.100',
                p: 2,
                borderRadius: 1,
              }}
            >
              {isGeneratingCode ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Typography variant="h5" fontWeight="bold">
                    {classCode}
                  </Typography>
                  <Button
                    size="small"
                    onClick={generateClassCode}
                    disabled={isGeneratingCode}
                  >
                    Generate New Code
                  </Button>
                </>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Share this code with your students to let them join your class
            </Typography>
          </Box>

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              zipCode: '',
              school: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <StyledForm>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="firstName"
                      label="First Name"
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="lastName"
                      label="Last Name"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="address"
                      label="Address"
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="city"
                      label="City"
                      error={touched.city && Boolean(errors.city)}
                      helperText={touched.city && errors.city}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="state"
                      label="State"
                      error={touched.state && Boolean(errors.state)}
                      helperText={touched.state && errors.state}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="zipCode"
                      label="Zip Code"
                      error={touched.zipCode && Boolean(errors.zipCode)}
                      helperText={touched.zipCode && errors.zipCode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="school"
                      label="School"
                      error={touched.school && Boolean(errors.school)}
                      helperText={touched.school && errors.school}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                  </Button>
                </Box>
              </StyledForm>
            )}
          </Formik>
        </StyledPaper>
      </Box>
    </>
  );
};

export default TeacherRegistration;
