/**
 * Auth Module Entry Point
 * Register dependencies and export public API
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { UserRepository } from './repositories/user.repository'
import { SessionRepository } from './repositories/session.repository'

// Services
import { JWTService } from './services/jwt.service'
import { OTPService } from './services/otp.service'
import { SessionService } from './services/session.service'
import { AuthService } from './services/auth.service'

// Controllers
import { AuthController } from './controllers/auth.controller'

// Routes
import authRoutes from './auth.routes'

/**
 * Register all Auth module dependencies
 */
export function registerAuthModule(): void {
  // Register repositories
  container.register(
    UserRepository,
    () => new UserRepository(prisma),
    true
  )
  container.register(
    SessionRepository,
    () => new SessionRepository(prisma),
    true
  )

  // Register services
  container.register(JWTService, () => new JWTService(), true)
  container.register(OTPService, () => new OTPService(), true)
  container.register(
    SessionService,
    () => new SessionService(container.resolve(SessionRepository)),
    true
  )
  container.register(
    AuthService,
    () =>
      new AuthService(
        prisma,
        container.resolve(UserRepository),
        container.resolve(SessionRepository),
        container.resolve(JWTService),
        container.resolve(OTPService),
        container.resolve(SessionService)
      ),
    true
  )

  // Register controllers
  container.register(
    AuthController,
    () => new AuthController(container.resolve(AuthService)),
    true
  )
}

// Export routes
export { authRoutes }

// Export types for external use
export type {
  LoginResponse,
  UserResponse,
  TokenPair,
  OTPRequestResponse,
} from './models/types'
