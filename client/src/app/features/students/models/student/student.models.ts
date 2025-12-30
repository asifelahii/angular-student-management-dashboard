export type StudentStatus = 'Active' | 'Inactive' | 'Graduated';

export type Student = {
  id: number;
  name: string | null;
  email: string;
  phone: string;
  department: string;
  semester: number;
  status: StudentStatus;
  avatarUrl?: string;
};
