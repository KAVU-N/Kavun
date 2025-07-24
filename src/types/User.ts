export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'instructor' | 'admin';
  university?: string;
  isVerified?: boolean;
  expertise?: string;
  grade?: string | number;
  profilePhotoUrl?: string;
  downloadRight?: number;
}
