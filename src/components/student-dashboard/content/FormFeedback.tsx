import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  Download,
} from 'lucide-react';
import { FormSubmission, ReviewStatus } from '../../../types/forms.types';

interface FormFeedbackProps {
  form: FormSubmission;
}

const FormFeedback: React.FC<FormFeedbackProps> = ({ form }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
      case 'needs_revision':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (
    status: ReviewStatus
  ): 'success' | 'error' | 'warning' | 'info' | 'default' => {
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

  const getStatusLabel = (status: ReviewStatus): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const currentVersion = form.versions[form.currentVersion];

  return (
    <Card className="w-full">
      <CardContent>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <Typography variant="h6">{form.title || form.fileName}</Typography>
          </Box>
          <Box className="flex items-center gap-2">
            <Chip
              icon={getStatusIcon(form.status)}
              label={getStatusLabel(form.status)}
              color={getStatusColor(form.status)}
              size="small"
            />
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              className="ml-2"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box className="mt-4 space-y-4">
            {/* Current Version Info */}
            <Box className="bg-gray-50 p-4 rounded-lg">
              <Typography variant="subtitle2" className="mb-2">
                Current Version ({form.currentVersion + 1})
              </Typography>

              <Box className="flex gap-2 mb-4">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Eye className="w-4 h-4" />}
                  onClick={() => window.open(currentVersion.fileUrl)}
                >
                  View
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download className="w-4 h-4" />}
                  href={currentVersion.fileUrl}
                  download
                >
                  Download
                </Button>
              </Box>

              {/* Reviews */}
              {currentVersion.reviews.length > 0 && (
                <Box className="space-y-3">
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    className="mb-2"
                  >
                    Reviewer Comments
                  </Typography>
                  {currentVersion.reviews.map((review, index) => (
                    <Card key={index} variant="outlined" className="bg-white">
                      <CardContent>
                        <Box className="flex justify-between items-start mb-2">
                          <Typography variant="subtitle2">
                            {review.reviewerName}
                          </Typography>
                          <Chip
                            size="small"
                            label={getStatusLabel(review.status)}
                            color={getStatusColor(review.status)}
                          />
                        </Box>
                        <Typography variant="body2" className="mb-2">
                          {review.comments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.timestamp.toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            {/* Version History */}
            {form.versions.length > 1 && (
              <Box>
                <Typography variant="subtitle2" className="mb-2">
                  Version History
                </Typography>
                <Box className="space-y-2">
                  {form.versions.map(
                    (version, index) =>
                      index !== form.currentVersion && (
                        <Card
                          key={index}
                          variant="outlined"
                          className="bg-gray-50"
                        >
                          <CardContent>
                            <Box className="flex justify-between items-center mb-2">
                              <Typography variant="subtitle2">
                                Version {index + 1}
                              </Typography>
                              <Box className="flex gap-2">
                                <IconButton
                                  size="small"
                                  onClick={() => window.open(version.fileUrl)}
                                >
                                  <Eye className="w-4 h-4" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  href={version.fileUrl}
                                  download
                                >
                                  <Download className="w-4 h-4" />
                                </IconButton>
                              </Box>
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Uploaded on{' '}
                              {version.uploadedAt.toLocaleDateString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      )
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default FormFeedback;
