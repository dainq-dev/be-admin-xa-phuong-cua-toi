/**
 * Wards Repository
 */

import { PrismaClient } from '@prisma/client'

export class WardsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find all active wards with district and province info
   */
  async findAllActive() {
    return this.prisma.ward.findMany({
      where: { isActive: true },
      include: {
        district: {
          select: {
            id: true,
            name: true,
            province: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Find ward by ID with full location details
   */
  async findById(id: string) {
    return this.prisma.ward.findUnique({
      where: { id },
      include: {
        district: {
          include: {
            province: true,
          },
        },
      },
    })
  }

  /**
   * Find page theme by ward ID and page key
   */
  async findPageTheme(wardId: string, pageKey: string) {
    return this.prisma.pageTheme.findFirst({
      where: {
        wardId,
        pageKey,
        isActive: true,
      },
    })
  }

  /**
   * Upsert page theme
   */
  async upsertPageTheme(wardId: string, pageKey: string, data: any) {
    return this.prisma.pageTheme.upsert({
      where: {
        wardId_pageKey: {
          wardId,
          pageKey,
        },
      },
      create: {
        wardId,
        pageKey,
        ...data,
      },
      update: data,
    })
  }

  /**
   * Find feature flags for a ward
   */
  async findFeatureFlags(wardId: string) {
    return this.prisma.featureFlag.findMany({
      where: { wardId },
    })
  }

  /**
   * Upsert feature flag
   */
  async upsertFeatureFlag(wardId: string, featureKey: string, data: any) {
    return this.prisma.featureFlag.upsert({
      where: {
        wardId_featureKey: {
          wardId,
          featureKey,
        },
      },
      create: {
        wardId,
        featureKey,
        ...data,
      },
      update: data,
    })
  }
}
