export interface Project {
  projectName: string;
  classID: string;
  fairID: string;
  creationDate: Date;
  adultSponsorFirstName: string;
  adultSponsorLastName: string;
  projectStatus?: {
    status: string;
    statusChangeDate: Date;
  };
  projectMembers?: {
    member1: string;
    member2: string;
    member3: string;
  };
}
