import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import {
  Button,
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';

// Define interfaces for our types
interface FormValues {
  humanSubjects: string;
  invertebrates: string;
  biohazards: string;
}

interface RequiredForms {
  perPerson: string[];
  perProject: string[];
  conditionalForms: string[];
}

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

const FormRequirementsAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState<number>(0);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  // Define the base required forms
  const baseRequiredForms = {
    perPerson: ['Form 1B'],
    perProject: ['Form 1', 'Form 1A', 'Research Plan', 'Abstract'],
  };

  // Questions for the assessment
  const questions = [
    'Does your project involve human subjects?',
    'Does your project involve invertebrate animals?',
    'Does your project involve potential biohazards?',
  ];

  const handleSubmit = async (values: FormValues): Promise<void> => {
    if (!user) {
      setAssessmentError('User not authenticated');
      return;
    }

    try {
      // Calculate required forms based on answers
      const requiredForms: RequiredForms = {
        ...baseRequiredForms,
        conditionalForms: [],
      };

      if (values.humanSubjects === 'yes') {
        requiredForms.conditionalForms.push('Form 4');
      }

      if (values.invertebrates === 'yes') {
        requiredForms.conditionalForms.push('Form 6A');
      }

      if (values.biohazards === 'yes') {
        requiredForms.conditionalForms.push('Form 6B');
      }

      // Store the form requirements in Firestore
      await setDoc(
        doc(db, 'projectRequirements', user.uid),
        {
          requiredForms,
          assessmentDate: new Date(),
          answers: values,
        },
        { merge: true }
      );

      navigate('/forms-dashboard');
    } catch (error) {
      console.error('Error saving form requirements:', error);
      setAssessmentError('An error occurred while saving your requirements.');
    }
  };

  const initialValues: FormValues = {
    humanSubjects: '',
    invertebrates: '',
    biohazards: '',
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4, px: 2 }}>
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Form Questionnaire
        </Typography>

        <Stepper
          activeStep={activeStep}
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ mb: 4 }}
        >
          {questions.map((label, index) => (
            <Step key={index}>
              <StepLabel>Question {index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {assessmentError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {assessmentError}
          </Typography>
        )}

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, setFieldValue }) => (
            <StyledForm>
              {activeStep === 0 && (
                <FormControl component="fieldset">
                  <FormLabel component="legend">{questions[0]}</FormLabel>
                  <RadioGroup
                    name="humanSubjects"
                    value={values.humanSubjects}
                    onChange={(e) =>
                      setFieldValue('humanSubjects', e.target.value)
                    }
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
                </FormControl>
              )}

              {activeStep === 1 && (
                <FormControl component="fieldset">
                  <FormLabel component="legend">{questions[1]}</FormLabel>
                  <RadioGroup
                    name="invertebrates"
                    value={values.invertebrates}
                    onChange={(e) =>
                      setFieldValue('invertebrates', e.target.value)
                    }
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
                </FormControl>
              )}

              {activeStep === 2 && (
                <FormControl component="fieldset">
                  <FormLabel component="legend">{questions[2]}</FormLabel>
                  <RadioGroup
                    name="biohazards"
                    value={values.biohazards}
                    onChange={(e) =>
                      setFieldValue('biohazards', e.target.value)
                    }
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
                </FormControl>
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
                {activeStep === questions.length - 1 ? (
                  <Button type="submit" variant="contained" color="primary">
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

export default FormRequirementsAssessment;
