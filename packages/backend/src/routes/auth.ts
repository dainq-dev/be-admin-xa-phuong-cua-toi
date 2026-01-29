/**
 * Authentication Routes
 * Zalo OAuth + Email OTP
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { generateTokenPair, verifyRefreshToken } from '../lib/jwt'
import { sendOTPEmail } from '../lib/email'
import { generateOTP, storeOTP, verifyOTP, hasOTP, getOTPTTL } from '../utils/otp'
import {
  loginZaloSchema,
  loginAdminSchema,
  verifyOTPSchema,
  refreshTokenSchema,
  validateBody,
} from '../utils/validators'
import { requireAuth } from '../middleware/auth'

const auth = new Hono()

// ============================================
// ZALO OAUTH LOGIN (Mini App Users)
// ============================================

auth.post('/zalo/login', async (c) => {
  const body = await validateBody(await c.req.json(), loginZaloSchema)

  // TODO: Verify Zalo access token with Zalo API
  // For now, trust the client

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { zaloId: body.zaloId },
  })

  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        zaloId: body.zaloId,
        name: body.name,
        avatarUrl: body.avatar,
        phoneNumber: body.phoneNumber,
        role: 'citizen',
      },
    })

    // Create default settings
    await prisma.userSettings.create({
      data: { userId: user.id },
    })
  } else if (!user.isActive || user.deletedAt) {
    return c.json({ error: 'Account is inactive or deleted' }, 403)
  }

  // Generate tokens
  const tokens = await generateTokenPair({
    userId: user.id,
    zaloId: user.zaloId!,
    role: user.role,
    wardId: user.wardId || undefined,
  })

  // Save session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      deviceInfo: {
        userAgent: c.req.header('user-agent'),
      },
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      wardId: user.wardId,
    },
    ...tokens,
  })
})

// ============================================
// EMAIL OTP LOGIN (Admin Users)
// ============================================

/**
 * Step 1: Request OTP
 */
auth.post('/admin/request-otp', async (c) => {
  const body = await validateBody(await c.req.json(), loginAdminSchema)

  // Check if user exists and is admin/staff
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  if (!['admin', 'staff'].includes(user.role)) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  if (!user.isActive || user.deletedAt) {
    return c.json({ error: 'Account is inactive or deleted' }, 403)
  }

  // Check if OTP already sent recently
  if (await hasOTP(body.email)) {
    const ttl = await getOTPTTL(body.email)
    return c.json({
      error: 'OTP already sent',
      message: `Please wait ${ttl} seconds before requesting again`,
      retryAfter: ttl,
    }, 429)
  }

  // Generate and store OTP
  const otp = generateOTP()
  await storeOTP(body.email, otp)

  // Send email
  try {
    await sendOTPEmail(body.email, otp, user.name)
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return c.json({ error: 'Failed to send OTP email' }, 500)
  }

  return c.json({
    message: 'OTP sent successfully',
    email: body.email,
    expiresIn: 300, // 5 minutes
  })
})

/**
 * Step 2: Verify OTP and login
 */
auth.post('/admin/verify-otp', async (c) => {
  const body = await validateBody(await c.req.json(), verifyOTPSchema)

  // Verify OTP
  const isValid = await verifyOTP(body.email, body.otp)

  if (!isValid) {
    return c.json({ error: 'Invalid or expired OTP' }, 401)
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: body.email },
    include: { ward: true },
  })

  if (!user || !user.isActive || user.deletedAt) {
    return c.json({ error: 'User not found or inactive' }, 404)
  }

  // Generate tokens
  const tokens = await generateTokenPair({
    userId: user.id,
    email: user.email!,
    role: user.role,
    wardId: user.wardId || undefined,
  })

  // Save session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      deviceInfo: {
        userAgent: c.req.header('user-agent'),
      },
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      wardId: user.wardId,
      ward: user.ward ? {
        id: user.ward.id,
        name: user.ward.name,
        code: user.ward.code,
      } : null,
    },
    ...tokens,
  })
})

// ============================================
// TOKEN REFRESH
// ============================================

auth.post('/refresh', async (c) => {
  const body = await validateBody(await c.req.json(), refreshTokenSchema)

  try {
    // Verify refresh token
    const payload = await verifyRefreshToken(body.refreshToken)

    // Check session exists
    const session = await prisma.userSession.findFirst({
      where: {
        userId: payload.userId,
        token: body.refreshToken,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })

    if (!session || !session.user.isActive || session.user.deletedAt) {
      return c.json({ error: 'Invalid refresh token' }, 401)
    }

    // Generate new tokens
    const tokens = await generateTokenPair({
      userId: session.user.id,
      email: session.user.email || undefined,
      zaloId: session.user.zaloId || undefined,
      role: session.user.role,
      wardId: session.user.wardId || undefined,
    })

    // Update session
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return c.json(tokens)
  } catch (error) {
    return c.json({ error: 'Invalid refresh token' }, 401)
  }
})

// ============================================
// LOGOUT
// ============================================

auth.post('/logout', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.substring(7)

  if (token) {
    // Delete session
    await prisma.userSession.deleteMany({
      where: {
        userId,
        token,
      },
    })
  }

  return c.json({ message: 'Logged out successfully' })
})

// ============================================
// CURRENT USER
// ============================================

auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user') as any

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      zaloId: user.zaloId,
      avatarUrl: user.avatarUrl,
      role: user.role,
      wardId: user.wardId,
    },
  })
})

export default auth
