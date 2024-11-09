import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const Settings: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    notifyOnNewRegistration: true,
    notifyOnFormSubmission: true,
    digestFrequency: 'daily',
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPasswords: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  const handleEmailSettingChange = (setting: keyof typeof emailSettings) => {
    setEmailSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSecuritySettingChange = (
    setting: keyof typeof securitySettings
  ) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]:
        typeof prev[setting] === 'boolean' ? !prev[setting] : prev[setting],
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      {/* Email Notifications */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Email Notifications
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="New User Registration"
              secondary="Receive notifications when new users register"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={emailSettings.notifyOnNewRegistration}
                onChange={() =>
                  handleEmailSettingChange('notifyOnNewRegistration')
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Form Submissions"
              secondary="Receive notifications for new form submissions"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={emailSettings.notifyOnFormSubmission}
                onChange={() =>
                  handleEmailSettingChange('notifyOnFormSubmission')
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Security Settings */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Strong Password Requirement"
              secondary="Require complex passwords for all users"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={securitySettings.requireStrongPasswords}
                onChange={() =>
                  handleSecuritySettingChange('requireStrongPasswords')
                }
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Two-Factor Authentication"
              secondary="Require 2FA for administrative actions"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={securitySettings.twoFactorAuth}
                onChange={() => handleSecuritySettingChange('twoFactorAuth')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Session Timeout"
              secondary={`Automatic logout after ${securitySettings.sessionTimeout} minutes of inactivity`}
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenDialog(true)}
              >
                Configure
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* System Maintenance */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Maintenance
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="outlined" color="primary">
            Backup Database
          </Button>
          <Button variant="outlined" color="error">
            Clear Cache
          </Button>
        </Box>
      </Paper>

      {/* Session Timeout Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Configure Session Timeout</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Timeout (minutes)"
            type="number"
            fullWidth
            value={securitySettings.sessionTimeout}
            onChange={(e) =>
              setSecuritySettings((prev) => ({
                ...prev,
                sessionTimeout: parseInt(e.target.value) || 30,
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
