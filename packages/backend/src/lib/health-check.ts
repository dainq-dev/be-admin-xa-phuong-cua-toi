/**
 * Health Check System
 * Verify all services on startup
 */

import { prisma } from './prisma'
import { redis } from './redis'
import { transporter } from './email'

interface ServiceStatus {
  name: string
  status: 'ok' | 'error'
  message?: string
}

/**
 * Check Prisma Database Connection
 */
async function checkDatabase(): Promise<ServiceStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      name: 'Database (Prisma)',
      status: 'ok',
    }
  } catch (error) {
    return {
      name: 'Database (Prisma)',
      status: 'error',
      message: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

/**
 * Check Redis Connection
 */
async function checkRedis(): Promise<ServiceStatus> {
  try {
    await redis.ping()
    return {
      name: 'Redis Cache',
      status: 'ok',
    }
  } catch (error) {
    return {
      name: 'Redis Cache',
      status: 'error',
      message: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

/**
 * Check Email Service
 */
async function checkEmail(): Promise<ServiceStatus> {
  try {
    await transporter.verify()
    return {
      name: 'Email Service',
      status: 'ok',
    }
  } catch (error) {
    return {
      name: 'Email Service',
      status: 'error',
      message: 'Not configured or invalid credentials',
    }
  }
}

/**
 * Run all health checks
 */
export async function runHealthChecks(): Promise<void> {
  console.log('\n🔍 Checking services...\n')

  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkEmail(),
  ])

  const results: ServiceStatus[] = checks.map((check, index) => {
    if (check.status === 'fulfilled') {
      return check.value
    }
    // If promise rejected, mark as error
    const services = ['Database (Prisma)', 'Redis Cache', 'Email Service']
    return {
      name: services[index],
      status: 'error',
      message: 'Check failed',
    }
  })

  // Log results
  let allOk = true
  const failedServices: string[] = []

  for (const result of results) {
    if (result.status === 'ok') {
      console.log(`✅ ${result.name}`)
    } else {
      console.log(`❌ ${result.name}${result.message ? ` - ${result.message}` : ''}`)
      failedServices.push(result.name)
      allOk = false
    }
  }

  console.log('') // Empty line

  // Summary
  if (allOk) {
    console.log('✨ All services are healthy!\n')
  } else {
    console.log('⚠️  Warning: Some services are unavailable')
    console.log(`   Failed: ${failedServices.join(', ')}`)
    console.log('   App will continue but some features may not work\n')
  }
}

/**
 * Get current health status (for /health endpoint)
 */
export async function getHealthStatus() {
  const [db, cache, email] = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkEmail(),
  ])

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: db.status === 'fulfilled' ? db.value : { name: 'Database', status: 'error' },
      redis: cache.status === 'fulfilled' ? cache.value : { name: 'Redis', status: 'error' },
      email: email.status === 'fulfilled' ? email.value : { name: 'Email', status: 'error' },
    },
  }
}
