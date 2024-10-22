import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';

const ProjectsContent: React.FC = () => (
  <>
    <Typography variant="h4" gutterBottom>
      My Projects
    </Typography>

    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
      <Button variant="contained" sx={{ backgroundColor: '#512da8' }}>
        Create a New Project
      </Button>
      <Button
        variant="outlined"
        sx={{ borderColor: '#512da8', color: '#512da8' }}
      >
        Join an Existing Project
      </Button>
    </Box>

    <Typography variant="body1">2 / 5 Projects</Typography>

    <Box sx={{ border: '1px solid #ccc', padding: 2, marginTop: 2 }}>
      <List>
        <ListItem>
          <ListItemText primary="Baking Soda Volcano" secondary="Active" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Magnet Project" secondary="Inactive" />
        </ListItem>
      </List>
    </Box>
  </>
);

export default ProjectsContent;
