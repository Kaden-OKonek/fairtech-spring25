import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { Users, BarChart2, Settings } from 'lucide-react';
import LogoutButton from '../LogoutButton';
import { useAuth } from '../../contexts/AuthContext';
import { SuperAdminContentType } from '../../types/superAdmin.types';

interface SidebarProps {
  activeContent: SuperAdminContentType;
  onContentChange: (content: SuperAdminContentType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeContent,
  onContentChange,
}) => {
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Super Admin';

  const menuItems = [
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="primary" fontWeight="bold">
          Super Admin
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Welcome back,
        </Typography>
        <Typography variant="h6" color="text.primary" fontWeight="medium">
          {userName}
        </Typography>
      </Box>

      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuItems.map(({ id, label, icon: Icon }) => (
          <ListItem key={id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => onContentChange(id)}
              selected={activeContent === id}
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
              <ListItemIcon>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, mt: 'auto' }}>
        <LogoutButton variant="outlined" color="primary" />
      </Box>
    </Box>
  );
};

export default Sidebar;
