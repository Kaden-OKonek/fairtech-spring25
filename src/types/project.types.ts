export type FairType = 'highSchool' | 'middleSchool';
export type ProjectStatus =
  | 'draft'
  | 'active'
  | 'submitted'
  | 'archived'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_review'
  | 'needs_revision';

export interface AdultSponsor {
  name: string;
  email: string;
  isTeacher: boolean;
  teacherId?: string; // If the sponsor is a teacher
}

export interface ProjectMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: Date;
  role: 'creator' | 'member';
}

export interface Project {
  id: string;
  name: string;
  fairType: FairType;
  projectCode: string; // 5 character alphanumeric code
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  adultSponsor: AdultSponsor;
  memberIds: string[];
  members: ProjectMember[];
  classId?: string; // Optional class association
  maxTeamSize: number; // Configurable team size limit (default: 3)
}

// For tracking student's project association
export interface StudentProjectAssociation {
  userId: string;
  projectId: string;
  role: 'creator' | 'member';
  joinedAt: Date;
}
