import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  runTransaction,
} from 'firebase/firestore';
import {
  Project,
  ProjectMember,
  AdultSponsor,
  FairType,
  ProjectStatus,
} from '../types/project.types';
import { TeacherClass } from '../types/teacher.types';

const convertProject = (doc: QueryDocumentSnapshot<DocumentData>): Project => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    fairType: data.fairType,
    projectCode: data.projectCode,
    status: data.status,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    adultSponsor: data.adultSponsor,
    memberIds: data.memberIds,
    members: data.members.map((member: any) => ({
      ...member,
      joinedAt: member.joinedAt.toDate(),
    })),
    maxTeamSize: data.maxTeamSize,
    classId: data.classId,
  };
};

export const projectsService = {
  // Check if a student can create a project
  async canCreateProject(studentId: string): Promise<boolean> {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('memberIds', 'array-contains', studentId),
      where('status', '!=', 'archived')
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  },

  // Create a new project
  async createProject(
    name: string,
    fairType: FairType,
    creator: ProjectMember,
    adultSponsor: AdultSponsor,
    classId?: string
  ): Promise<Project> {
    // Generate unique project code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return Array.from(Array(5))
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join('');
    };

    const isCodeUnique = async (code: string) => {
      const q = query(
        collection(db, 'projects'),
        where('projectCode', '==', code)
      );
      const snapshot = await getDocs(q);
      return snapshot.empty;
    };

    let projectCode;
    do {
      projectCode = generateCode();
    } while (!(await isCodeUnique(projectCode)));

    const timestamp = new Date();
    const projectData = {
      name,
      fairType,
      projectCode,
      status: 'draft' as ProjectStatus,
      createdAt: Timestamp.fromDate(timestamp),
      updatedAt: Timestamp.fromDate(timestamp),
      adultSponsor,
      memberIds: [creator.userId],
      members: [
        {
          ...creator,
          joinedAt: Timestamp.fromDate(timestamp),
        },
      ],
      maxTeamSize: 3,
      ...(classId && { classId }),
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    const project = {
      id: docRef.id,
      ...projectData,
      createdAt: timestamp,
      updatedAt: timestamp,
      members: [
        {
          ...creator,
          joinedAt: timestamp,
        },
      ],
    };

    // If classId is provided, update the class document
    if (classId) {
      await this.updateClassWithProjectAndMember(classId, project, creator);
    }

    return project;
  },

  async updateClassWithProjectAndMember(
    classId: string,
    project: Project,
    member: ProjectMember
  ): Promise<void> {
    const classDocRef = doc(db, 'classes', classId);

    try {
      // Perform a transaction to safely update the class document
      await runTransaction(db, async (transaction) => {
        const classDoc = await transaction.get(classDocRef);

        if (!classDoc.exists()) {
          throw new Error('Class not found');
        }

        const classData = classDoc.data() as TeacherClass;

        // Add project if not already in the class projects
        const projectExists = classData.projects?.some(
          (p) => p.projectId === project.id
        );
        const updatedProjects = projectExists
          ? classData.projects
          : [
              ...(classData.projects || []),
              {
                projectId: project.id,
                projectName: project.name,
                students: [member.userId],
                createdAt: new Date(),
              },
            ];

        // Add student if not already in the class students
        const studentExists = classData.students?.some(
          (s) => s.userId === member.userId
        );
        const updatedStudents = studentExists
          ? classData.students
          : [
              ...(classData.students || []),
              {
                userId: member.userId,
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
              },
            ];

        // Update the class document
        transaction.update(classDocRef, {
          projects: updatedProjects,
          students: updatedStudents,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      });
    } catch (error) {
      console.error('Error updating class document:', error);
      throw error;
    }
  },

  // Get a student's current project
  async getStudentProject(studentId: string): Promise<Project | null> {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('memberIds', 'array-contains', studentId),
      where('status', '!=', 'archived')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;
    return convertProject(snapshot.docs[0]);
  },

  // Join an existing project
  async joinProject(projectCode: string, member: ProjectMember): Promise<void> {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('projectCode', '==', projectCode),
      where('status', '!=', 'archived')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Project not found');
    }

    const projectDoc = snapshot.docs[0];
    const project = convertProject(projectDoc);

    if (project.members.length >= project.maxTeamSize) {
      throw new Error('Project team is full');
    }

    if (project.members.some((m) => m.userId === member.userId)) {
      throw new Error('Already a member of this project');
    }

    const timestamp = new Date();
    await updateDoc(projectDoc.ref, {
      memberIds: [...project.memberIds, member.userId],
      members: [
        ...project.members,
        {
          ...member,
          joinedAt: Timestamp.fromDate(timestamp),
        },
      ],
      updatedAt: Timestamp.fromDate(timestamp),
    });

    // If project has a classId, update the class document
    if (project.classId) {
      await this.updateClassWithProjectAndMember(
        project.classId,
        {
          ...project,
          members: [
            ...project.members,
            {
              ...member,
              joinedAt: timestamp,
            },
          ],
        },
        member
      );
    }
  },

  // Subscribe to all projects
  subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('status', '!=', 'archived'));

    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(convertProject);
      callback(projects);
    });
  },

  // Subscribe to a student's project
  subscribeToStudentProject(
    studentId: string,
    callback: (project: Project | null) => void
  ): () => void {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('memberIds', 'array-contains', studentId),
      where('status', '!=', 'archived')
    );

    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }
      const project = convertProject(snapshot.docs[0]);
      callback(project);
    });
  },

  // Remove a member from a project
  async removeMember(projectId: string, userId: string): Promise<void> {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }

    const project = convertProject(projectDoc);
    const updatedMembers = project.members.filter((m) => m.userId !== userId);
    const updatedMemberIds = project.memberIds.filter((id) => id !== userId);

    // If removing creator, assign creator role to next member if any exist
    if (
      project.members.find((m) => m.userId === userId)?.role === 'creator' &&
      updatedMembers.length > 0
    ) {
      updatedMembers[0].role = 'creator';
    }

    const timestamp = new Date();

    // If no members left, archive the project
    if (updatedMembers.length === 0) {
      await updateDoc(projectRef, {
        status: 'archived',
        updatedAt: Timestamp.fromDate(timestamp),
      });
    } else {
      await updateDoc(projectRef, {
        members: updatedMembers,
        memberIds: updatedMemberIds,
        updatedAt: Timestamp.fromDate(timestamp),
      });
    }
  },

  // Get a specific project
  async getProject(projectId: string): Promise<Project | null> {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) return null;
    return convertProject(projectDoc);
  },

  // Update project status
  async updateProjectStatus(
    projectId: string,
    status: ProjectStatus,
    updatedBy: string,
    comments?: string
  ): Promise<void> {
    const projectRef = doc(db, 'projects', projectId);
    const timestamp = new Date();

    await updateDoc(projectRef, {
      status,
      updatedAt: Timestamp.fromDate(timestamp),
      lastReviewedBy: updatedBy,
      lastReviewedAt: Timestamp.fromDate(timestamp),
      ...(comments && { statusComments: comments }),
    });
  },

  // Check if all forms are reviewed
  async areAllFormsReviewed(projectId: string): Promise<boolean> {
    const formsRef = collection(db, 'forms');
    const q = query(
      formsRef,
      where('projectContext.projectId', '==', projectId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return false;

    return snapshot.docs.every((doc) => {
      const status = doc.data().status;
      return status === 'approved' || status === 'rejected';
    });
  },
};
