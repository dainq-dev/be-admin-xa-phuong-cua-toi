/**
 * useTinTuc Hook
 * Custom hook for News List view - handles all business logic & state management
 */

import { useState, useEffect, useCallback } from 'react'
import { NewsController } from '@/domains/news/controllers/news.controller'
import type { ArticleListResponse } from '@phuong-xa/shared'
import type { NewsCategory, NewsStatus, ListArticlesParams } from '@/api/news.api'
import { toast } from '@/components/ui/toast'

const PAGE_SIZE = 10

const newsController = new NewsController()

export function useTinTuc() {
  // Data state
  const [data, setData] = useState<ArticleListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Delete article
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await newsController.deleteArticle(id)
        toast({
          variant: 'success',
          title: 'Thành công',
          description: 'Đã xóa bài viết',
        })
        loadNews()
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: err.message || 'Không thể xóa bài viết',
        })
      }
    }
  }, [loadNews])

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
  const hasData = data && data.items.length > 0
  const canGoPrevious = page > 0
  const canGoNext = data ? page < totalPages - 1 : false

  return {
    // State
    data,
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
