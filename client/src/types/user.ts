export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profile?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  profileName?: string;
  password?: string;
}

export interface Profile {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  userCount: number;
}

export interface CreateUserData {
  username: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profileName?: string;
  active?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileName?: string;
  active?: boolean;
  password?: string;
} 