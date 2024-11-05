export interface Project {
  id: string;
  fairID: string;
  classID: string;
  name: string;
  score: number;
  createdDate: Date;
  projectStatus?: {
    status: string;
    statusChangeDate: Date;
  };
}
