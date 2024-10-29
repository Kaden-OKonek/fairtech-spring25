import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
  IconButton,
  useTheme,
  Divider,
} from '@mui/material';
import { ClipboardList, Users, Settings, ChevronLeft } from 'lucide-react';
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
  const theme = useTheme();
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Admin';

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
          Admin Panel
        </Typography>
        <IconButton size="small">
          <ChevronLeft />
        </IconButton>
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
            onClick={() => onContentChange('forms')}
            selected={activeContent === 'forms'}
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
            <ClipboardList size={20} />
            <ListItemText primary="Form Reviews" sx={{ ml: 2 }} />
            {pendingFormsCount > 0 && (
              <Badge
                badgeContent={pendingFormsCount}
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
            onClick={() => onContentChange('students')}
            selected={activeContent === 'students'}
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
            <Users size={20} />
            <ListItemText primary="Students" sx={{ ml: 2 }} />
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
