import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import {
  ProjectScore,
  Comment,
  JudgeAssignment,
  ProjectJudgingData,
  JudgingStats,
  JudgeAssignmentStatus,
} from '../types/judging.types';
import { Project } from '../types/project.types';

export const judgingService = {
  // Get all available projects that can be judged
  subscribeToAvailableProjects(callback: (projects: Project[]) => void) {
    const projectsRef = collection(db, 'projects');
    // Query for projects that are in a judgeable state
    const q = query(
      projectsRef,
      where('status', 'in', ['submitted', 'approved']),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Project[];

      callback(projects);
    });
  },

  // Get all projects with their judging status for a specific judge
  async getProjectsWithJudgingStatus(
    judgeId: string
  ): Promise<Array<Project & { judgingStatus: JudgeAssignmentStatus | null }>> {
    // First get all available projects
    const projectsRef = collection(db, 'projects');
    const projectsQuery = query(
      projectsRef,
      where('status', 'in', ['submitted', 'approved', 'draft'])
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Project[];

    // Get all scores by this judge
    const scoresRef = collection(db, 'projectScores');
    const scoresQuery = query(scoresRef, where('judgeId', '==', judgeId));
    const scoresSnapshot = await getDocs(scoresQuery);
    const scores = new Map(
      scoresSnapshot.docs.map((doc) => [
        doc.data().projectId,
        doc.data().status,
      ])
    );

    // Get all assignments for this judge
    const assignmentsRef = collection(db, 'judgeAssignments');
    const assignmentsQuery = query(
      assignmentsRef,
      where('judgeId', '==', judgeId)
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    const assignments = new Map(
      assignmentsSnapshot.docs.map((doc) => [
        doc.data().projectId,
        doc.data().status,
      ])
    );

    // Combine projects with their judging status
    return projects.map((project) => ({
      ...project,
      judgingStatus:
        scores.get(project.id) || assignments.get(project.id) || null,
    }));
  },

  // Subscribe to a judge's assigned projects
  subscribeToJudgeAssignments(
    judgeId: string,
    callback: (assignments: JudgeAssignment[]) => void
  ) {
    const assignmentsRef = collection(db, 'judgeAssignments');
    const q = query(
      assignmentsRef,
      where('judgeId', '==', judgeId),
      orderBy('assignedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const assignments = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            assignedAt: doc.data().assignedAt.toDate(),
            dueDate: doc.data().dueDate?.toDate(),
          }) as JudgeAssignment
      );

      callback(assignments);
    });
  },

  // Subscribe to project scores and comments
  subscribeToProjectScores(
    projectId: string,
    callback: (data: ProjectJudgingData) => void
  ) {
    const scoresRef = collection(db, 'projectScores');
    const q = query(
      scoresRef,
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const scores = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          }) as ProjectScore
      );

      // Calculate aggregate data
      const totalScores = scores.length;
      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score.score, 0) / totalScores
          : 0;

      // Get assignments for this project
      const assignmentsRef = collection(db, 'judgeAssignments');
      const assignmentsQuery = query(
        assignmentsRef,
        where('projectId', '==', projectId)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignments = assignmentsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            assignedAt: doc.data().assignedAt.toDate(),
            dueDate: doc.data().dueDate?.toDate(),
          }) as JudgeAssignment
      );

      callback({
        projectId,
        totalScores,
        averageScore,
        scores,
        assignments,
      });
    });
  },

  // Submit a new score or update existing
  async submitProjectScore(
    projectId: string,
    judgeId: string,
    judgeName: string,
    score: number,
    comments: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>[],
    isAssigned: boolean = false
  ): Promise<void> {
    const scoresRef = collection(db, 'projectScores');
    const existingScoreQuery = query(
      scoresRef,
      where('projectId', '==', projectId),
      where('judgeId', '==', judgeId)
    );
    const existingScoreSnapshot = await getDocs(existingScoreQuery);

    const timestamp = new Date();
    const commentData = comments.map((comment) => ({
      ...comment,
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    if (existingScoreSnapshot.empty) {
      // Create new score
      await addDoc(scoresRef, {
        projectId,
        judgeId,
        judgeName,
        score,
        comments: commentData,
        isAssigned,
        status: 'completed',
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
      });
    } else {
      // Update existing score
      const scoreDoc = existingScoreSnapshot.docs[0];
      const existingComments = scoreDoc.data().comments || [];

      await updateDoc(scoreDoc.ref, {
        score,
        comments: [...existingComments, ...commentData],
        status: 'completed',
        updatedAt: Timestamp.fromDate(timestamp),
      });
    }

    // If this was an assigned project, update the assignment status
    if (isAssigned) {
      const assignmentsRef = collection(db, 'judgeAssignments');
      const assignmentQuery = query(
        assignmentsRef,
        where('projectId', '==', projectId),
        where('judgeId', '==', judgeId)
      );
      const assignmentSnapshot = await getDocs(assignmentQuery);

      if (!assignmentSnapshot.empty) {
        await updateDoc(assignmentSnapshot.docs[0].ref, {
          status: 'completed',
          updatedAt: Timestamp.fromDate(timestamp),
        });
      }
    }
  },

  // Add a comment to an existing score
  async addComment(
    scoreId: string,
    comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const scoreRef = doc(db, 'projectScores', scoreId);
    const scoreDoc = await getDoc(scoreRef);

    if (!scoreDoc.exists()) {
      throw new Error('Score not found');
    }

    const timestamp = new Date();
    const newComment = {
      ...comment,
      id: crypto.randomUUID(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const existingComments = scoreDoc.data().comments || [];
    await updateDoc(scoreRef, {
      comments: [...existingComments, newComment],
      updatedAt: Timestamp.fromDate(timestamp),
    });
  },

  // Get a specific project score for a judge
  async getProjectScore(
    projectId: string,
    judgeId: string
  ): Promise<ProjectScore | undefined> {
    const scoresRef = collection(db, 'projectScores');
    const q = query(
      scoresRef,
      where('projectId', '==', projectId),
      where('judgeId', '==', judgeId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return undefined;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as ProjectScore;
  },

  // Get judging statistics for a judge
  async getJudgeStats(judgeId: string): Promise<JudgingStats> {
    const assignmentsRef = collection(db, 'judgeAssignments');
    const assignmentsQuery = query(
      assignmentsRef,
      where('judgeId', '==', judgeId)
    );
    const assignmentsSnapshot = await getDocs(assignmentsQuery);

    const scoresRef = collection(db, 'projectScores');
    const scoresQuery = query(scoresRef, where('judgeId', '==', judgeId));
    const scoresSnapshot = await getDocs(scoresQuery);

    const scores = scoresSnapshot.docs.map((doc) => doc.data() as ProjectScore);

    return {
      totalAssigned: assignmentsSnapshot.size,
      completed: assignmentsSnapshot.docs.filter(
        (doc) => doc.data().status === 'completed'
      ).length,
      inProgress: assignmentsSnapshot.docs.filter(
        (doc) => doc.data().status === 'in_progress'
      ).length,
      pending: assignmentsSnapshot.docs.filter(
        (doc) => doc.data().status === 'pending'
      ).length,
      averageScore:
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length
          : 0,
    };
  },
};
