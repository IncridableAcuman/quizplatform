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

// Tokenni dekod qilish uchun yordamchi funksiya
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

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
          const { accessToken, refreshToken } = response.data;

          // Token ichidan rol va usernameni ajratib olamiz
          const decodedToken = parseJwt(accessToken);
          const roles = decodedToken?.roles || [];
          const isAdmin = roles.includes('ROLE_ADMIN');
          const username = decodedToken?.sub || 'User';

          const user = {
            id: 1,
            username: username,
            email: credentials.username || `${username}@quizplatform.com`, // Login qilganda kiritilgan email yoki default
            role: isAdmin ? ('ADMIN' as const) : ('USER' as const),
          };

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
      // useAuthStore ichiga qo'shimcha action qo'shish:
      fetchUser: async () => {
        try {
          const response = await axiosClient.get<User>('/auth/me'); // yoki profilni oluvchi endpoint
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          get().logout();
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
    },
  )
);
