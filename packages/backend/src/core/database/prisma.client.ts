/**
 * Prisma Client - Core Database
 * Re-export from lib for core module usage
 */

import { PrismaClient } from '@prisma/client'

export { prisma } from '../../lib/prisma'
export type { PrismaClient } from '@prisma/client'
export { Prisma } from '@prisma/client'

/**
 * Prisma Transaction Type
 * For passing transaction context to repositories
 */
export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>
