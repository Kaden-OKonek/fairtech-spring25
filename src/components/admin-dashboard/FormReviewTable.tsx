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
  TableSortLabel,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  useTheme,
} from '@mui/material';
import { Edit } from 'lucide-react';
import { FormSubmission } from '../../types/forms.types';
import { formsService } from '../../services/forms.service';
import { VisibilityOutlined } from '@mui/icons-material';

interface FormReviewTableProps {
  onViewForm: (form: FormSubmission) => void;
  onEditForm: (form: FormSubmission) => void;
}

const FormReviewTable: React.FC<FormReviewTableProps> = ({
  onViewForm,
  onEditForm,
}) => {
  const theme = useTheme();
  const [forms, setForms] = useState<FormSubmission[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<keyof FormSubmission>('uploadDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadForms = async () => {
      try {
        const fetchedForms = await formsService.getAllForms();
        setForms(fetchedForms);
      } catch (error) {
        console.error('Error loading forms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  const getStatusColor = (status: FormSubmission['status']) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_revision':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleSort = (property: keyof FormSubmission) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredAndSortedForms = forms
    .filter(
      (form) =>
        (statusFilter === 'all' || form.status === statusFilter) &&
        (form.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          form.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const isAsc = order === 'asc';
      if (orderBy === 'uploadDate' || orderBy === 'lastUpdated') {
        return isAsc
          ? a[orderBy].getTime() - b[orderBy].getTime()
          : b[orderBy].getTime() - a[orderBy].getTime();
      }
      return isAsc
        ? (a[orderBy] ?? '') < (b[orderBy] ?? '')
          ? -1
          : 1
        : (b[orderBy] ?? '') < (a[orderBy] ?? '')
          ? -1
          : 1;
    });

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Form Reviews
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          backgroundColor: 'background.paper',
          p: 2,
          borderRadius: theme.shape.borderRadius,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="needs_revision">Needs Revision</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: theme.shadows[2],
          borderRadius: 4,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'studentName'}
                  direction={orderBy === 'studentName' ? order : 'asc'}
                  onClick={() => handleSort('studentName')}
                >
                  Student Name
                </TableSortLabel>
              </TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'uploadDate'}
                  direction={orderBy === 'uploadDate' ? order : 'asc'}
                  onClick={() => handleSort('uploadDate')}
                >
                  Upload Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedForms.map((form) => (
              <TableRow key={form.id}>
                <TableCell>{form.studentName}</TableCell>
                <TableCell>{form.fileName}</TableCell>
                <TableCell>{form.uploadDate.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={form.status.replace('_', ' ')}
                    color={getStatusColor(form.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onViewForm(form)} size="small">
                    <VisibilityOutlined />
                  </IconButton>
                  <IconButton onClick={() => onEditForm(form)} size="small">
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FormReviewTable;
