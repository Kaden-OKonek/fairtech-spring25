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
  StepLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useUserType } from '../contexts/UserTypeContext';

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

const StudentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { userType } = useUserType();
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Personal Info', 'Contact Info', 'School Info'];

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    if (!user) {
      setRegistrationError('User not authenticated');
      setSubmitting(false);
      return;
    }

    if (userType !== 'student') {
      setRegistrationError('Invalid user type');
      setSubmitting(false);
      return;
    }

    try {
      // Update the user document in Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          firstName: values.firstName,
          lastName: values.lastName,
          school: values.school,
          grade: values.grade,
          phone: values.phone,
          address: values.address,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log('Registration successful');
      setSubmitting(false);
      navigate('/stud_dashboard');
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationError(
        'An error occurred during registration. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4, px: 2 }}>
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Student Registration
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
          <Typography color="error" sx={{ mb: 2 }}>
            {registrationError}
          </Typography>
        )}

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            school: '',
            grade: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
          }}
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
                    error={touched.firstName && errors.firstName}
                    helperText={touched.firstName && errors.firstName}
                  />
                  <Field
                    as={TextField}
                    fullWidth
                    name="lastName"
                    label="Last Name"
                    error={touched.lastName && errors.lastName}
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
                    error={touched.phone && errors.phone}
                    helperText={touched.phone && errors.phone}
                  />
                  <Field
                    as={TextField}
                    fullWidth
                    name="address"
                    label="Address"
                    error={touched.address && errors.address}
                    helperText={touched.address && errors.address}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="city"
                        label="City"
                        error={touched.city && errors.city}
                        helperText={touched.city && errors.city}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="state"
                        label="State"
                        error={touched.state && errors.state}
                        helperText={touched.state && errors.state}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Field
                        as={TextField}
                        fullWidth
                        name="zipCode"
                        label="Zip Code"
                        error={touched.zipCode && errors.zipCode}
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
                    error={touched.school && errors.school}
                    helperText={touched.school && errors.school}
                  />
                  <Field
                    as={TextField}
                    fullWidth
                    name="grade"
                    label="Grade"
                    type="number"
                    error={touched.grade && errors.grade}
                    helperText={touched.grade && errors.grade}
                  />
                </>
              )}

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
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
                    Submit
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
  );
};

export default StudentRegistration;
