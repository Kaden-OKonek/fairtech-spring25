import React, { useState, useEffect } from 'react';
import {
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material';
import { Search, Star, Clock, Award, Eye } from 'lucide-react';
import { Project } from '../../../types/project.types';
import { JudgeAssignmentStatus } from '../../../types/judging.types';
import { judgingService } from '../../../services/judging.service';
import { useAuth } from '../../../contexts/AuthContext';

interface ProjectWithStatus extends Project {
  judgingStatus: JudgeAssignmentStatus | null;
}

interface ProjectScoringListProps {
  onViewProject: (project: Project, isAssigned: boolean) => void;
}

const ProjectScoringList: React.FC<ProjectScoringListProps> = ({
  onViewProject,
}) => {
  const { authStatus } = useAuth();
  const [projects, setProjects] = useState<ProjectWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'assigned' | 'completed' | 'unscored'
  >('all');

  useEffect(() => {
    const loadProjects = async () => {
      if (!authStatus.user?.uid) return;

      try {
        setLoading(true);
        const projectsWithStatus =
          await judgingService.getProjectsWithJudgingStatus(
            authStatus.user.uid
          );
        setProjects(projectsWithStatus);
        setError(null);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [authStatus.user?.uid]);

  // Filter projects based on search term and status filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    switch (statusFilter) {
      case 'assigned':
        return matchesSearch && project.judgingStatus === 'pending';
      case 'completed':
        return matchesSearch && project.judgingStatus === 'completed';
      case 'unscored':
        return matchesSearch && !project.judgingStatus;
      default:
        return matchesSearch;
    }
  });

  const getStatusChip = (status: JudgeAssignmentStatus | null) => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            icon={<Star size={16} />}
            label="Scored"
            color="success"
            size="small"
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<Clock size={16} />}
            label="Assigned"
            color="primary"
            size="small"
          />
        );
      case 'in_progress':
        return (
          <Chip
            icon={<Clock size={16} />}
            label="In Progress"
            color="warning"
            size="small"
          />
        );
      default:
        return (
          <Chip icon={<Award size={16} />} label="Available" size="small" />
        );
    }
  };

  const handleViewProject = (project: ProjectWithStatus) => {
    onViewProject(project, project.judgingStatus === 'pending');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Project Scoring
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <Search size={20} className="mr-2 text-gray-500" />
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
            >
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="assigned">Assigned to Me</MenuItem>
              <MenuItem value="completed">Scored</MenuItem>
              <MenuItem value="unscored">Not Scored</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Projects Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        project.fairType === 'highSchool'
                          ? 'High School'
                          : 'Middle School'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {project.members
                      .map((member) => `${member.firstName} ${member.lastName}`)
                      .join(', ')}
                  </TableCell>
                  <TableCell>{getStatusChip(project.judgingStatus)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      title="View Project"
                      onClick={() => handleViewProject(project)}
                    >
                      <Eye size={18} />
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

export default ProjectScoringList;
