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
import { MoreVertical, Lock, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { usersService, User } from '../../services/users.service';
import { superAdminService } from '../../services/superAdmin.service';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'suspend' | 'activate' | 'resetPassword' | 'delete';
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
    action: 'suspend' | 'activate' | 'resetPassword' | 'delete',
    userId: string
  ) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setCurrentAction({ type: action, userId, userEmail: user.email });
    setActionDialogOpen(true);
    handleMenuClose();
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
            setError('New password is required');
            return;
          }
          await superAdminService.resetUserPassword(
            currentAction.userId,
            newPassword
          );
          break;
        case 'delete':
          // Implement user deletion
          break;
      }

      setActionDialogOpen(false);
      setCurrentAction(null);
      setNewPassword('');
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
                      <Chip label={user.userType} size="small" />
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
      </Menu>

      {/* Action Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
      >
        <DialogTitle>
          {currentAction?.type === 'resetPassword'
            ? 'Reset Password'
            : `${currentAction?.type.charAt(0).toUpperCase()}${currentAction?.type.slice(1)} User`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {currentAction?.type === 'resetPassword'
              ? `Reset password for user: ${currentAction.userEmail}`
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
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
