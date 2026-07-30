export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string; // passwordHash o'rniga password ishlatiladi
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}