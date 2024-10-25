import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ButtonGroup,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import LogoutButton from '../components/LogoutButton';
import { useAuth } from '../contexts/AuthContext';

interface StudentForm {
  id: number;
  studentName: string;
  projectName: string;
  status: 'Viewed' | 'Waiting for Review' | 'Needs SRC Approval';
}

const AdminDashboard: React.FC = () => {
  const { authStatus } = useAuth();
  const userName = authStatus.metadata?.firstName || 'Admin';

  const [forms, setForms] = useState<StudentForm[]>([
    {
      id: 1,
      studentName: 'Smith, Alice',
      projectName: 'Volcano Eruptions',
      status: 'Viewed',
    },
    {
      id: 2,
      studentName: 'Doe, John',
      projectName: 'Solar System Model',
      status: 'Waiting for Review',
    },
    {
      id: 3,
      studentName: 'Johnson, Emily',
      projectName: 'Plant Growth',
      status: 'Needs SRC Approval',
    },
    {
      id: 4,
      studentName: 'Anderson, James',
      projectName: 'Perpetual Motion Machine',
      status: 'Viewed',
    },
    {
      id: 5,
      studentName: 'Maxwell, Sam',
      projectName: 'Rubber Egg',
      status: 'Waiting for Review',
    },
    {
      id: 6,
      studentName: 'Osborn, Emma',
      projectName: 'Mold Growth on Bread',
      status: 'Needs SRC Approval',
    },
    // Add more forms as needed
  ]);

  const [sortOrder, setSortOrder] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sorting functionality
  const sortForms = (order: string) => {
    let sortedForms = [...forms];

    if (order === 'alphabetical-asc') {
      sortedForms.sort((a, b) => a.studentName.localeCompare(b.studentName));
    } else if (order === 'alphabetical-desc') {
      sortedForms.sort((a, b) => b.studentName.localeCompare(a.studentName));
    } else if (order === 'priority-asc') {
      const priorityOrder = {
        'Needs SRC Approval': 1,
        'Waiting for Review': 2,
        Viewed: 3,
      };

      sortedForms.sort((a, b) => {
        const priorityA = priorityOrder[a.status as keyof typeof priorityOrder];
        const priorityB = priorityOrder[b.status as keyof typeof priorityOrder];

        // If priorities are different, sort by priority
        if (priorityA !== priorityB) {
          return order === 'priority-asc'
            ? priorityA - priorityB
            : priorityB - priorityA;
        }

        // If priorities are the same, sort alphabetically
        return a.studentName.localeCompare(b.studentName);
      });
    } else if (order === 'priority-desc') {
      const priorityOrder = {
        'Needs SRC Approval': 1,
        'Waiting for Review': 2,
        Viewed: 3,
      };

      sortedForms.sort((a, b) => {
        const priorityA = priorityOrder[a.status as keyof typeof priorityOrder];
        const priorityB = priorityOrder[b.status as keyof typeof priorityOrder];

        // If priorities are different, sort by priority
        if (priorityA !== priorityB) {
          return order === 'priority-desc'
            ? priorityB - priorityA
            : priorityA - priorityB;
        }

        // If priorities are the same, sort alphabetically
        return a.studentName.localeCompare(b.studentName);
      });
    }

    setForms(sortedForms);
    setSortOrder(order);
  };

  //Filter forms by status
  const filteredForms = forms.filter((form) =>
    statusFilter === 'all' ? true : form.status === statusFilter
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: '20%',
          backgroundColor: '#6a1b9a',
          color: 'white',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Hi {userName}
          </Typography>
          <List>
            <ListItem component="button">
              <ListItemText primary="Fair Information" />
            </ListItem>
            <ListItem component="button">
              <ListItemText primary="Student Forms" />
            </ListItem>
            <ListItem component="button">
              <ListItemText primary="Judges" />
            </ListItem>
            <ListItem component="button">
              <ListItemText primary="Volunteers" />
            </ListItem>
          </List>
        </Box>
        <LogoutButton variant="outlined" color="inherit" />
      </Box>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Forms
        </Typography>

        {/* Filter buttons */}
        <Box sx={{ mb: 3 }}>
          <ButtonGroup variant="contained" sx={{ mb: 2 }}>
            <Button
              onClick={() => setStatusFilter('all')}
              color={statusFilter === 'all' ? 'primary' : 'inherit'}
            >
              All Projects
            </Button>
            <Button
              onClick={() => setStatusFilter('Needs SRC Approval')}
              color={
                statusFilter === 'Needs SRC Approval' ? 'primary' : 'inherit'
              }
            >
              Needs SRC Approval
            </Button>
            <Button
              onClick={() => setStatusFilter('Waiting for Review')}
              color={
                statusFilter === 'Waiting for Review' ? 'primary' : 'inherit'
              }
            >
              Waiting for Review
            </Button>
            <Button
              onClick={() => setStatusFilter('Viewed')}
              color={statusFilter === 'Viewed' ? 'primary' : 'inherit'}
            >
              Viewed
            </Button>
          </ButtonGroup>

          {/* Sort dropdown */}
          <Box sx={{ mb: 2 }}>
            <label htmlFor="sort">Sort by: </label>
            <select
              id="sort"
              value={sortOrder}
              onChange={(e) => sortForms(e.target.value)}
            >
              <option value="">Select</option>
              <option value="alphabetical-asc">Alphabetical (A-Z)</option>
              <option value="alphabetical-desc">Alphabetical (Z-A)</option>
              <option value="priority-asc">Priority (High to Low)</option>
              <option value="priority-desc">Priority (Low to High)</option>
            </select>
          </Box>
        </Box>

        {/* Table of student forms */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '33%', fontWeight: 'bold' }}>
                  Student Name
                </TableCell>
                <TableCell sx={{ width: '33%', fontWeight: 'bold' }}>
                  Project Name
                </TableCell>
                <TableCell sx={{ width: '33%', fontWeight: 'bold' }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell sx={{ width: '33%' }}>
                    {form.studentName}
                  </TableCell>
                  <TableCell sx={{ width: '33%' }}>
                    <Link
                      component="button"
                      onClick={() => {
                        /* Future implementation */
                      }}
                      underline="hover"
                      sx={{ color: 'primary.main' }}
                    >
                      {form.projectName}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ width: '33%' }}>{form.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
