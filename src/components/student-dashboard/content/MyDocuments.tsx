// This component is now deprecated - its functionality has been merged into PaperworkContent
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Alert } from '@mui/material';

const DocumentsPage: React.FC = () => {
  return (
    <div>
      <Alert severity="info">
        The documents section has been updated. You will be redirected to the
        new forms interface.
      </Alert>
      <Navigate to="/student-dashboard/paperwork" replace />
    </div>
  );
};

export default DocumentsPage;
