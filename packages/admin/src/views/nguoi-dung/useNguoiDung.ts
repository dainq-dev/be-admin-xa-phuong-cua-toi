/**
 * useNguoiDung Hook
 * Custom hook for Users List view - handles all business logic & state management
 * Including user list, detail dialog, edit dialog, and role management
 * Uses useOptimistic for instant UI feedback on user updates
 */

import { useState, useEffect, useCallback, useOptimistic } from 'react'
import { UserController } from '@/domains/user/controllers/user.controller'
import type { User } from '@phuong-xa/shared'
import type { UpdateUserRequest } from '@/api/user.api'
import { toast } from '@/components/ui/toast'

const PAGE_SIZE = 10
const usersController = new UserController()

interface UserListResponse {
  items: User[]
  total: number
  hasMore: boolean
}

// Optimistic reducer for user update
type OptimisticAction = { type: 'update'; id: string; data: Partial<User> }

function optimisticReducer(
  state: User[],
  action: OptimisticAction
): User[] {
  switch (action.type) {
    case 'update':
      return state.map((user) =>
        user.id === action.id ? { ...user, ...action.data } : user
      )
    default:
      return state
  }
}

export function useNguoiDung() {
  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Optimistic state for users
  const [optimisticUsers, addOptimisticAction] = useOptimistic(
    users,
    optimisticReducer
  )

  // Filter state
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [searchDebounced, setSearchDebounced] = useState('')

  // Dialog state
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<UpdateUserRequest>({})
  const [isSaving, setIsSaving] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: any = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }
      if (searchDebounced) params.search = searchDebounced
      if (roleFilter !== 'all') params.role = roleFilter

      const result: UserListResponse = await usersController.listUsers(params)
      setUsers(result.items)
      setTotal(result.total)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể tải danh sách người dùng',
      })
    } finally {
      setIsLoading(false)
    }
  }, [page, searchDebounced, roleFilter])

  // Auto-load users
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Handle view detail
  const handleViewDetail = useCallback((user: User) => {
    setSelectedUser(user)
    setDetailOpen(true)
  }, [])

  // Handle edit
  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      role: user.role,
    })
    setEditOpen(true)
  }, [])

  // Handle form change
  const handleFormChange = useCallback((field: keyof UpdateUserRequest, value: any) => {
    setEditFormData((prev: UpdateUserRequest) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Handle save with optimistic update
  const handleSave = useCallback(async () => {
    if (!selectedUser) return

    // Optimistically update user in UI immediately
    addOptimisticAction({
      type: 'update',
      id: selectedUser.id,
      data: editFormData as Partial<User>,
    })
    setEditOpen(false)

    setIsSaving(true)
    try {
      await usersController.updateUser(selectedUser.id, editFormData)
      toast({
        variant: 'success',
        title: 'Thành công',
        description: 'Đã cập nhật thông tin người dùng',
      })
      loadUsers()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể cập nhật người dùng',
      })
      // Reload to restore original state
      loadUsers()
    } finally {
      setIsSaving(false)
    }
  }, [selectedUser, editFormData, loadUsers, addOptimisticAction])

  // Filter handlers
  const handleRoleFilterChange = useCallback((value: string) => {
    setRoleFilter(value)
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
    const totalPages = Math.ceil(total / PAGE_SIZE)
    if (page < totalPages - 1) {
      setPage((prev) => prev + 1)
    }
  }, [total, page])

  // Computed values
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasData = optimisticUsers.length > 0
  const canGoPrevious = page > 0
  const canGoNext = page < totalPages - 1

  return {
    // State - use optimisticUsers for instant UI feedback
    users: optimisticUsers,
    total,
    isLoading,
    error,
    search,
    roleFilter,
    page,

    // Dialog state
    detailOpen,
    setDetailOpen,
    editOpen,
    setEditOpen,
    selectedUser,
    editFormData,
    isSaving,

    // Computed
    totalPages,
    hasData,
    canGoPrevious,
    canGoNext,

    // Actions
    loadUsers,
    handleViewDetail,
    handleEdit,
    handleFormChange,
    handleSave,
    handleRoleFilterChange,
    handleSearchChange,
    handlePreviousPage,
    handleNextPage,
  }
}

// Export types
export type { User }
