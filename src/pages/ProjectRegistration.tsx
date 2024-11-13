import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  AppBar,
  Toolbar,
  StepLabel,
  useTheme,
  useMediaQuery,
  Alert,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { addDoc, collection /*doc, setDoc*/ } from 'firebase/firestore';
import { db } from '../firebase';
import { styled } from '@mui/system';
//import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types/project.types';

const validationSchema = Yup.object().shape({
  projectName: Yup.string().required('A Project name is required'),
  adultSponsorLastName: Yup.string().required(
    'Adult Sponsor Last name is required'
  ),
  adultSponsorFirstName: Yup.string().required(
    'Adult Sponsor First name is required'
  ),
  classID: Yup.string().required('Teacher Class Code is required'),
  fairID: Yup.string().required('Fair is required'),
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
  projectName: string;
  classID: string;
  fairID: string;
  creationDate: Date;
  adultSponsorFirstName: string;
  adultSponsorLastName: string;
  projectStatus?: {
    status: string;
    statusChangeDate: Date;
  };
  projectMembers?: {
    member1: string;
    member2: string;
    member3: string;
  };
}

const ProjectRegistration: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [useClassCode, setUseClassCode] = useState<boolean>(false);
  const [useTeacherAsSponser, setTeacherAsSponser] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Project Info', 'Class Info', 'Adult Sponsor Info'];
  const fairOptions = [
    { value: '938abdf2', label: 'Southern MN Science Fair - Elementary' },
    { value: '7hd628s', label: 'Southern MN Science Fair - High School' },
  ];

  const initialValues: RegistrationData = {
    projectName: '',
    classID: 'n/a',
    fairID: '',
    creationDate: new Date(), //todays date
    adultSponsorFirstName: '',
    adultSponsorLastName: '',
    projectStatus: {
      status: 'pending',
      statusChangeDate: new Date(), //todays date
    },
    projectMembers: {
      member1: 'n/a',
      member2: 'n/a',
      member3: 'n/a',
    },
  };

  const handleSubmit = async (
    values: RegistrationData,
    { setSubmitting }: any
  ) => {
    try {
      setRegistrationError(null);

      const projectData: Project = values;

      const projectRef = await addDoc(collection(db, 'projects'), projectData);

      console.log('Document written with ID:', projectRef.id);

      // const projectRef = doc(db, 'projects');

      // const registrationData = {
      //   ...projectData,
      // };
      // await setDoc(projectRef, registrationData, { merge: true });
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
            Project Registration
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/student-dashboard')}
          >
            Cancel Project Registration
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4, px: 2 }}>
        <StyledPaper elevation={3}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Complete Your Project Registration
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
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <StyledForm>
                {activeStep === 0 && (
                  <>
                    <Field
                      as={TextField}
                      fullWidth
                      name="projectName"
                      label="Project Name"
                      error={touched.projectName && Boolean(errors.projectName)}
                      helperText={touched.projectName && errors.projectName}
                    />
                    <Typography variant="h6" gutterBottom align="center">
                      Which Fair do you want to Register to?
                    </Typography>
                    <Field
                      as={Select}
                      fullWidth
                      name="Fairs"
                      label="Which Fair do you want to Register to?"
                      error={touched.fairID && Boolean(errors.fairID)}
                      helperText={touched.fairID && errors.fairID}
                    >
                      {fairOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </>
                )}

                {activeStep === 1 && (
                  <>
                    <Typography variant="h6" align="center">
                      Do you have a class code from your teacher?
                    </Typography>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '-10px',
                      }}
                    >
                      <RadioGroup
                        row
                        value={useClassCode ? 'yes' : 'no'}
                        onChange={(event) => {
                          const value = event.target.value === 'yes';
                          setUseClassCode(value);
                          setFieldValue('classID', value ? '' : 'n/a'); // Set classID based on selection
                        }}
                      >
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </div>

                    {useClassCode && (
                      <Field
                        as={TextField}
                        fullWidth
                        name="classID"
                        label="Enter Class Code"
                        error={touched.classID && Boolean(errors.classID)}
                        helperText={touched.classID && errors.classID}
                      />
                    )}
                  </>
                )}

                {activeStep === 2 && (
                  <>
                    {useClassCode && (
                      <Box>
                        <Typography variant="h6" gutterBottom align="center">
                          Would you like to designate your teacher as your adult
                          sponser?
                        </Typography>
                        <div
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          <RadioGroup
                            row
                            value={useTeacherAsSponser ? 'yes' : 'no'}
                            onChange={(event) => {
                              const value = event.target.value === 'yes';
                              setTeacherAsSponser(value);
                            }}
                          >
                            <FormControlLabel
                              value="yes"
                              control={<Radio />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio />}
                              label="No"
                            />
                          </RadioGroup>
                        </div>
                      </Box>
                    )}
                    {!useTeacherAsSponser && (
                      <Box>
                        <Field
                          as={TextField}
                          fullWidth
                          name="adultSponsorFirstName"
                          label="Adult Sponsor First Name"
                          error={
                            touched.adultSponsorFirstName &&
                            Boolean(errors.adultSponsorFirstName)
                          }
                          helperText={
                            touched.adultSponsorFirstName &&
                            errors.adultSponsorFirstName
                          }
                        />
                        <Field
                          as={TextField}
                          fullWidth
                          name="adultSponsorLastName"
                          label="Adult Sponsor Last Name"
                          error={
                            touched.adultSponsorLastName &&
                            Boolean(errors.adultSponsorLastName)
                          }
                          helperText={
                            touched.adultSponsorLastName &&
                            errors.adultSponsorLastName
                          }
                        />
                      </Box>
                    )}
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

export default ProjectRegistration;
