import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import LogoutButton from '../LogoutButton';
import { ContentType } from '../../types/studentDashboard';

interface SidebarProps {
  userName: string;
  activeContent: ContentType;
  onContentChange: (content: ContentType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onContentChange }) => (
  <Box
    sx={{
      width: '20%',
      backgroundColor: '#6a1b9a',
      color: 'white',
      padding: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Box>
      <Typography variant="h5" gutterBottom>
        Hi {userName}
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onContentChange('paperwork')}>
            <ListItemText primary="Paperwork" />
            <Box
              sx={{
                ml: 1,
                backgroundColor: 'red',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
              }}
            >
              1
            </Box>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onContentChange('projects')}>
            <ListItemText primary="My Projects" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onContentChange('settings')}>
            <ListItemText primary="Account Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
    <LogoutButton variant="outlined" color="inherit" />
  </Box>
);

export default Sidebar;
