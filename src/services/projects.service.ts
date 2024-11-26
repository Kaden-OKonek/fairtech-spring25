import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import {
  Project,
  ProjectMember,
  AdultSponsor,
  FairType,
  ProjectStatus,
} from '../types/project.types';
import { getAuth } from 'firebase/auth';

// Helper function to generate a unique 5-character alphanumeric code
const generateProjectCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to check if code is unique
const isCodeUnique = async (code: string): Promise<boolean> => {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('projectCode', '==', code));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const projectsService = {
  async getUserType(): Promise<string | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      return userDoc.data()?.userType || null;
    } catch (error) {
      console.error('Error getting user type:', error);
      return null;
    }
  },

  async canCreateProject(userId: string): Promise<boolean> {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('memberIds', 'array-contains', userId),
      where('status', 'in', ['draft', 'active', 'submitted'])
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  },

  async createProject(
    name: string,
    fairType: FairType,
    creator: ProjectMember,
    adultSponsor: AdultSponsor,
    classId?: string
  ): Promise<Project> {
    try {
      let projectCode;
      do {
        projectCode = generateProjectCode();
      } while (!(await isCodeUnique(projectCode)));

      const timestamp = new Date();

      const memberData = {
        userId: creator.userId,
        firstName: creator.firstName,
        lastName: creator.lastName,
        email: creator.email,
        role: creator.role,
        joinedAt: timestamp,
      };

      const baseProjectData = {
        name,
        fairType,
        projectCode,
        status: 'draft' as ProjectStatus,
        createdAt: timestamp,
        updatedAt: timestamp,
        adultSponsor,
        memberIds: [creator.userId],
        members: [memberData],
        maxTeamSize: 3,
      };

      const projectData: Omit<Project, 'id'> = {
        ...baseProjectData,
        ...(classId ? { classId } : {}),
      };

      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: Timestamp.fromDate(timestamp),
        updatedAt: Timestamp.fromDate(timestamp),
      });

      return {
        id: docRef.id,
        ...projectData,
      };
    } catch (error) {
      console.error('Project creation failed:', error);
      throw error;
    }
  },

  async joinProject(
    projectCode: string,
    member: ProjectMember
  ): Promise<Project> {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('projectCode', '==', projectCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Project not found');
      }

      const projectDoc = snapshot.docs[0];
      const project = { id: projectDoc.id, ...projectDoc.data() } as Project;

      if (project.members.length >= project.maxTeamSize) {
        throw new Error('Project team is full');
      }

      if (project.members.some((m) => m.userId === member.userId)) {
        throw new Error('Already a member of this project');
      }

      const timestamp = new Date();
      const memberData = {
        ...member,
        joinedAt: timestamp,
      };

      const updatedMembers = [...project.members, memberData];
      await updateDoc(projectDoc.ref, {
        memberIds: [...project.memberIds, member.userId],
        members: updatedMembers,
        updatedAt: Timestamp.fromDate(timestamp),
      });

      return {
        ...project,
        members: updatedMembers,
        updatedAt: timestamp,
      };
    } catch (error) {
      console.error('Join project failed:', error);
      throw error;
    }
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      const project = { id: projectDoc.id, ...projectDoc.data() } as Project;
      const updatedMembers = project.members.filter((m) => m.userId !== userId);
      const updatedMemberIds = project.memberIds.filter((id) => id !== userId);

      if (
        project.members.find((m) => m.userId === userId)?.role === 'creator' &&
        updatedMembers.length > 0
      ) {
        updatedMembers[0].role = 'creator';
      }

      const timestamp = new Date();

      if (updatedMembers.length === 0) {
        await deleteDoc(projectRef);
      } else {
        await updateDoc(projectRef, {
          members: updatedMembers,
          memberIds: updatedMemberIds,
          updatedAt: Timestamp.fromDate(timestamp),
        });
      }
    } catch (error) {
      console.error('Remove member failed:', error);
      throw error;
    }
  },

  async getProjectById(projectId: string): Promise<Project | null> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        return null;
      }

      const data = projectDoc.data();
      return {
        id: projectDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Project;
    } catch (error) {
      console.error('Get project by ID failed:', error);
      return null;
    }
  },

  async getStudentProject(userId: string): Promise<Project | null> {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('memberIds', 'array-contains', userId),
        where('status', 'in', ['draft', 'active', 'submitted'])
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const projectDoc = snapshot.docs[0];
      const data = projectDoc.data();
      return {
        id: projectDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Project;
    } catch (error) {
      console.error('Get student project failed:', error);
      return null;
    }
  },

  subscribeToStudentProject(
    userId: string,
    callback: (project: Project | null) => void
  ): () => void {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('memberIds', 'array-contains', userId),
      where('status', 'in', ['draft', 'active', 'submitted'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const projectDoc = snapshot.docs[0];
        const projectData = projectDoc.data();

        try {
          const project: Project = {
            id: projectDoc.id,
            name: projectData.name,
            fairType: projectData.fairType,
            projectCode: projectData.projectCode,
            status: projectData.status,
            adultSponsor: projectData.adultSponsor,
            maxTeamSize: projectData.maxTeamSize,
            classId: projectData.classId,
            createdAt: projectData.createdAt.toDate(),
            updatedAt: projectData.updatedAt.toDate(),
            memberIds: projectData.memberIds,
            members: projectData.members,
          };
          callback(project);
        } catch (error) {
          console.error('Error processing project data:', error);
          callback(null);
        }
      },
      (error) => {
        console.error('Subscription error:', error);
        callback(null);
      }
    );

    return unsubscribe;
  },
};
