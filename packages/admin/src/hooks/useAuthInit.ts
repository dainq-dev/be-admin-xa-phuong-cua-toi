/**
 * Auth Initialization Hook
 * Checks for existing tokens and validates them on app mount
 */

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { TokenStorage } from '@/utils/token'
import { AuthAPI } from '@/api/auth.api'

export function useAuthInit() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = TokenStorage.getAccessToken()
      
      // No token = not authenticated
      if (!accessToken) {
        setLoading(false)
        return
      }

      // Token exists - verify it's valid by fetching current user
      try {
        const user = await AuthAPI.getProfile()
        setUser(user)
      } catch (error) {
        // Token invalid - clear it
        console.error('Auth initialization failed:', error)
        TokenStorage.clearTokens()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [setUser, setLoading])
}
