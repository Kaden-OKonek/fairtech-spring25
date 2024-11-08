import React, { useState /*useRef*/ } from 'react';
//import { doc, setDoc } from 'firebase/firestore';
//import { db } from '../firebase';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
//import { useNavigate } from 'react-router-dom';
//Import Image Assets
import ScienceTestTubes from '../assets/images/ScienceTestTubes.png';
import ScienceAtom from '../assets/images/ScienceAtom.png';
import ScienceMicroscope from '../assets/images/ScienceMicroscope.png';
import { useAuth } from '../contexts/AuthContext';

const ClassDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const teacherName = authStatus.metadata?.lastName;
  //Initialize some Variables
  const images = [ScienceTestTubes, ScienceAtom, ScienceMicroscope]; //List full of our images
  const classCode = 'Y893-GH22'; //(Note: Will need to find a way to make a unique short class ID)
  const projects =
    //(Note: This will need to be data that is pulled from our DB)
    [
      { name: "Kaden & Pedro's Project", status: 'Active', id: 1 },
      { name: "Abi & Hawi's project", status: 'Active', id: 2 },
      { name: "Rushit's Project", status: 'Active', id: 3 },
      { name: "Evan's Project", status: 'Inactive', id: 4 },
      { name: "Montana's Project", status: 'Inactive', id: 5 },
    ];
  //const dialogRef = useRef<HTMLDialogElement>(null); //Reference for the dialog element for the pop-up window

  //Hooks
  const [projectsData, setProjectsData] = useState(projects); //Use state to manage project data
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); //This controls weather our pop up window to confirm project removal is visable
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  ); //This holds the ID of the project we want to delete (initialized to 'null' as at the begining there are no projects selected to be removed)

  //Methods
  const handleRemoveProject = (projectId: number) => {
    //Show the confirmation dialog window
    setShowConfirmDialog(true);
    setSelectedProjectId(projectId);
  };

  const handleConfirmRemove = () => {
    //Remove the project with the given ID from the state
    const updatedProjects = projectsData.filter(
      (project) => project.id !== selectedProjectId
    );
    setProjectsData(updatedProjects);
    //Close confirmation dialog window
    setShowConfirmDialog(false);
  };

  const handleCancelRemove = () => {
    //Nothing Happens when cancelled + close confirmation dialog window
    setShowConfirmDialog(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar*/}
      <Box
        sx={{
          width: '20%',
          backgroundColor: '#6a1b9a',
          color: 'white',
          padding: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Class Dashboard
        </Typography>
        <List>
          <ListItem component="button">
            <ListItemText primary="Account Settings" />
          </ListItem>
        </List>
      </Box>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, padding: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: '#5a2b8c', marginBottom: '60px' }}
        >
          Have Students Join Using Class Code:
          {/* using span we can customize the other part of the text so the "class code" is a gold color*/}
          <span style={{ color: '#d9b63c' }}>
            {' '}
            <br /> {classCode}!
          </span>
        </Typography>

        <Box //These next two texts are side by side by design
          display="flex"
          alignItems="center" //Vertically centers items side by side
          justifyContent="space-between" //Adjust spacing between the text
        >
          <Typography variant="h3" gutterBottom sx={{ color: '#5a2b8c' }}>
            {teacherName}'s Class!
          </Typography>

          <Typography variant="body1" sx={{ marginRight: '35px' }}>
            Projects Enrolled: {projects.length}
          </Typography>
        </Box>

        {/* All Projects listed under the teacher's class*/}
        <List>
          {projectsData.length === 0 ? ( //If there are no projects in the class project list, give a small message of encouragment
            <Typography variant="h5" align="center" sx={{ marginTop: '100px' }}>
              No Projects Currently in Your Class...
              <br />
              Tell Your Students to Join Up Soon!
            </Typography>
          ) : (
            //Else, there are at least 1 to many projects currently in the class project list
            projectsData.map((project) => (
              <ListItem key={project.id}>
                <img
                  src={images[project.id % images.length]} //This will rotate through the images we have in our image list for UI Design for each row of projects in the table
                  style={{ width: '50px', height: 'auto' }}
                />

                <ListItemText
                  primary={project.name}
                  secondary={project.status}
                  style={{ marginLeft: '20px' }}
                />

                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#ffffff', color: '#5a2b8c' }} //Need implemention to navigate to project dashboard
                >
                  View Project
                </Button>

                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#ffffff', color: '#d30000' }}
                  onClick={() => handleRemoveProject(project.id)} // Show confirmation dialog
                >
                  Remove
                </Button>
              </ListItem>
            ))
          )}
        </List>

        {/* Confirmation dialog */}
        <Dialog open={showConfirmDialog} onClose={handleCancelRemove}>
          <DialogTitle>Confirm Removal</DialogTitle>
          <DialogContent>
            Are you sure you want to remove "
            {
              projectsData.find((project) => project.id === selectedProjectId)
                ?.name
            }
            " from your class?
            <br />
            Please note this cannot be undone
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#ffffff', color: '#013220' }}
              onClick={handleConfirmRemove}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#ffffff', color: '#8B0000' }}
              onClick={handleCancelRemove}
            >
              No
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ClassDashboard;
