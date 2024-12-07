import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { Search, Eye, Users, FileText } from 'lucide-react';
import { Project } from '../../types/project.types';
import { FormSubmission } from '../../types/forms.types';

interface ProjectWithForms extends Project {
  forms: FormSubmission[];
  totalForms: number;
  reviewedForms: number;
}

interface ProjectReviewListProps {
  projects: ProjectWithForms[];
  onViewProject: (project: ProjectWithForms) => void;
  currentUserId: string;
}

const ProjectReviewList: React.FC<ProjectReviewListProps> = ({
  projects,
  onViewProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');

  const getStatusChip = (status: string) => {
    const configs = {
      pending: { color: 'default' as const, label: 'Pending Review' },
      in_review: { color: 'info' as const, label: 'In Review' },
      needs_revision: { color: 'warning' as const, label: 'Needs Revision' },
      approved: { color: 'success' as const, label: 'Approved' },
      rejected: { color: 'error' as const, label: 'Rejected' },
    };

    return (
      <Chip
        size="small"
        color={configs[status as keyof typeof configs]?.color || 'default'}
        label={configs[status as keyof typeof configs]?.label || status}
      />
    );
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.members.some((member) =>
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Project Reviews
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search projects or team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search size={20} className="text-gray-500 mr-2" />
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="pending">Pending Review</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="needs_revision">Needs Revision</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Projects Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Team Members</TableCell>
              <TableCell align="center">Forms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {project.name}
                    <Typography variant="caption" color="text.secondary">
                      ({project.fairType})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Users size={16} />
                    <Typography variant="body2">
                      {project.members
                        .map((m) => `${m.firstName} ${m.lastName}`)
                        .join(', ')}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip
                      size="small"
                      label={`${project.reviewedForms}/${project.totalForms}`}
                      icon={<FileText size={14} />}
                      color={
                        project.reviewedForms === project.totalForms
                          ? 'success'
                          : 'default'
                      }
                    />
                  </Stack>
                </TableCell>
                <TableCell>{getStatusChip(project.status)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => onViewProject(project)}
                    title="Review Project"
                  >
                    <Eye size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectReviewList;
