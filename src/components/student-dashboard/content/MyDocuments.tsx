import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  ButtonGroup,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  QuerySnapshot,
  FirestoreError,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { UserState } from '../../../types/auth.types';

interface Document {
  id: string;
  fileName: string;
  status: string;
  lastUpdated: string;
  fileUrl: string;
  studentId: string;
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('lastUpdated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const { authStatus } = useAuth();

  useEffect(() => {
    let unsubscribe: () => void;

    const setupDocumentsListener = async () => {
      try {
        // Check auth states
        if (authStatus.state === UserState.UNAUTHENTICATED) {
          setError('Please log in to view your documents');
          setLoading(false);
          return;
        }

        if (authStatus.state === UserState.UNVERIFIED) {
          setError('Please verify your email to access documents');
          setLoading(false);
          return;
        }

        if (
          authStatus.state === UserState.UNREGISTERED ||
          authStatus.state === UserState.INCOMPLETE
        ) {
          setError('Please complete your registration to access documents');
          setLoading(false);
          return;
        }

        if (!authStatus.user?.uid) {
          setError('Unable to load user information');
          setLoading(false);
          return;
        }

        console.log(
          'Setting up documents listener for user:',
          authStatus.user.uid
        );
        console.log('Current sort field:', sortField);
        console.log('Current sort direction:', sortDirection);

        // Create query with filters
        const formsRef = collection(db, 'forms');
        const q = query(
          formsRef,
          where('studentId', '==', authStatus.user.uid),
          orderBy(sortField, sortDirection)
        );

        // Set up real-time listener
        unsubscribe = onSnapshot(
          q,
          (snapshot: QuerySnapshot) => {
            console.log(
              'Received Firestore snapshot:',
              snapshot.size,
              'documents'
            );
            const docs = snapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                  lastUpdated: doc.data().lastUpdated?.toDate() || new Date(), // Convert Firestore timestamp to Date
                }) as Document
            );
            console.log('Processed documents:', docs);
            setDocuments(docs);
            setLoading(false);
            setError(null);
          },
          (error: FirestoreError) => {
            console.error('Detailed Firestore error:', {
              code: error.code,
              message: error.message,
              stack: error.stack,
            });
            setError(`Failed to load documents: ${error.message}`);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error in setupDocumentsListener:', error);
        setError(
          'An unexpected error occurred while setting up the documents listener'
        );
        setLoading(false);
      }
    };

    setupDocumentsListener();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up documents listener');
        unsubscribe();
      }
    };
  }, [authStatus, sortField, sortDirection]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  // Filter and search documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.status.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Show loading state while auth status is being determined
  if (authStatus.isLoading || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography>Loading documents...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Check if user has appropriate role
  if (authStatus.role !== 'student') {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          This page is only accessible to students. Please contact support if
          you believe this is an error.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Documents
      </Typography>

      {/* Debug Info - Remove in production */}
      <Box sx={{ mb: 2 }}>
        <Alert severity="info">
          User ID: {authStatus.user?.uid}
          <br />
          Role: {authStatus.role}
          <br />
          Auth State: {authStatus.state}
        </Alert>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search Documents"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
      </Box>

      {filteredDocuments.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No documents found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleSort('fileName')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Document Name
                    {sortField === 'fileName' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUpward />
                      ) : (
                        <ArrowDownward />
                      ))}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Status
                    {sortField === 'status' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUpward />
                      ) : (
                        <ArrowDownward />
                      ))}
                  </Box>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => handleSort('lastUpdated')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Last Updated
                    {sortField === 'lastUpdated' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUpward />
                      ) : (
                        <ArrowDownward />
                      ))}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor:
                          doc.status === 'approved'
                            ? 'success.light'
                            : doc.status === 'rejected'
                              ? 'error.light'
                              : 'warning.light',
                        color:
                          doc.status === 'approved'
                            ? 'success.dark'
                            : doc.status === 'rejected'
                              ? 'error.dark'
                              : 'warning.dark',
                      }}
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(doc.lastUpdated)}</TableCell>
                  <TableCell>
                    <ButtonGroup variant="text" size="small">
                      <Button
                        component={Link}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </Button>
                      {doc.status === 'pending' && (
                        <Button
                          onClick={() => {
                            /* Add document withdraw logic */
                          }}
                          color="error"
                        >
                          Withdraw
                        </Button>
                      )}
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DocumentsPage;
