import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* PDF Controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 1,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <IconButton size="small">
          <ZoomOut />
        </IconButton>
        <IconButton size="small">
          <ZoomIn />
        </IconButton>
        <IconButton size="small">
          <NavigateBefore />
        </IconButton>
        <IconButton size="small">
          <NavigateNext />
        </IconButton>
      </Box>

      {/* PDF Content */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <iframe
          src={`${fileUrl}#toolbar=0`}
          width="100%"
          height="100%"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Error loading PDF');
          }}
          style={{ border: 'none' }}
        />
      </Box>
    </Paper>
  );
};

export default PdfViewer;
