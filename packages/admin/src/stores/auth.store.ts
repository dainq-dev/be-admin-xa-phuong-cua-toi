/**
 * Auth Store (Zustand)
 * Global authentication state management
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserResponse } from '@phuong-xa/shared'

interface AuthState {
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: UserResponse | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  reset: () => void
}

export type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

/**
 * Auth Store
 * Persists user data to localStorage
 */
export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          }),

        setLoading: (loading) =>
          set({
            isLoading: loading,
          }),

        logout: () =>
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          }),

        reset: () => set(initialState),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
)
