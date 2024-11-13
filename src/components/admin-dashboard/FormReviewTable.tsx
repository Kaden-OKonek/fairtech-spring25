import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { VisibilityOutlined, Edit } from '@mui/icons-material';
import { FormSubmission } from '../../types/forms.types';
import { formsService } from '../../services/forms.service';
import { useAuth } from '../../contexts/AuthContext';

interface FormReviewTableProps {
  onViewForm: (form: FormSubmission) => void;
  onEditForm: (form: FormSubmission) => void;
}

const FormReviewTable: React.FC<FormReviewTableProps> = ({
  onViewForm,
  onEditForm,
}) => {
  const { authStatus } = useAuth();
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authStatus.user?.uid) return;

    setLoading(true);

    const unsubscribe = formsService.subscribeToForms(
      authStatus.user.uid,
      'admin',
      (updatedForms) => {
        setForms(updatedForms);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [authStatus.user?.uid]);

  const getStatusColor = (status: FormSubmission['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_revision':
        return 'warning';
      case 'in_review':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredAndSortedForms = React.useMemo(() => {
    return forms
      .filter((form) => {
        const matchesStatus =
          statusFilter === 'all' || form.status === statusFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          form.studentName.toLowerCase().includes(searchLower) ||
          form.fileName.toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [forms, statusFilter, searchTerm]);

  // Define status filter options with clear admin review labeling
  const statusFilterOptions = [
    { value: 'all', label: 'All Forms' },
    { value: 'pending', label: 'Pending Admin Review' },
    { value: 'in_review', label: 'In Admin Review' },
    { value: 'needs_revision', label: 'Needs Revision' },
    { value: 'approved', label: 'Approved by Admin' },
    { value: 'rejected', label: 'Rejected by Admin' },
  ];

  const renderAdminReviewers = (form: FormSubmission) => {
    if (!form.reviewers || form.reviewers.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No admin reviewers assigned
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {form.reviewers.map((reviewer, index) => (
          <Chip
            key={index}
            size="small"
            label={`${reviewer.role} Admin Review - ${reviewer.status}`}
            color={reviewer.status === 'completed' ? 'success' : 'default'}
          />
        ))}
      </Box>
    );
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Form Reviews
      </Typography>

      {/* Filters section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Review Status</InputLabel>
            <Select
              value={statusFilter}
              label="Review Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusFilterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Forms Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Admin Reviews</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading forms...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No forms found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.studentName}</TableCell>
                  <TableCell>{form.fileName}</TableCell>
                  <TableCell>{form.uploadDate.toLocaleDateString()}</TableCell>
                  <TableCell>{renderAdminReviewers(form)}</TableCell>
                  <TableCell>
                    <Chip
                      label={form.status.replace('_', ' ')}
                      color={getStatusColor(form.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => onViewForm(form)}
                      size="small"
                      title="View form"
                    >
                      <VisibilityOutlined />
                    </IconButton>
                    <IconButton
                      onClick={() => onEditForm(form)}
                      size="small"
                      title="Edit form"
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FormReviewTable;
