export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profile?: string | Profile; // Puede ser string (nombre) o objeto Profile completo
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
  profileImage?: string; // Ruta de la imagen de perfil
  phone?: string; // Teléfono del usuario
  department?: string; // Departamento
  position?: string; // Cargo/Posición
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