/**
 * Auth ViewModel
 * Manages reactive state, computed properties, and event handlers for Auth domain
 */

import { create } from 'zustand'
import { AuthModel } from '../models/auth.model'
import { AuthController } from '../controllers/auth.controller'
import { useAuthStore } from '@/stores/auth.store'

interface AuthViewState {
  // Login form state
  email: string
  otp: string

  // UI state
  isLoading: boolean
  isOTPSent: boolean
  error: string | null
  otpCountdown: number

  // Validation errors
  emailError: string | null
  otpError: string | null
}

interface AuthViewActions {
  // Form actions
  setEmail: (email: string) => void
  setOTP: (otp: string) => void
  resetForm: () => void

  // Business actions
  requestOTP: () => Promise<void>
  verifyOTPAndLogin: () => Promise<void>
  logout: () => Promise<void>

  // UI actions
  clearError: () => void
  setError: (error: string) => void
  startOTPCountdown: () => void
}

export type AuthViewModel = AuthViewState & AuthViewActions

const initialState: AuthViewState = {
  email: '',
  otp: '',
  isLoading: false,
  isOTPSent: false,
  error: null,
  otpCountdown: 0,
  emailError: null,
  otpError: null,
}

/**
 * Auth ViewModel Store
 */
export const useAuthViewModel = create<AuthViewModel>((set, get) => ({
  ...initialState,

  // Form setters
  setEmail: (email) => {
    const validation = AuthModel.validateEmail(email)
    set({
      email,
      emailError: validation.valid ? null : validation.error,
    })
  },

  setOTP: (otp) => {
    const validation = AuthModel.validateOTP(otp)
    set({
      otp,
      otpError: validation.valid ? null : validation.error,
    })
  },

  resetForm: () => set(initialState),

  // Business logic
  requestOTP: async () => {
    const { email } = get()

    // Validate email
    const validation = AuthModel.validateEmail(email)
    if (!validation.valid) {
      set({ emailError: validation.error })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const controller = new AuthController()
      await controller.requestOTP({ email })

      set({
        isOTPSent: true,
        isLoading: false,
        otpCountdown: 60,
      })

      // Start countdown
      get().startOTPCountdown()
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Gửi OTP thất bại',
      })
    }
  },

  verifyOTPAndLogin: async () => {
    const { email, otp } = get()

    // Validate
    const emailValidation = AuthModel.validateEmail(email)
    const otpValidation = AuthModel.validateOTP(otp)

    if (!emailValidation.valid || !otpValidation.valid) {
      set({
        emailError: emailValidation.error,
        otpError: otpValidation.error,
      })
      return
    }

    set({ isLoading: true, error: null })

    try {
      const controller = new AuthController()
      const response = await controller.verifyOTPAndLogin({ email, otp })

      // Update global auth store
      useAuthStore.getState().setUser(response.user)

      set({
        isLoading: false,
        error: null,
      })

      // Reset form
      get().resetForm()
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
      })
    }
  },

  logout: async () => {
    try {
      const controller = new AuthController()
      await controller.logout()

      // Clear global auth store
      useAuthStore.getState().logout()

      // Reset form
      get().resetForm()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  },

  // UI helpers
  clearError: () => set({ error: null }),

  setError: (error) => set({ error }),

  startOTPCountdown: () => {
    const interval = setInterval(() => {
      const { otpCountdown } = get()

      if (otpCountdown <= 0) {
        clearInterval(interval)
        return
      }

      set({ otpCountdown: otpCountdown - 1 })
    }, 1000)
  },
}))
