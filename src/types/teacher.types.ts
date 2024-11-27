export type TeacherStatus = 'active' | 'inactive' | 'suspended';

export interface TeacherClass {
  id: string;
  teacherId: string;
  classCode: string; // Unique class code
  students: StudentInClass[];
  projects: ProjectInClass[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentInClass {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: Date;
  grade: number;
}

export interface ProjectInClass {
  projectId: string;
  projectName: string;
  students: string[]; // Array of student IDs
  createdAt: Date;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  classCode: string; // Unique class code assigned at registration
  department?: string;
  phone: string;
  status: TeacherStatus;
  registrationDate: Date;
  updatedAt: Date;
}

export interface TeacherDashboardStats {
  totalStudents: number;
  totalProjects: number;
  activeProjects: number;
  submittedProjects: number;
}

export type TeacherContentType = 'class' | 'projects' | 'profile' | 'settings';
