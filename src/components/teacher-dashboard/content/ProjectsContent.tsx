import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  Eye,
  MoreVertical,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { teacherService } from '../../../services/teacher.service';
import { Project } from '../../../types/project.types';

interface ProjectWithDetails extends Project {
  students: {
    firstName: string;
    lastName: string;
    email: string;
  }[];
}

const ProjectsContent: React.FC = () => {
  const { authStatus } = useAuth();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      if (!authStatus.user?.uid) return;

      try {
        setLoading(true);
        const classProjects = await teacherService.getClassProjects(
          authStatus.user.uid
        );

        // Fetch detailed information for each project
        const projectsWithDetails = await Promise.all(
          classProjects.map(async (project) => {
            const fullProject = await teacherService.getProjectWithStudents(
              project.projectId
            );
            return fullProject;
          })
        );

        setProjects(projectsWithDetails);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [authStatus.user?.uid]);

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = project.name.toLowerCase().includes(searchLower);
    const matchesStudents = project.students.some(
      (student) =>
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower)
    );
    return matchesName || matchesStudents;
  });

  type ProjectStatus =
    | 'draft'
    | 'active'
    | 'submitted'
    | 'needs_revision'
    | 'approved'
    | 'rejected';

  const getStatusChip = (status: string) => {
    const configs = {
      draft: { icon: <Clock size={16} />, color: 'default' as const },
      active: { icon: <Clock size={16} />, color: 'primary' as const },
      submitted: { icon: <CheckCircle size={16} />, color: 'success' as const },
      needs_revision: {
        icon: <AlertCircle size={16} />,
        color: 'warning' as const,
      },
      approved: { icon: <CheckCircle size={16} />, color: 'success' as const },
      rejected: { icon: <AlertCircle size={16} />, color: 'error' as const },
    };

    const config = configs[status as ProjectStatus] || configs.draft;
    return (
      <Chip
        size="small"
        icon={config.icon}
        label={status.replace('_', ' ')}
        color={config.color}
      />
    );
  };

  const handleViewDetails = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setDetailsDialogOpen(true);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: ProjectWithDetails
  ) => {
    setSelectedProject(project);
    setMenuAnchorEl(event.currentTarget);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        Class Projects
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search projects or students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ mt: 2 }}
          >
            <Tab label="All Projects" />
            <Tab label="Active" />
            <Tab label="Submitted" />
            <Tab label="Approved" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardContent>
          <List>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ListItem key={project.id} divider>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {project.name}
                        {getStatusChip(project.status)}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Students:{' '}
                          {project.students
                            .map((s) => `${s.firstName} ${s.lastName}`)
                            .join(', ')}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="View Details">
                      <IconButton onClick={() => handleViewDetails(project)}>
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={(e) => handleMenuOpen(e, project)}>
                      <MoreVertical size={18} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlertCircle size={18} />
                      <Typography>No projects found</Typography>
                    </Box>
                  }
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Project Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">{selectedProject.name}</Typography>
                {getStatusChip(selectedProject.status)}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Team Members
                </Typography>
                <List>
                  {selectedProject.students.map((student) => (
                    <ListItem key={student.email}>
                      <ListItemText
                        primary={`${student.firstName} ${student.lastName}`}
                        secondary={student.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Documents & Submissions
              </Typography>
              {/* Add document list here */}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => setMenuAnchorEl(null)}>
          <FileText size={16} style={{ marginRight: 8 }} />
          View Documents
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchorEl(null)}>
          <Users size={16} style={{ marginRight: 8 }} />
          Manage Team
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProjectsContent;
