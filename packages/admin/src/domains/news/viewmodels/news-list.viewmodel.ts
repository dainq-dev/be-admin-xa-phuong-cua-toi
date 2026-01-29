/**
 * News List ViewModel
 * Manages state for news list page
 */

import { create } from 'zustand'
import type { ArticleResponse } from '@phuong-xa/shared'
import { NewsController } from '../controllers/news.controller'

interface NewsListState {
  articles: ArticleResponse[]
  total: number
  isLoading: boolean
  error: string | null

  // Pagination
  limit: number
  offset: number
  hasMore: boolean

  // Filters
  search: string
  categoryId: string | null
  isPublished: boolean | null
}

interface NewsListActions {
  loadArticles: () => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  setSearch: (search: string) => void
  setCategoryId: (categoryId: string | null) => void
  setPublishedFilter: (isPublished: boolean | null) => void
  clearFilters: () => void
}

export type NewsListViewModel = NewsListState & NewsListActions

const initialState: NewsListState = {
  articles: [],
  total: 0,
  isLoading: false,
  error: null,
  limit: 20,
  offset: 0,
  hasMore: false,
  search: '',
  categoryId: null,
  isPublished: null,
}

/**
 * News List ViewModel Store
 */
export const useNewsListViewModel = create<NewsListViewModel>((set, get) => ({
  ...initialState,

  loadArticles: async () => {
    set({ isLoading: true, error: null })

    try {
      const { limit, offset, search, categoryId, isPublished } = get()
      const controller = new NewsController()

      const response = await controller.listArticles({
        limit,
        offset,
        search: search || undefined,
        categoryId: categoryId || undefined,
        isPublished: isPublished ?? undefined,
      })

      set({
        articles: response.items,
        total: response.total,
        hasMore: response.hasMore,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Tải danh sách thất bại',
      })
    }
  },

  loadMore: async () => {
    const { hasMore, isLoading, limit, offset } = get()

    if (!hasMore || isLoading) return

    set({ offset: offset + limit })
    await get().loadArticles()
  },

  refresh: async () => {
    set({ offset: 0 })
    await get().loadArticles()
  },

  setSearch: (search) => {
    set({ search, offset: 0 })
  },

  setCategoryId: (categoryId) => {
    set({ categoryId, offset: 0 })
  },

  setPublishedFilter: (isPublished) => {
    set({ isPublished, offset: 0 })
  },

  clearFilters: () => {
    set({
      search: '',
      categoryId: null,
      isPublished: null,
      offset: 0,
    })
  },
}))
