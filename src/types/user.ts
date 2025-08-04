export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isActive: boolean;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}
