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
import { useAuth } from '../../contexts/AuthContext';

export type AdminContentType = 'forms' | 'students' | 'settings';

interface SidebarProps {
  activeContent: AdminContentType;
  onContentChange: (content: AdminContentType) => void;
  pendingFormsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeContent,
  onContentChange,
  pendingFormsCount,
}) => {
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Admin';

  return (
    <Box
      sx={{
        width: '250px',
        backgroundColor: '#6a1b9a',
        color: 'white',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
      }}
    >
      <Box>
        <Typography variant="h5" gutterBottom>
          Hi {userName}
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onContentChange('forms')}
              selected={activeContent === 'forms'}
            >
              <ListItemText primary="Form Reviews" />
              <Badge
                badgeContent={pendingFormsCount}
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
              onClick={() => onContentChange('students')}
              selected={activeContent === 'students'}
            >
              <ListItemText primary="Students" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onContentChange('settings')}
              selected={activeContent === 'settings'}
            >
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <LogoutButton variant="outlined" color="inherit" />
    </Box>
  );
};

export default Sidebar;
