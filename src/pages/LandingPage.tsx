import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import logo from '../assets/images/Southern_MN_Science_Fair_Logo.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const LandingPage: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigate function

  return (
    <Box
      sx={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#ffffff', //Background is white
        color: 'white',
        minHeight: '80vh', //Total height of the page
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <Button //Button to navigate to the "Contact Us" Page
          variant="contained"
          sx={{ backgroundColor: '#ffffff', color: '#5a2b8c' }}
        >
          Contact Us
        </Button>
        <Button //Button to navigate to the "Login" Page
          onClick={() => navigate('/login')}
          variant="contained"
          sx={{ backgroundColor: '#ffffff', color: '#5a2b8c' }}
        >
          Login
        </Button>
      </Box>

      {/* Main Section */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          color: '#5a2b8c',
          padding: '30px',
          marginBottom: '60px',
          borderRadius: '8px',
        }}
      >
        <img //This Imagine is the Southern MN Science Fair Logo displayed at the top of the page
          src={logo}
          alt="Southern MN Science Fair Logo"
          style={{ width: '650px', height: 'auto' }}
        />
        <Typography variant="h4" gutterBottom>
          <br />
          Welcome to Southern Minnesota Science Fair!
        </Typography>

        <Box //These next two boxes are side by side by design
          display="flex"
          alignItems="center" // Vertically centers items
          justifyContent="center" // Horizontally centers both text and button
          gap="30px" // Space between text and button
        >
          <Typography variant="body1" gutterBottom>
            Let us take care of online registration for your fair! <br />
            Simplify your planning and make your event a success!
          </Typography>

          <Button //Another button that navigates to the login page
            onClick={() => navigate('/login')}
            variant="contained"
            sx={{
              backgroundColor: '#5a2b8c',
              color: '#ffffff',
            }}
          >
            Login
          </Button>
        </Box>
      </Box>

      {/* Why FairTech Section */}
      <Box //This section has the background of the application and a spot for the user to contact the application owner
        sx={{
          backgroundColor: '#f8f9fa', //light grey color
          padding: '20px',
          color: '#5a2b8c',
          borderRadius: '8px',
          marginBottom: '100px',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Why use the Southern Minnesota Science Fair Platform?
        </Typography>
        <Typography variant="body1" gutterBottom>
          We have all the tools you need for your events. Online registration,
          communication, judging, and so much more! <br />
          Looking to get your own fair running? Send us a message!
        </Typography>
        <Button //Another button that navigates to the Contact Us page
          variant="contained"
          sx={{ backgroundColor: '#5a2b8c', color: '#ffffff' }}
        >
          Contact Us
        </Button>
      </Box>

      {/* Footer Section */}
      <Box //This section has more about the application and it's main features
        sx={{
          backgroundColor: '#5a2b8c', //Purple Background
          padding: '20px',
          color: '#ffffff',
          borderRadius: '8px',
        }}
      >
        <Typography variant="body1" gutterBottom>
          Running a Science fair is not easy. No worries! We've got Paperwork
          Review, Project Approval, Teacher Access, Science Fair Wizards,
          Judging, and Awards!
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
