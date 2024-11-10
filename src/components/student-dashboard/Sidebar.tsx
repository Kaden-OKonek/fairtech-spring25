import React, { useState } from 'react';
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
import { ClipboardList, Microscope, Settings } from 'lucide-react';
import LogoutButton from '../LogoutButton';
import { StudentContentType } from '../../types/studentDashboard';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeContent: StudentContentType;
  onContentChange: (content: StudentContentType) => void;
  reviewedFormsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeContent,
  onContentChange,
  reviewedFormsCount,
}) => {
  const theme = useTheme();
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Student';
  const [isPaperworkExpanded, setIsPaperworkExpanded] = useState(false);

  const handlePaperworkClick = () => {
    setIsPaperworkExpanded((prev) => !prev);
    onContentChange('paperwork'); // Set the main content to Paperwork on click
  };

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
          Student Panel
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
            onClick={() => onContentChange('paperwork')}
            selected={activeContent === 'paperwork'}
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
            <ListItemText primary="My Paperwork" sx={{ ml: 2 }} />
            {reviewedFormsCount > 0 && (
        <List>
          {/* Paperwork Section */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handlePaperworkClick}
              selected={activeContent === 'paperwork'}
            >
              <ListItemText primary="Paperwork" />
              <Badge
                badgeContent={reviewedFormsCount}
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
            </ListItemButton>
          </ListItem>

          {/* Conditionally render sub-buttons if expanded */}
          {isPaperworkExpanded && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => onContentChange('form-questionnaire')}
                  selected={activeContent === 'form-questionnaire'}
                  sx={{ pl: 4 }}
                >
                  <ListItemText primary="Form Questionnaire" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => onContentChange('my-documents')}
                  selected={activeContent === 'my-documents'}
                  sx={{ pl: 4 }}
                >
                  <ListItemText primary="My Documents" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {/* Projects Button */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onContentChange('projects')}
              selected={activeContent === 'projects'}
            >
              <ListItemText primary="My Projects" />
            </ListItemButton>
          </ListItem>

          {/* Settings Button */}
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
    </Box>
  );
};

export default Sidebar;
