import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';
import { axiosClient } from '../api/axiosClient';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
          const { accessToken, refreshToken, user } = response.data;

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await axiosClient.post<AuthResponse>('/auth/register', credentials);
          const { accessToken, refreshToken, user } = response.data;

          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        localStorage.removeItem('auth-storage');
      },

      // Tokenlarni yangilash uchun setter
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      // Refresh Token orqali yangi Access Token olish
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return null;
        }

        try {
          const response = await axiosClient.post<{ accessToken: string; refreshToken?: string }>(
            '/auth/refresh-token',
            { refreshToken }
          );

          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken || refreshToken;

          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            isAuthenticated: true,
          });

          return newAccessToken;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // Refresh token ham eskirgan bo'lsa tizimdan chiqarib yuboramiz
          get().logout();
          return null;
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);