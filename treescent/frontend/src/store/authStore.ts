import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types/api';
import { api } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const auth = await api.login({ email, password });
          set({ user: auth.user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false, isAuthenticated: false, user: null });
          throw error;
        }
      },

      register: async (email, username, password) => {
        set({ isLoading: true, error: null });
        try {
          const auth = await api.register({ email, username, password });
          set({ user: auth.user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({ error: message, isLoading: false, isAuthenticated: false, user: null });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.logout();
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      refreshUser: async () => {
        if (!api.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const user = await api.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          api.clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },

      initializeAuth: async () => {
        api.loadTokensFromStorage();
        if (api.isAuthenticated()) {
          set({ isLoading: true });
          await get().refreshUser();
          set({ isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'treescent-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);