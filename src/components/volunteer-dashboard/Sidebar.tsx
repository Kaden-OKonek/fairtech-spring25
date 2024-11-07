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
import { ClipboardCheck, UserCircle, Settings } from 'lucide-react';
import LogoutButton from '../LogoutButton';
import { useAuth } from '../../contexts/AuthContext';

export type VolunteerContentType = 'tasks' | 'profile' | 'settings';

interface SidebarProps {
  activeContent: VolunteerContentType;
  onContentChange: (content: VolunteerContentType) => void;
  pendingTasksCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeContent,
  onContentChange,
  pendingTasksCount,
}) => {
  const theme = useTheme();
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Volunteer';

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
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h5" color="primary" fontWeight="bold">
          Volunteer Portal
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
            onClick={() => onContentChange('tasks')}
            selected={activeContent === 'tasks'}
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
            <ClipboardCheck size={20} />
            <ListItemText primary="Tasks" sx={{ ml: 2 }} />
            {pendingTasksCount > 0 && (
              <Badge
                badgeContent={pendingTasksCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: theme.palette.error.main,
                  },
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => onContentChange('profile')}
            selected={activeContent === 'profile'}
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
            <UserCircle size={20} />
            <ListItemText primary="Profile" sx={{ ml: 2 }} />
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
