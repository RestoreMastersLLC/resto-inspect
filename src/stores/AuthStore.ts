import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginForm } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginForm) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would call your authentication API
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
          }

          const userData = await response.json();
          
          set({
            user: userData.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would integrate with Google OAuth
          // For demo purposes, we'll simulate a successful login
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: 'google-user-123',
            email: 'user@gmail.com',
            name: 'Google User',
            role: 'inspector',
            avatar: 'https://via.placeholder.com/100x100?text=GU'
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Google login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      loginAsGuest: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const guestUser: User = {
            id: 'guest-user',
            email: 'guest@example.com',
            name: 'Guest User',
            role: 'guest',
          };

          set({
            user: guestUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Guest login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear auth data
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });

        // In a real app, you might want to call the logout API
        fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
      },

      refreshSession: async () => {
        const { user } = get();
        if (!user) return;

        try {
          // In a real app, this would refresh the user session
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();
            set({ user: userData.user });
          } else {
            // Session expired, logout
            get().logout();
          }
        } catch (error) {
          console.error('Session refresh failed:', error);
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates }
          });
        }
      },
    }),
    {
      name: 'restoInspect-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore; 