import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Microscope,
  Settings,
  FileQuestion,
  MessageSquare,
} from 'lucide-react';
import LogoutButton from '../LogoutButton';
import { useAuth } from '../../contexts/AuthContext';
import { ContentType } from '../../types/studentDashboard';

interface SidebarProps {
  activeContent: ContentType;
  onContentChange: (content: ContentType) => void;
  pendingFormsCount?: number;
  newFeedbackCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeContent,
  onContentChange,
  newFeedbackCount = 0,
}) => {
  const theme = useTheme();
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Student';

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: 'background.paper',
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="primary" fontWeight="bold">
          Student Portal
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back,
        </Typography>
        <Typography variant="h6" color="text.primary" fontWeight="bold">
          {userName}
        </Typography>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => onContentChange('projects')}
            selected={activeContent === 'projects'}
            sx={{
              borderRadius: '12px',
              '&.Mui-selected': {
                backgroundColor: 'primary.lighter',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <Microscope size={20} />
            <ListItemText primary="My Projects" sx={{ ml: 2 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => onContentChange('feedback')}
            selected={activeContent === 'feedback'}
            sx={{
              borderRadius: '12px',
              '&.Mui-selected': {
                backgroundColor: 'primary.lighter',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <MessageSquare size={20} />
            <ListItemText primary="Feedback" sx={{ ml: 2 }} />
            {newFeedbackCount > 0 && (
              <Badge badgeContent={newFeedbackCount} color="primary" />
            )}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => onContentChange('form-questionnaire')}
            selected={activeContent === 'form-questionnaire'}
            sx={{
              borderRadius: '12px',
              '&.Mui-selected': {
                backgroundColor: 'primary.lighter',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <FileQuestion size={20} />
            <ListItemText primary="Required Forms" sx={{ ml: 2 }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => onContentChange('settings')}
            selected={activeContent === 'settings'}
            sx={{
              borderRadius: '12px',
              '&.Mui-selected': {
                backgroundColor: 'primary.lighter',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <Settings size={20} />
            <ListItemText primary="Settings" sx={{ ml: 2 }} />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ p: 2 }}>
        <LogoutButton variant="outlined" color="primary" />
      </Box>
    </Box>
  );
};

export default Sidebar;
