/**
 * Auth Events (Optional)
 * Event tracking and logging for authentication actions
 */

export const AuthEventType = {
  OTP_REQUESTED: 'auth.otp_requested',
  OTP_VERIFIED: 'auth.otp_verified',
  LOGIN_SUCCESS: 'auth.login_success',
  LOGIN_FAILED: 'auth.login_failed',
  LOGOUT: 'auth.logout',
  TOKEN_REFRESHED: 'auth.token_refreshed',
  TOKEN_REFRESH_FAILED: 'auth.token_refresh_failed',
} as const

export type AuthEventType = typeof AuthEventType[keyof typeof AuthEventType]

export interface AuthEvent {
  type: AuthEventType
  timestamp: Date
  payload?: Record<string, any>
}

/**
 * Event Store for Auth domain
 * Can be used for analytics, debugging, or audit logs
 */
class AuthEventStore {
  private events: AuthEvent[] = []
  private maxEvents = 100 // Keep last 100 events

  /**
   * Track an auth event
   */
  track(type: AuthEventType, payload?: Record<string, any>) {
    const event: AuthEvent = {
      type,
      timestamp: new Date(),
      payload,
    }

    this.events.push(event)

    // Limit event history
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[AuthEvent]', type, payload)
    }

    // TODO: Send to analytics service in production
  }

  /**
   * Get all events
   */
  getEvents(): AuthEvent[] {
    return [...this.events]
  }

  /**
   * Get events by type
   */
  getEventsByType(type: AuthEventType): AuthEvent[] {
    return this.events.filter((e) => e.type === type)
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = []
  }
}

export const authEventStore = new AuthEventStore()
