/**
 * Environment Configuration
 * Validates and provides typed environment variables
 */

import { z } from 'zod'

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  API_PREFIX: z.string().default('/api'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Zalo OAuth
  ZALO_APP_ID: z.string(),
  ZALO_APP_SECRET: z.string(),
  ZALO_OAUTH_URL: z.string().url().default('https://oauth.zaloapp.com/v4'),

  // Email (optional in development)
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_SECURE: z.string().default('false').transform((v) => v === 'true'),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // OTP
  OTP_EXPIRY: z.string().default('300').transform(Number), // 5 minutes
  OTP_LENGTH: z.string().default('6').transform(Number),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().default('15').transform(Number), // minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  // File Upload
  MAX_FILE_SIZE: z.string().default('10485760').transform(Number), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // CDN (optional)
  CDN_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

// Preprocess: remove empty strings
const processedEnv = Object.fromEntries(
  Object.entries(process.env).map(([key, value]) => [
    key,
    value === '' ? undefined : value,
  ])
)

// Parse and validate environment
export const env = envSchema.parse(processedEnv)

// Export individual values for convenience
export const {
  NODE_ENV,
  PORT,
  API_PREFIX,
  DATABASE_URL,
  REDIS_URL,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
  ZALO_APP_ID,
  ZALO_APP_SECRET,
  ZALO_OAUTH_URL,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  OTP_EXPIRY,
  OTP_LENGTH,
  CORS_ORIGIN,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX_REQUESTS,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
  CDN_URL,
} = env
