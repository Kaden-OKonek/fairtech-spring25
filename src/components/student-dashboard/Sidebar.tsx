import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
} from '@mui/material';
import LogoutButton from '../LogoutButton';
import { ContentType } from '../../types/studentDashboard';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeContent: ContentType;
  onContentChange: (content: ContentType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeContent,
  onContentChange,
}) => {
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Student';

  return (
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
            <ListItemButton
              onClick={() => onContentChange('paperwork')}
              selected={activeContent === 'paperwork'}
            >
              <ListItemText primary="Paperwork" />
              <Badge
                badgeContent={1}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: 'red',
                    color: 'white',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onContentChange('projects')}
              selected={activeContent === 'projects'}
            >
              <ListItemText primary="My Projects" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onContentChange('settings')}
              selected={activeContent === 'settings'}
            >
              <ListItemText primary="Account Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <LogoutButton variant="outlined" color="inherit" />
    </Box>
  );
};

export default Sidebar;
