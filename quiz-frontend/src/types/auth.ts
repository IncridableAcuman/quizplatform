export interface User {
  id?: number;
  username: string;
  email?: string;
  fullName?: string;
  role: 'USER' | 'ADMIN';
  totalScore?: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType?: string;
  id?: number;
  username: string;
  email?: string;
  fullName?: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}
