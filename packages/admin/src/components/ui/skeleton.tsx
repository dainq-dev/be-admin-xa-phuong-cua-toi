/**
 * Skeleton Loading Components
 * Provides placeholder UI while content is loading
 */

import { cn } from '@/lib/utils'

// ============================================
// BASE SKELETON
// ============================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

// ============================================
// TABLE SKELETON
// ============================================

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ============================================
// CARD SKELETON
// ============================================

interface CardSkeletonProps {
  className?: string
}

function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('rounded-lg border p-6 space-y-4', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

// ============================================
// FORM SKELETON
// ============================================

interface FormSkeletonProps {
  fields?: number
}

function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export { Skeleton, TableSkeleton, CardSkeleton, FormSkeleton }
