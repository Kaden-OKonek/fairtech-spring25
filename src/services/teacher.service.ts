import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import {
  Teacher,
  TeacherClass,
  StudentInClass,
  TeacherDashboardStats,
  ProjectInClass,
} from '../types/teacher.types';

// Helper function to generate a unique class code
const generateClassCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to check if code is unique
const isCodeUnique = async (code: string): Promise<boolean> => {
  const teachersRef = collection(db, 'users');
  const q = query(
    teachersRef,
    where('userType', '==', 'teacher'),
    where('classCode', '==', code)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const teacherService = {
  // Generate a unique class code for a new teacher
  async generateUniqueClassCode(): Promise<string> {
    let code;
    do {
      code = generateClassCode();
    } while (!(await isCodeUnique(code)));
    return code;
  },

  // Initialize a new class for a teacher
  async initializeClass(teacherId: string, classCode: string): Promise<void> {
    const timestamp = new Date();
    const classData: TeacherClass = {
      id: teacherId,
      teacherId: teacherId,
      classCode: classCode,
      students: [],
      projects: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDoc(doc(db, 'classes', teacherId), {
      ...classData,
      createdAt: Timestamp.fromDate(timestamp),
      updatedAt: Timestamp.fromDate(timestamp),
    });
  },

  // Get teacher by class code
  async getTeacherByClassCode(classCode: string): Promise<Teacher | null> {
    const teachersRef = collection(db, 'users');
    const q = query(
      teachersRef,
      where('userType', '==', 'teacher'),
      where('classCode', '==', classCode.toUpperCase()),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const teacherDoc = snapshot.docs[0];
    return {
      id: teacherDoc.id,
      ...teacherDoc.data(),
      registrationDate: teacherDoc.data().registrationCompletedAt.toDate(),
      updatedAt: teacherDoc.data().updatedAt.toDate(),
    } as Teacher;
  },

  // Get teacher's class information
  async getTeacherClass(teacherId: string): Promise<TeacherClass | null> {
    const classRef = doc(db, 'classes', teacherId);
    const classDoc = await getDoc(classRef);

    if (!classDoc.exists()) {
      return null;
    }

    return {
      id: classDoc.id,
      ...classDoc.data(),
      createdAt: classDoc.data().createdAt.toDate(),
      updatedAt: classDoc.data().updatedAt.toDate(),
    } as TeacherClass;
  },

  // Get teacher's dashboard statistics
  async getTeacherStats(teacherId: string): Promise<TeacherDashboardStats> {
    const classRef = doc(db, 'classes', teacherId);
    const classDoc = await getDoc(classRef);
    const classData = classDoc.data() as TeacherClass;

    if (!classDoc.exists()) {
      return {
        totalStudents: 0,
        totalProjects: 0,
        activeProjects: 0,
        submittedProjects: 0,
      };
    }

    // Get project statuses
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('classId', '==', teacherId));
    const projectsSnapshot = await getDocs(q);

    const projects = projectsSnapshot.docs.map((doc) => doc.data());
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const submittedProjects = projects.filter(
      (p) => p.status === 'submitted'
    ).length;

    return {
      totalStudents: classData.students.length,
      totalProjects: projects.length,
      activeProjects,
      submittedProjects,
    };
  },

  // Add student to class
  async addStudentToClass(
    teacherId: string,
    student: StudentInClass
  ): Promise<void> {
    const classRef = doc(db, 'classes', teacherId);
    await updateDoc(classRef, {
      students: arrayUnion(student),
      updatedAt: Timestamp.now(),
    });
  },

  // Remove student from class
  async removeStudentFromClass(
    teacherId: string,
    studentId: string
  ): Promise<void> {
    const classRef = doc(db, 'classes', teacherId);
    const classDoc = await getDoc(classRef);
    const classData = classDoc.data() as TeacherClass;

    const updatedStudents = classData.students.filter(
      (student) => student.userId !== studentId
    );

    await updateDoc(classRef, {
      students: updatedStudents,
      updatedAt: Timestamp.now(),
    });
  },

  // Add project to class
  async addProjectToClass(
    teacherId: string,
    projectId: string,
    projectName: string,
    studentIds: string[]
  ): Promise<void> {
    const classRef = doc(db, 'classes', teacherId);
    await updateDoc(classRef, {
      projects: arrayUnion({
        projectId,
        projectName,
        students: studentIds,
        createdAt: Timestamp.now(),
      }),
      updatedAt: Timestamp.now(),
    });
  },

  // Remove project from class
  async removeProjectFromClass(
    teacherId: string,
    projectId: string
  ): Promise<void> {
    const classRef = doc(db, 'classes', teacherId);
    const classDoc = await getDoc(classRef);
    const classData = classDoc.data() as TeacherClass;

    const updatedProjects = classData.projects.filter(
      (project) => project.projectId !== projectId
    );

    await updateDoc(classRef, {
      projects: updatedProjects,
      updatedAt: Timestamp.now(),
    });
  },

  // Get all students in class
  async getClassStudents(teacherId: string): Promise<StudentInClass[]> {
    const classDoc = await this.getTeacherClass(teacherId);
    return classDoc?.students || [];
  },

  // Get all projects in class
  async getClassProjects(teacherId: string): Promise<ProjectInClass[]> {
    const classDoc = await this.getTeacherClass(teacherId);
    return classDoc?.projects || [];
  },

  // Get project with detailed student information
  async getProjectWithStudents(projectId: string): Promise<any> {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return null;
    }

    const projectData = projectDoc.data();

    // Get detailed student information for each team member
    const studentPromises = projectData.members.map(async (member: any) => {
      const studentRef = doc(db, 'users', member.userId);
      const studentDoc = await getDoc(studentRef);
      return studentDoc.data();
    });

    const students = await Promise.all(studentPromises);

    return {
      ...projectData,
      id: projectDoc.id,
      students,
    };
  },
};
