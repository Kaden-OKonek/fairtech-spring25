import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Menu,
} from '@mui/material';
import {
  MoreVertical,
  Lock,
  Ban,
  CheckCircle,
  Trash2,
  FileUser,
} from 'lucide-react';
import { usersService, User } from '../../services/users.service';
import { superAdminService } from '../../services/superAdmin.service';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [changeRoleType, setChangeRoleType] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [passwordResetAlert, setPasswordResetAlert] = useState<string | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'suspend' | 'activate' | 'resetPassword' | 'delete' | 'changeRole';
    userId: string;
    userEmail?: string;
  } | null>(null);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [newPassword, setNewPassword] = useState('');

  //Delay function
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const { authStatus } = useAuth();

  useEffect(() => {
    const unsubscribe = usersService.subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = usersService.subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!users) return;

    let filtered = [...users];

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user?.userType === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user?.status === statusFilter);
    }

    // Apply search term
    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((user) => {
        if (!user) return false;

        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';

        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          email.includes(searchLower)
        );
      });
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter, searchTerm]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    userId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleUserAction = async (
    action: 'suspend' | 'activate' | 'resetPassword' | 'delete' | 'changeRole',
    userId: string
  ) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setCurrentAction({ type: action, userId, userEmail: user.email });
    setActionDialogOpen(true);
    handleMenuClose();
  };

  const checkPasswordRequirements = (password: string) => {
    let missingRequirementsMessage = 'The New Password must contain:';
    if (password.length < 6) {
      missingRequirementsMessage += '\n • At Least 6 Characters';
    }
    if (!/[A-Z]/.test(password)) {
      missingRequirementsMessage += '\n • One Uppercase Letter';
    }
    if (!/[a-z]/.test(password)) {
      missingRequirementsMessage += '\n • One Lower Letter';
    }
    if (!/\d/.test(password)) {
      missingRequirementsMessage += '\n • One Number';
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      missingRequirementsMessage += '\n • One Special Character';
    }

    if (missingRequirementsMessage === 'The New Password must contain:') {
      //Password has all requirements fullfilled
      return null;
    } else {
      return missingRequirementsMessage;
    }
  };

  const handleActionConfirm = async () => {
    if (!currentAction) return;

    try {
      setError(null);

      switch (currentAction.type) {
        case 'suspend':
          await usersService.updateUserStatus(
            currentAction.userId,
            'suspended'
          );
          break;
        case 'activate':
          await usersService.updateUserStatus(currentAction.userId, 'active');
          break;
        case 'resetPassword':
          if (!newPassword) {
            //Send alert message that input is required to reset password
            setPasswordResetAlert('New password is required');
            return;
          }
          //Check to see if our new password meets all password requirements
          const requirementMessage = checkPasswordRequirements(newPassword);
          //If there are changes to be made to the password, alert the user
          if (requirementMessage != null) {
            setPasswordResetAlert(requirementMessage);
            return;
          }
          await superAdminService.resetUserPassword(
            currentAction.userId,
            newPassword
          );
          //Send alert message that resetting password was a success
          setPasswordResetAlert('Success! Password Reset');
          //Delay 3 sec so the user sees the alert message before dialog
          await delay(3000);
          break;
        case 'delete':
          // Implement user deletion
          break;
        case 'changeRole':
          await usersService.changeUserRole(
            currentAction.userId,
            changeRoleType
          );
          break;
      }

      setActionDialogOpen(false);
      setCurrentAction(null);
      setPasswordResetAlert(null);
      setNewPassword('');
      setChangeRoleType(null);
    } catch (err) {
      setError('Failed to perform action. Please try again.');
    }
  };

  const handleBulkEmail = async () => {
    try {
      setError(null);

      await superAdminService.sendBulkEmail({
        userIds: selectedUsers,
        subject: emailSubject,
        message: emailContent,
      });

      setEmailDialogOpen(false);
      setEmailSubject('');
      setEmailContent('');
      setSelectedUsers([]);
    } catch (err) {
      setError('Failed to send email. Please try again.');
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Filters section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Search users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(
              (user) =>
                user && (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          //superAdmin is the only userType that is in PascalCase because it is two words, so if we deal with a Super Admin, output a different text
                          user.userType === 'superAdmin'
                            ? 'super admin'
                            : user.userType
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusChipColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.registrationDate?.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, user.id)}>
                        <MoreVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            selectedUserId && handleUserAction('resetPassword', selectedUserId)
          }
        >
          <Lock size={18} style={{ marginRight: 8 }} />
          Reset Password
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedUserId && handleUserAction('suspend', selectedUserId)
          }
        >
          <Ban size={18} style={{ marginRight: 8 }} />
          Suspend User
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedUserId && handleUserAction('activate', selectedUserId)
          }
        >
          <CheckCircle size={18} style={{ marginRight: 8 }} />
          Activate User
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedUserId && handleUserAction('delete', selectedUserId)
          }
        >
          <Trash2 size={18} style={{ marginRight: 8 }} />
          Delete User
        </MenuItem>
        {selectedUserId !== (authStatus.user?.uid ?? null) && ( //The current user cannot edit their own role ensuring that there will at least always remain one superAdmin
          <>
            <MenuItem
              onClick={() =>
                selectedUserId && handleUserAction('changeRole', selectedUserId)
              }
            >
              <FileUser size={18} style={{ marginRight: 8 }} />
              Change Role
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
      >
        <DialogTitle>
          {currentAction?.type === 'resetPassword'
            ? 'Reset Password'
            : currentAction?.type === 'changeRole'
              ? 'Change User Role'
              : `${currentAction?.type.charAt(0).toUpperCase()}${currentAction?.type.slice(1)} User`}
        </DialogTitle>
        <DialogContent>
          {passwordResetAlert && (
            <Box>
              <Alert
                severity={
                  passwordResetAlert.includes('Success') ? 'success' : 'error'
                }
                sx={{ mb: 2 }}
              >
                <Typography sx={{ whiteSpace: 'pre-line' }}>
                  {passwordResetAlert}
                </Typography>
              </Alert>
            </Box>
          )}
          <DialogContentText>
            {currentAction?.type === 'resetPassword'
              ? `Reset password for user: ${currentAction.userEmail}`
              : currentAction?.type === 'changeRole'
                ? `Change role for user: ${currentAction.userEmail}`
                : `Are you sure you want to ${currentAction?.type} this user?`}
          </DialogContentText>
          {currentAction?.type === 'resetPassword' && (
            <TextField
              autoFocus
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          )}
          {currentAction?.type === 'changeRole' && (
            <>
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={changeRoleType}
                  label="Role"
                  onChange={(e) => setChangeRoleType(e.target.value)}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="judge">Judge</MenuItem>
                  <MenuItem value="volunteer">Volunteer</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superAdmin">Super Admin</MenuItem>
                </Select>
              </FormControl>
              {changeRoleType === 'superAdmin' && (
                //Warning Message if the role type is changing to Super Admin to ensure we protect our application
                <Box>
                  <Alert severity={'warning'} sx={{ mb: 2 }}>
                    <Typography sx={{ whiteSpace: 'pre-line' }}>
                      WARNING: You are attempting to promote a user to have a
                      role as a Super Admin. Doing so would give the user access
                      to all high power functions including the ablity to demote
                      your role as a Super Admin. If you do not trust this user
                      or know who they are, do not proceed and cancel this
                      action.
                    </Typography>
                  </Alert>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActionDialogOpen(false);
              setPasswordResetAlert(null);
              setChangeRoleType(null);
              setNewPassword('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Bulk Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Subject"
            fullWidth
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Message"
            multiline
            rows={4}
            fullWidth
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkEmail} variant="contained" color="primary">
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
