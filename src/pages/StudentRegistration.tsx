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
  Stepper,
  Step,
  AppBar,
  Toolbar,
  StepLabel,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from '../components/LogoutButton';
import { StudentProfile } from '../types/auth.types';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  school: Yup.string().required('School name is required'),
  grade: Yup.number()
    .required('Grade is required')
    .min(1, 'Grade must be at least 5')
    .max(12, 'Grade must be at most 12'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zipCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Zip code must be 5 digits')
    .required('Zip code is required'),
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

interface RegistrationData {
  firstName: string;
  lastName: string;
  school: string;
  grade: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const StudentRegistration: React.FC = () => {
  const { authStatus, completeRegistration } = useAuth();
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Personal Info', 'Contact Info', 'School Info'];

  const initialValues: RegistrationData = {
    firstName: '',
    lastName: '',
    school: '',
    grade: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  };

  const handleSubmit = async (
    values: RegistrationData,
    { setSubmitting }: any
  ) => {
    try {
      setRegistrationError(null);

      if (!authStatus.user) {
        throw new Error('User not authenticated');
      }

      const registrationData: Partial<StudentProfile> = {
        ...values,
        userType: 'student' as const,
        updatedAt: new Date(),
        registrationComplete: true,
        grade: parseInt(values.grade, 10), // Convert string to number
      };

      await completeRegistration(registrationData);
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
            Student Registration
          </Typography>
          <LogoutButton />
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4, px: 2 }}>
        <StyledPaper elevation={3}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Complete Your Registration
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{ mb: 4 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {registrationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registrationError}
            </Alert>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <StyledForm>
                {activeStep === 0 && (
                  <>
                    <Field
                      as={TextField}
                      fullWidth
                      name="firstName"
                      label="First Name"
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                    <Field
                      as={TextField}
                      fullWidth
                      name="lastName"
                      label="Last Name"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </>
                )}

                {activeStep === 1 && (
                  <>
                    <Field
                      as={TextField}
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                    />
                    <Field
                      as={TextField}
                      fullWidth
                      name="address"
                      label="Address"
                      error={touched.address && Boolean(errors.address)}
                      helperText={touched.address && errors.address}
                    />
                    <Grid container spacing={2}>
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
                    </Grid>
                  </>
                )}

                {activeStep === 2 && (
                  <>
                    <Field
                      as={TextField}
                      fullWidth
                      name="school"
                      label="School"
                      error={touched.school && Boolean(errors.school)}
                      helperText={touched.school && errors.school}
                    />
                    <Field
                      as={TextField}
                      fullWidth
                      name="grade"
                      label="Grade"
                      type="number"
                      error={touched.grade && Boolean(errors.grade)}
                      helperText={touched.grade && errors.grade}
                    />
                  </>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => prev - 1)}
                  >
                    Back
                  </Button>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setActiveStep((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </StyledForm>
            )}
          </Formik>
        </StyledPaper>
      </Box>
    </>
  );
};

export default StudentRegistration;
