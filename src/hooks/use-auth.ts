import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'vendor' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isConsumer: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
        set({ user });
      },
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },
      isConsumer: () => {
        const state = get();
        return !!state.user && state.user.role === 'consumer';
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => {
        // Initialize state from localStorage on page load
        return (state) => {
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('token');
          if (storedUser && storedToken) {
            state?.setUser(JSON.parse(storedUser));
            state?.setToken(storedToken);
          }
        };
      }
    }
  )
); 