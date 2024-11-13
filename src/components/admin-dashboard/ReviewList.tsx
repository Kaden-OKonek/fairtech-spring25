import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Alert,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { FormSubmission, ReviewStatus } from '../../types/forms.types';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  forms: FormSubmission[];
  onViewForm: (form: FormSubmission) => void;
  currentUserId: string;
}

type TabType = 'all' | 'assigned' | 'reviewed';

const ReviewList: React.FC<ReviewListProps> = ({
  forms,
  onViewForm,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | 'all'>(
    'all'
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  // Calculate all the counts
  const counts = useMemo(() => {
    const allFormsCount = forms.length;
    const pendingCount = forms.filter((form) =>
      form.reviewers.some(
        (r) => r.userId === currentUserId && r.status === 'pending'
      )
    ).length;
    const reviewedCount = forms.filter((form) =>
      form.versions[form.currentVersion].reviews.some(
        (r) => r.reviewerId === currentUserId
      )
    ).length;

    return { allFormsCount, pendingCount, reviewedCount };
  }, [forms, currentUserId]);

  // Enhanced filter logic using useMemo
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      // Search filter
      const matchesSearch =
        form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.studentName.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        selectedStatus === 'all' || form.status === selectedStatus;

      // Tab filters
      const isAssignedToMe = form.reviewers.some(
        (reviewer) =>
          reviewer.userId === currentUserId && reviewer.status === 'pending'
      );
      const isReviewedByMe = form.versions[form.currentVersion].reviews.some(
        (review) => review.reviewerId === currentUserId
      );

      // Apply filters based on active tab
      switch (activeTab) {
        case 'assigned':
          return matchesSearch && matchesStatus && isAssignedToMe;
        case 'reviewed':
          return matchesSearch && matchesStatus && isReviewedByMe;
        default: // 'all' tab
          return matchesSearch && matchesStatus;
      }
    });
  }, [forms, searchTerm, selectedStatus, activeTab, currentUserId]);

  const getStatusChip = (status: ReviewStatus, isAssigned: boolean) => {
    const configs = {
      approved: { color: 'success', icon: <CheckCircle size={16} /> },
      rejected: { color: 'error', icon: <AlertTriangle size={16} /> },
      needs_revision: { color: 'warning', icon: <AlertTriangle size={16} /> },
      in_review: { color: 'info', icon: <Clock size={16} /> },
      pending: { color: 'default', icon: <Clock size={16} /> },
    };

    const config = configs[status];
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          icon={config.icon}
          label={status.replace('_', ' ')}
          color={config.color as any}
          size="small"
        />
        {isAssigned && (
          <Chip size="small" color="primary" label="Assigned to you" />
        )}
      </Stack>
    );
  };

  const getAssignmentStatus = (form: FormSubmission) => {
    const isAssigned = form.reviewers.some(
      (r) => r.userId === currentUserId && r.status === 'pending'
    );
    const hasReviewed = form.versions[form.currentVersion].reviews.some(
      (r) => r.reviewerId === currentUserId
    );

    return { isAssigned, hasReviewed };
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Form Reviews
        </Typography>

        {/* Enhanced Tabs with Badges */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val as TabType)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            value="all"
            label={
              <Badge
                badgeContent={counts.allFormsCount}
                color="default"
                max={99}
              >
                <Box sx={{ pr: 1 }}>All Forms</Box>
              </Badge>
            }
          />
          <Tab
            value="assigned"
            label={
              <Badge badgeContent={counts.pendingCount} color="error" max={99}>
                <Box sx={{ pr: 1 }}>Assigned to Me</Box>
              </Badge>
            }
          />
          <Tab
            value="reviewed"
            label={
              <Badge
                badgeContent={counts.reviewedCount}
                color="success"
                max={99}
              >
                <Box sx={{ pr: 1 }}>Reviewed by Me</Box>
              </Badge>
            }
          />
        </Tabs>

        {/* Search and Filter Controls */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            size="small"
            placeholder="Search by title or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<Filter size={20} />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          >
            Status:{' '}
            {selectedStatus === 'all'
              ? 'All'
              : selectedStatus.replace('_', ' ')}
          </Button>
        </Stack>

        {/* Forms Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Form Title</TableCell>
                <TableCell>Latest Update</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredForms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Alert severity="info">
                      {activeTab === 'assigned'
                        ? 'No forms are currently assigned to you'
                        : activeTab === 'reviewed'
                          ? "You haven't reviewed any forms yet"
                          : 'No forms match the current filters'}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                filteredForms.map((form) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { isAssigned, hasReviewed } = getAssignmentStatus(form);
                  return (
                    <TableRow
                      key={form.id}
                      sx={{
                        backgroundColor: isAssigned
                          ? 'action.hover'
                          : 'inherit',
                      }}
                    >
                      <TableCell>{form.studentName}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FileText size={16} />
                          {form.title}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(form.updatedAt, {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(form.status, isAssigned)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Form">
                          <IconButton
                            onClick={() => onViewForm(form)}
                            size="small"
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Comments">
                          <IconButton size="small">
                            <Badge
                              badgeContent={
                                form.versions[form.currentVersion].reviews
                                  .length
                              }
                              color="primary"
                            >
                              <MessageSquare size={18} />
                            </Badge>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Status Filter Menu */}
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setSelectedStatus('all');
              setFilterMenuAnchor(null);
            }}
          >
            All Statuses
          </MenuItem>
          {[
            'pending',
            'in_review',
            'needs_revision',
            'approved',
            'rejected',
          ].map((status) => (
            <MenuItem
              key={status}
              onClick={() => {
                setSelectedStatus(status as ReviewStatus);
                setFilterMenuAnchor(null);
              }}
            >
              {status.replace('_', ' ')}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Paper>
  );
};

export default ReviewList;
