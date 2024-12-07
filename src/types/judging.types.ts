export type JudgeAssignmentStatus = 'pending' | 'in_progress' | 'completed';
export type CommentVisibility = 'public' | 'judges_only' | 'admin_only';

// Base interface for comments that can be used across the system
export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  visibility: CommentVisibility;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string; // For threaded comments if needed
}

// Project score from a judge
export interface ProjectScore {
  id: string;
  projectId: string;
  judgeId: string;
  judgeName: string;
  score: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  isAssigned: boolean; // Whether this was an assigned evaluation
  status: JudgeAssignmentStatus;
  comments: Comment[];
}

// Judge's assignment to a project
export interface JudgeAssignment {
  id: string;
  projectId: string;
  judgeId: string;
  assignedAt: Date;
  assignedBy: string; // Admin who made the assignment
  status: JudgeAssignmentStatus;
  dueDate?: Date;
  priority?: number; // For ordering assignments
}

// Extended project interface to include judging data
export interface ProjectJudgingData {
  projectId: string;
  totalScores: number;
  averageScore: number;
  scores: ProjectScore[];
  assignments: JudgeAssignment[];
}

// Aggregate judging stats for dashboard
export interface JudgingStats {
  totalAssigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  averageScore: number;
}
