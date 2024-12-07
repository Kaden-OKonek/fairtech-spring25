import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Award, MessageSquare, Star, ClipboardList } from 'lucide-react';
import { ProjectJudgingData } from '../../../types/judging.types';

interface ProjectScoringProps {
  projectScore: ProjectJudgingData | null;
}

const ProjectScoring: React.FC<ProjectScoringProps> = ({ projectScore }) => {
  // Check if we have any scores
  const hasScores = projectScore?.scores && projectScore.scores.length > 0;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    // Handle both Firestore Timestamp and Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (!projectScore || !hasScores) {
    return (
      <Card className="w-full">
        <CardContent>
          <Box className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-blue-500" />
            <Typography variant="h6">Project Scoring</Typography>
          </Box>
          <Typography color="text.secondary">
            No scores available yet. Judges will provide feedback after
            reviewing your project.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Calculate average score manually to ensure accuracy
  const totalScore = projectScore.scores.reduce(
    (sum, score) => sum + score.score,
    0
  );
  const averageScore = totalScore / projectScore.scores.length;

  // Get all public comments from scores
  const publicComments = projectScore.scores
    .flatMap((score) => score.comments)
    .filter((comment) => comment.visibility === 'public');

  return (
    <Card className="w-full">
      <CardContent>
        <Box className="flex items-center justify-between mb-6">
          <Box className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            <Typography variant="h6">Project Scoring</Typography>
          </Box>
          <Chip
            icon={<Star className="w-4 h-4" />}
            label={`Average Score: ${averageScore.toFixed(1)}`}
            color="primary"
            className="font-medium"
          />
        </Box>

        <Box className="space-y-4">
          <Box className="bg-gray-50 p-4 rounded-lg">
            <Box className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-gray-500" />
              <Typography variant="subtitle2" color="text.secondary">
                Score Breakdown
              </Typography>
            </Box>
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectScore.scores.map((score) => (
                <Card key={score.id} variant="outlined" className="bg-white">
                  <CardContent>
                    <Typography
                      variant="h4"
                      className="text-center mb-2"
                      color="primary"
                    >
                      {score.score}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="block text-center"
                    >
                      {score.judgeName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      className="block text-center"
                    >
                      {formatDate(score.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {publicComments.length > 0 && (
            <Box>
              <Divider className="my-4" />
              <Box className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <Typography variant="subtitle2" color="text.secondary">
                  Judge Feedback
                </Typography>
              </Box>
              <Box className="space-y-3">
                {publicComments.map((comment) => (
                  <Card
                    key={comment.id}
                    variant="outlined"
                    className="bg-gray-50"
                  >
                    <CardContent>
                      <Typography variant="body2" className="mb-2">
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        By: {comment.authorName} •{' '}
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectScoring;
