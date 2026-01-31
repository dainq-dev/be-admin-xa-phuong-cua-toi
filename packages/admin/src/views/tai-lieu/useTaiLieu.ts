/**
 * useTaiLieu Hook
 * Custom hook for Documents List view - handles all business logic & state management
 * Including dialog states for create/edit/view operations
 * Uses useOptimistic for instant UI feedback on delete actions
 */

import { useState, useEffect, useCallback, useOptimistic } from 'react'
import { DocumentsController } from '@/domains/documents/controllers/documents.controller'
import type { CreateDocumentRequest, UpdateDocumentRequest, ListDocumentsParams } from '@/api/documents.api'
import { toast } from '@/components/ui/toast'

const PAGE_SIZE = 10
const documentsController = new DocumentsController()

const initialFormData: CreateDocumentRequest = {
  title: '',
  description: '',
  category: 'ho_tich',
  department: '',
  processingTime: '',
  fee: '',
}

interface Document {
  id: string
  title: string
  slug: string
  description?: string
  category: string
  department?: string
  processingTime?: string
  fee?: string
  viewCount?: number
  downloadCount?: number
  createdAt: string
}

interface DocumentListResponse {
  items: Document[]
  total: number
  hasMore: boolean
}

// Optimistic reducer for delete action
type OptimisticAction = { type: 'delete'; id: string }

function optimisticReducer(
  state: Document[],
  action: OptimisticAction
): Document[] {
  switch (action.type) {
    case 'delete':
      return state.filter((item) => item.id !== action.id)
    default:
      return state
  }
}

export function useTaiLieu() {
  // Data state
  const [data, setData] = useState<DocumentListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Optimistic state for items
  const [optimisticItems, addOptimisticAction] = useOptimistic(
    data?.items ?? [],
    optimisticReducer
  )

  // Filter state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(0)
  const [searchDebounced, setSearchDebounced] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<CreateDocumentRequest>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const params: ListDocumentsParams = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }
      if (searchDebounced) params.search = searchDebounced
      if (category !== 'all') params.category = category

      const result = await documentsController.listDocuments(params)
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tài liệu')
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể tải danh sách tài liệu',
      })
    } finally {
      setLoading(false)
    }
  }, [page, searchDebounced, category])

  // Auto-load documents when dependencies change
  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Dialog handlers
  const handleCreate = useCallback(() => {
    setDialogMode('create')
    setFormData(initialFormData)
    setEditingId(null)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((doc: Document) => {
    setDialogMode('edit')
    setFormData({
      title: doc.title,
      description: doc.description || '',
      category: doc.category,
      department: doc.department || '',
      processingTime: doc.processingTime || '',
      fee: doc.fee || '',
    })
    setEditingId(doc.id)
    setDialogOpen(true)
  }, [])

  const handleViewDetail = useCallback((doc: Document) => {
    setSelectedDoc(doc)
    setDetailOpen(true)
  }, [])

  // Form handlers
  const handleFormChange = useCallback((field: keyof CreateDocumentRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!formData.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập tên thủ tục',
      })
      return
    }

    setIsSaving(true)
    try {
      if (dialogMode === 'create') {
        await documentsController.createDocument(formData)
        toast({
          variant: 'success',
          title: 'Thành công',
          description: 'Đã tạo thủ tục mới',
        })
      } else if (editingId) {
        await documentsController.updateDocument(editingId, formData as UpdateDocumentRequest)
        toast({
          variant: 'success',
          title: 'Thành công',
          description: 'Đã cập nhật thủ tục',
        })
      }
      setDialogOpen(false)
      loadDocuments()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể lưu thủ tục',
      })
    } finally {
      setIsSaving(false)
    }
  }, [formData, dialogMode, editingId, loadDocuments])

  // Delete with optimistic update
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thủ tục này?')) {
      // Optimistically remove from UI immediately
      addOptimisticAction({ type: 'delete', id })

      try {
        await documentsController.deleteDocument(id)
        toast({
          variant: 'success',
          title: 'Thành công',
          description: 'Đã xóa thủ tục',
        })
        loadDocuments()
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: err.message || 'Không thể xóa thủ tục',
        })
        // Reload to restore original state
        loadDocuments()
      }
    }
  }, [loadDocuments, addOptimisticAction])

  // Filter handlers
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value)
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
    page,

    // Dialog state
    dialogOpen,
    setDialogOpen,
    dialogMode,
    formData,
    isSaving,
    detailOpen,
    setDetailOpen,
    selectedDoc,

    // Computed
    totalPages,
    hasData,
    canGoPrevious,
    canGoNext,

    // Actions
    loadDocuments,
    handleCreate,
    handleEdit,
    handleViewDetail,
    handleFormChange,
    handleSave,
    handleDelete,
    handleCategoryChange,
    handleSearchChange,
    handlePreviousPage,
    handleNextPage,
  }
}

// Export types for component use
export type { Document, DocumentListResponse }
