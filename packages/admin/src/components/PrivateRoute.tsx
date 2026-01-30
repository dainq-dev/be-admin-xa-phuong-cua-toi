/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

interface PrivateRouteProps {
  children: React.ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Đang tải...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />
  }

  return <>{children}</>
}
