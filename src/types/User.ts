export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  university?: string;
  isVerified?: boolean;
  expertise?: string;
  grade?: string | number;
  profilePhotoUrl?: string;
  downloadRight?: number;
}
