export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  university?: string;
  isVerified?: boolean;
  expertise?: string;
  grade?: string | number;
  profilePhotoUrl?: string;
  downloadRight?: number;
}
