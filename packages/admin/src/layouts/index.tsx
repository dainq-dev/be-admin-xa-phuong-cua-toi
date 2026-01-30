import type { FC, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useUIStore } from '../stores/ui.store'

import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface RootLayoutProps {
  children?: ReactNode
}

/**
 * Root Layout for Admin Dashboard
 * Contains: Sidebar, Header, Main Content Area
 */
const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  const { sidebarOpen, theme } = useUIStore()
//   const { isAuthenticated, isLoading } = useAuthStore()

  // Show loading spinner while checking auth
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-primary)]">
//         <div className="w-10 h-10 border-3 border-[var(--color-border)] border-t-primary rounded-full animate-spin" />
//         <p className="mt-4 text-[var(--color-text-secondary)]">Loading...</p>
//       </div>
//     )
//   }

  // If not authenticated, render children (login page)
//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
//         {children || <Outlet />}
//       </div>
//     )
//   }

  // Authenticated: render admin layout
  return (
    <div
      className={`flex min-h-screen bg-[#8d99ae] text-[var(--color-text-primary)] ${theme}`}
    >
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-[260px]" : "ml-[70px]"
        }`}
      >
        <Header />
        <main className="flex-1 pb-2 pr-2 overflow-y-hidden h-[calc(100dvh-80px)] bg-[#1b263b]">
          <div className="bg-white rounded-xl h-[calc(100dvh-60px-4px-4px)] text-black p-4">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default RootLayout
