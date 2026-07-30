import type { AuthResponse } from '../../types';
import { axiosClient } from '../axiosClient';

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { username: string; email: string; password: string; fullName?: string }) => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
};