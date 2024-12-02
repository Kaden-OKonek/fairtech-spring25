import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  UserPlus,
  Users,
  LogOut,
  Trash2,
  FileText,
  School,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { projectsService } from '../../../services/projects.service';
import { Project, ProjectMember } from '../../../types/project.types';
import CreateProjectDialog from './CreateProjectDialog';
import JoinProjectDialog from './JoinProjectDialog';
import ProjectDocuments from './ProjectDocuments';

const ProjectsContent: React.FC = () => {
  const { authStatus } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
    null
  );

  useEffect(() => {
    const uid = authStatus.user?.uid;
    if (!uid) return;

    setLoading(true);
    // Subscribe to student's project
    const unsubscribe = projectsService.subscribeToStudentProject(
      uid,
      (updatedProject) => {
        setProject(updatedProject);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [authStatus.user?.uid]);

  const handleCreateProject = () => setCreateDialogOpen(true);
  const handleProjectCreated = () => setCreateDialogOpen(false);
  const handleJoinProject = () => setJoinDialogOpen(true);
  const handleViewDocuments = () => setDocumentsDialogOpen(true);

  const handleLeaveProject = async () => {
    if (!project || !authStatus.user?.uid) return;

    try {
      await projectsService.removeMember(project.id, authStatus.user.uid);
      setConfirmLeaveOpen(false);
    } catch (err) {
      setError('Failed to leave project');
    }
  };

  const handleRemoveMember = async () => {
    if (!project || !selectedMember) return;

    try {
      await projectsService.removeMember(project.id, selectedMember.userId);
      setConfirmRemoveOpen(false);
    } catch (err) {
      setError('Failed to remove team member');
    }
  };

  const isProjectCreator = project?.members.some(
    (member) =>
      member.userId === authStatus.user?.uid && member.role === 'creator'
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
        My Project
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!project ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              You're not part of any project yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              Create a new project or join an existing one using a project code.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleCreateProject}
                startIcon={<Users />}
              >
                Create New Project
              </Button>
              <Button
                variant="outlined"
                onClick={handleJoinProject}
                startIcon={<UserPlus />}
              >
                Join Project
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Box>
                <Typography variant="h5">{project.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Code: {project.projectCode}
                </Typography>
              </Box>
              <Chip
                label={
                  project.fairType === 'highSchool'
                    ? 'High School'
                    : 'Middle School'
                }
                icon={<School size={16} />}
                color="primary"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Team Members
            </Typography>
            <List>
              {project.members.map((member) => (
                <ListItem key={member.userId}>
                  <ListItemText
                    primary={`${member.firstName} ${member.lastName}`}
                    secondary={member.email}
                    secondaryTypographyProps={{
                      component: 'div',
                    }}
                  />
                  {member.role === 'creator' && (
                    <Chip
                      size="small"
                      label="Creator"
                      color="primary"
                      sx={{ mr: 6 }}
                    />
                  )}
                  {isProjectCreator &&
                    member.userId !== authStatus.user?.uid && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {
                            setSelectedMember(member);
                            setConfirmRemoveOpen(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Adult Sponsor
              </Typography>
              <Typography>
                {project.adultSponsor.name}
                {project.adultSponsor.isTeacher && (
                  <Chip size="small" label="Teacher" sx={{ ml: 1 }} />
                )}
              </Typography>
              <Typography color="text.secondary">
                {project.adultSponsor.email}
              </Typography>
            </Box>

            <Box
              sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogOut />}
                onClick={() => setConfirmLeaveOpen(true)}
              >
                Leave Project
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileText />}
                onClick={handleViewDocuments}
              >
                Project Documents
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <JoinProjectDialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        onProjectJoined={handleProjectCreated}
      />

      {project && (
        <>
          <ProjectDocuments
            open={documentsDialogOpen}
            onClose={() => setDocumentsDialogOpen(false)}
            projectId={project.id}
            projectName={project.name}
            projectMembers={project.members}
          />

          <Dialog
            open={confirmLeaveOpen}
            onClose={() => setConfirmLeaveOpen(false)}
          >
            <DialogTitle>Leave Project?</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to leave this project?
                {isProjectCreator &&
                  ' As the creator, leaving will delete the project if no other members remain.'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmLeaveOpen(false)}>Cancel</Button>
              <Button
                onClick={handleLeaveProject}
                color="error"
                variant="contained"
              >
                Leave Project
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmRemoveOpen}
            onClose={() => setConfirmRemoveOpen(false)}
          >
            <DialogTitle>Remove Team Member?</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to remove {selectedMember?.firstName}{' '}
                {selectedMember?.lastName} from the project?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmRemoveOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRemoveMember}
                color="error"
                variant="contained"
              >
                Remove Member
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ProjectsContent;
