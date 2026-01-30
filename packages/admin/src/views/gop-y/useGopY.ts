/**
 * useGopY Hook  
 * Custom hook for Feedback List view - handles all business logic & state management
 * Including stats, filters, detail dialog, and status updates
 */

import { useState, useEffect, useCallback } from 'react'
import { FeedbackController } from '@/domains/feedback/controllers/feedback.controller'
import type { ListFeedbackParams, UpdateFeedbackStatusRequest } from '@/api/feedback.api'
import { toast } from '@/components/ui/toast'

const PAGE_SIZE = 10
const feedbackController = new FeedbackController()

interface Feedback {
  id: string
  title: string
  content: string
  category: string
  status: string
  priority?: string
  isUrgent?: boolean
  isAnonymous?: boolean
  location?: { lat: number; lng: number; address?: string }
  photos?: string[]
  user?: { id: string; name: string; phone?: string }
  responseMessage?: string
  createdAt: string
  updatedAt?: string
}

interface FeedbackListResponse {
  items: Feedback[]
  total: number
  hasMore: boolean
}

interface FeedbackStats {
  total: number
  pending: number
  reviewing: number
  in_progress: number
  resolved: number
  rejected: number
}

export function useGopY() {
  // Data state
  const [data, setData] = useState<FeedbackListResponse | null>(null)
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(0)
  const [searchDebounced, setSearchDebounced] = useState('')

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [responseMessage, setResponseMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load feedback
  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true)
      const params: ListFeedbackParams = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }
      if (searchDebounced) params.search = searchDebounced
      if (category !== 'all') params.category = category
      if (status !== 'all') params.status = status

      const result = await feedbackController.listFeedback(params)
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách góp ý')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể tải danh sách góp ý',
      })
    } finally {
      setLoading(false)
    }
  }, [page, searchDebounced, category, status])

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await feedbackController.getStats()
      setStats(statsData)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  // Auto-load data
  useEffect(() => {
    loadFeedback()
    loadStats()
  }, [loadFeedback, loadStats])

  // Handle view detail
  const handleViewDetail = useCallback((feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setNewStatus(feedback.status)
    setResponseMessage(feedback.responseMessage || '')
    setDetailOpen(true)
  }, [])

  // Handle status update
  const handleUpdateStatus = useCallback(async () => {
    if (!selectedFeedback) return

    setIsUpdating(true)
    try {
      const updateData: UpdateFeedbackStatusRequest = {
        status: newStatus,
        responseMessage: responseMessage || undefined,
      }
      await feedbackController.updateStatus(selectedFeedback.id, updateData)
      toast({
        variant: 'success',
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái góp ý',
      })
      setDetailOpen(false)
      loadFeedback()
      loadStats()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể cập nhật trạng thái',
      })
    } finally {
      setIsUpdating(false)
    }
  }, [selectedFeedback, newStatus, responseMessage, loadFeedback, loadStats])

  // Filter handlers
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value)
    setPage(0)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
    setPage(0)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  // Pagination handlers
  const handlePreviousPage = useCallback(() => {
    setPage((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    if (data && page < Math.ceil(data.total / PAGE_SIZE) - 1) {
      setPage((prev) => prev + 1)
    }
  }, [data, page])

  // Computed values
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0
  const hasData = data && data.items.length > 0
  const canGoPrevious = page > 0
  const canGoNext = data ? page < totalPages - 1 : false

  return {
    // State
    data,
    stats,
    loading,
    error,
    search,
    category,
    status,
    page,
    
    // Dialog state
    detailOpen,
    setDetailOpen,
    selectedFeedback,
    newStatus,
    setNewStatus,
    responseMessage,
    setResponseMessage,
    isUpdating,
    
    // Computed
    totalPages,
    hasData,
    canGoPrevious,
    canGoNext,
    
    // Actions
    loadFeedback,
    loadStats,
    handleViewDetail,
    handleUpdateStatus,
    handleCategoryChange,
    handleStatusChange,
    handleSearchChange,
    handlePreviousPage,
    handleNextPage,
  }
}

// Export types for component use
export type { Feedback, FeedbackListResponse, FeedbackStats }
