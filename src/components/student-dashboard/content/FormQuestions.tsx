import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Container,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FormAnswers {
  humanSubjects: string;
  invertebrates: string;
  biohazards: string;
  regulatedInstitution: string;
  qualifiedScientist: string;
  riskAssessment: string;
}

interface RequiredForms {
  baseRequired: {
    perPerson: string[];
    perProject: string[];
  };
  conditionalForms: string[];
}

const STORAGE_KEY = 'formRequirementsAnswers';

const FormRequirementsAssessment: React.FC = () => {
  const questions = [
    'Does your project involve human subjects in any form (even for feedback)?',
    'Does your project involve invertebrate animals?',
    'Does your project involve potential biohazards?',
    'Was the research conducted in a regulated institution or industrial setting?',
    'Does your project require a qualified scientist?',
    'Does your project involve hazardous chemicals, materials, or devices?',
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [answers, setAnswers] = useState<FormAnswers>({
    humanSubjects: '',
    invertebrates: '',
    biohazards: '',
    regulatedInstitution: '',
    qualifiedScientist: '',
    riskAssessment: '',
  });

  useEffect(() => {
    const savedAnswers = localStorage.getItem(STORAGE_KEY);
    if (savedAnswers) {
      const parsedAnswers = JSON.parse(savedAnswers) as FormAnswers;
      if (Object.values(parsedAnswers).every((answer) => answer)) {
        setAnswers(parsedAnswers);
        setShowQuestionnaire(false);
        setActiveStep(questions.length);
      }
    }
  }, [questions.length]);

  
  const baseRequiredForms = {
    perPerson: ['Form 1B'],
    perProject: ['Form 1', 'Form 1A', 'Research Plan'],
  };

  const getRequiredForms = (values: FormAnswers): RequiredForms => {
    const conditionalForms: string[] = [];

    if (values.humanSubjects === 'yes') conditionalForms.push('Form 4');
    if (values.invertebrates === 'yes') conditionalForms.push('Form 5A');
    if (values.biohazards === 'yes') conditionalForms.push('Form 6A');
    if (values.regulatedInstitution === 'yes') conditionalForms.push('Form 1C');
    if (values.qualifiedScientist === 'yes') conditionalForms.push('Form 2');
    if (values.riskAssessment === 'yes') conditionalForms.push('Form 3');
    if (values.biohazards === 'yes') conditionalForms.push('Form 6B');
    if (values.humanSubjects === 'yes') conditionalForms.push('Form 7');
    if (
      values.invertebrates === 'yes' &&
      values.regulatedInstitution === 'yes'
    ) {
      conditionalForms.push('Form 5B');
    }

    return {
      baseRequired: baseRequiredForms,
      conditionalForms,
    };
  };

  const handleNext = (): void => {
    if (activeStep === questions.length - 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      setShowQuestionnaire(false);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = (): void => {
    setActiveStep((prev) => prev - 1);
  };

  const handleRetake = (): void => {
    setShowQuestionnaire(true);
    setActiveStep(0);
    setAnswers({
      humanSubjects: '',
      invertebrates: '',
      biohazards: '',
      regulatedInstitution: '',
      qualifiedScientist: '',
      riskAssessment: '',
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleRadioChange = (
    questionKey: keyof FormAnswers,
    value: string
  ): void => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const currentQuestion = Object.keys(answers)[activeStep] as keyof FormAnswers;
  const requiredForms = getRequiredForms(answers);

  const RequiredFormsDisplay = () => (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Required Per Person:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {requiredForms.baseRequired.perPerson.map((form) => (
            <Typography component="li" key={form} sx={{ mb: 1 }}>
              {form}
            </Typography>
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Required Per Project:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {requiredForms.baseRequired.perProject.map((form) => (
            <Typography component="li" key={form} sx={{ mb: 1 }}>
              {form}
            </Typography>
          ))}
        </Box>
      </Box>

      {requiredForms.conditionalForms.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Additional Required Forms:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {requiredForms.conditionalForms.map((form) => (
              <Typography component="li" key={form} sx={{ mb: 1 }}>
                {form}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button variant="contained" onClick={handleRetake} color="primary">
          Retake Questionnaire
        </Button>
      </Box>
    </Box>
  );

  const QuestionnaireDisplay = () => (
    <Box sx={{ mt: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {questions.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconProps={{
                completed: index < activeStep,
                icon: index < activeStep ? <CheckCircleIcon /> : index + 1,
              }}
            />
          </Step>
        ))}
      </Stepper>

      <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          <Typography variant="h6">{questions[activeStep]}</Typography>
        </FormLabel>
        <RadioGroup
          value={answers[currentQuestion]}
          onChange={(e) => handleRadioChange(currentQuestion, e.target.value)}
        >
          <FormControlLabel
            value="yes"
            control={<Radio />}
            label="Yes"
            sx={{ mb: 1 }}
          />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!answers[currentQuestion]}
        >
          {activeStep === questions.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          color="primary"
          gutterBottom
        >
          Form Requirements
        </Typography>

        {!showQuestionnaire && activeStep === questions.length ? (
          <RequiredFormsDisplay />
        ) : (
          <QuestionnaireDisplay />
        )}
      </Paper>
    </Container>
  );
};

export default FormRequirementsAssessment;
