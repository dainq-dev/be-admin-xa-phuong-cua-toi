/**
 * UI Store (Zustand)
 * Global UI state (sidebar, modals, notifications, etc.)
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export type UIStore = UIState & UIActions

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
}

/**
 * UI Store
 */
export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      ...initialState,

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      setSidebarOpen: (open) =>
        set({
          sidebarOpen: open,
        }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setTheme: (theme) =>
        set({
          theme,
        }),
    }),
    {
      name: 'UIStore',
    }
  )
)
