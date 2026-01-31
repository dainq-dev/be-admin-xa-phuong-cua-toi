/**
 * useTinTuc Hook
 * Custom hook for News List view - handles all business logic & state management
 * Uses useOptimistic for instant UI feedback on delete actions
 */

import { useState, useEffect, useCallback, useOptimistic } from 'react'
import { NewsController } from '@/domains/news/controllers/news.controller'
import type { ArticleListResponse, Article } from '@phuong-xa/shared'
import type { NewsCategory, NewsStatus, ListArticlesParams } from '@/api/news.api'
import { toast } from '@/components/ui/toast'

const PAGE_SIZE = 10

const newsController = new NewsController()

// Optimistic reducer for delete action
type OptimisticAction = { type: 'delete'; id: string }

function optimisticReducer(
  state: Article[],
  action: OptimisticAction
): Article[] {
  switch (action.type) {
    case 'delete':
      return state.filter((item) => item.id !== action.id)
    default:
      return state
  }
}

export function useTinTuc() {
  // Data state
  const [data, setData] = useState<ArticleListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Optimistic state for items
  const [optimisticItems, addOptimisticAction] = useOptimistic(
    data?.items ?? [],
    optimisticReducer
  )

  // Filter state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<NewsCategory | 'all'>('all')
  const [status, setStatus] = useState<NewsStatus | 'all'>('all')
  const [page, setPage] = useState(0)

  // Debounced search
  const [searchDebounced, setSearchDebounced] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
      setPage(0) // Reset to first page when search changes
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load news data
  const loadNews = useCallback(async () => {
    try {
      setLoading(true)
      const params: ListArticlesParams = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }
      if (searchDebounced) params.search = searchDebounced
      if (category !== 'all') params.category = category
      if (status !== 'all') params.status = status

      const result = await newsController.listArticles(params)
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tin tức')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể tải danh sách tin tức',
      })
    } finally {
      setLoading(false)
    }
  }, [page, searchDebounced, category, status])

  // Auto-load news when dependencies change
  useEffect(() => {
    loadNews()
  }, [loadNews])

  // Delete article with optimistic update
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      // Optimistically remove from UI immediately
      addOptimisticAction({ type: 'delete', id })

      try {
        await newsController.deleteArticle(id)
        toast({
          variant: 'success',
          title: 'Thành công',
          description: 'Đã xóa bài viết',
        })
        // Reload to sync with server
        loadNews()
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: err.message || 'Không thể xóa bài viết',
        })
        // Reload to restore original state
        loadNews()
      }
    }
  }, [loadNews, addOptimisticAction])

  // Filter change handlers
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value as NewsCategory | 'all')
    setPage(0)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value as NewsStatus | 'all')
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
  const hasData = optimisticItems.length > 0
  const canGoPrevious = page > 0
  const canGoNext = data ? page < totalPages - 1 : false

  return {
    // State - use optimisticItems for instant UI feedback
    data: data ? { ...data, items: optimisticItems } : null,
    loading,
    error,
    search,
    category,
    status,
    page,

    // Computed
    totalPages,
    hasData,
    canGoPrevious,
    canGoNext,

    // Actions
    loadNews,
    handleDelete,
    handleCategoryChange,
    handleStatusChange,
    handleSearchChange,
    handlePreviousPage,
    handleNextPage,
  }
}
