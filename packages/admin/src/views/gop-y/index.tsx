/**
 * Feedback List View
 * Manage citizen feedback and complaints
 * 
 * Note: Business logic has been extracted to useGopY.ts hook
 * This component only handles UI rendering
 */

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Search, Eye, ChevronLeft, ChevronRight, Loader2, MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useGopY, type Feedback, type FeedbackStats } from './useGopY'

// Constants
const CATEGORIES = [
  { value: 'all', label: 'Tất cả phân loại' },
  { value: 'infrastructure', label: 'Hạ tầng' },
  { value: 'healthcare', label: 'Y tế' },
  { value: 'security', label: 'An ninh' },
  { value: 'environment', label: 'Môi trường' },
  { value: 'traffic', label: 'Giao thông' },
  { value: 'public_service', label: 'Dịch vụ công' },
  { value: 'other', label: 'Khác' },
]

const STATUSES = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'reviewing', label: 'Đang xem xét' },
  { value: 'in_progress', label: 'Đang giải quyết' },
  { value: 'resolved', label: 'Đã hoàn thành' },
  { value: 'rejected', label: 'Từ chối' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  reviewing: 'Đang xem xét',
  in_progress: 'Đang giải quyết',
  resolved: 'Đã hoàn thành',
  rejected: 'Từ chối',
}

const CATEGORY_LABELS: Record<string, string> = {
  infrastructure: 'Hạ tầng',
  healthcare: 'Y tế',
  security: 'An ninh',
  environment: 'Môi trường',
  traffic: 'Giao thông',
  public_service: 'Dịch vụ công',
  other: 'Khác',
}

const PAGE_SIZE = 10

export default function GopY() {
  // Get all state and actions from custom hook
  const {
    data,
    stats,
    loading,
    error,
    search,
    category,
    status,
    page,
    detailOpen,
    setDetailOpen,
    selectedFeedback,
    newStatus,
    setNewStatus,
    responseMessage,
    setResponseMessage,
    isUpdating,
    totalPages,
    canGoPrevious,
    canGoNext,
    handleViewDetail,
    handleUpdateStatus,
    handleCategoryChange,
    handleStatusChange,
    handleSearchChange,
    handlePreviousPage,
    handleNextPage,
  } = useGopY()

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true)
      const params: ListFeedbackParams = {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }
      if (category !== 'all') params.category = category
      if (status !== 'all') params.status = status

      const result = await feedbackController.listFeedback(params)
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phản ánh')
    } finally {
      setLoading(false)
    }
  }, [page, category, status])

  const loadStats = async () => {
    try {
      const result = await feedbackController.getStats()
      setStats(result)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [loadFeedback])

  useEffect(() => {
    loadStats()
  }, [])

  const handleViewDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setNewStatus(feedback.status)
    setResponseMessage(feedback.responseMessage || '')
    setDetailOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedFeedback || !newStatus) return

    setIsUpdating(true)
    try {
      const updateData: UpdateFeedbackStatusRequest = {
        status: newStatus,
      }
      if (responseMessage.trim()) {
        updateData.responseMessage = responseMessage
      }
      await feedbackController.updateStatus(selectedFeedback.id, updateData)
      setDetailOpen(false)
      loadFeedback()
      loadStats()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Phản ánh & Kiến nghị</h1>
        <p className="text-muted-foreground">
          Tiếp nhận và xử lý ý kiến phản hồi từ người dân
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Tổng phản ánh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Chờ xử lý</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.in_progress}</p>
                  <p className="text-xs text-muted-foreground">Đang xử lý</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Đã giải quyết</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-xs text-muted-foreground">Từ chối</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-50 max-w-100">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0) }}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
          <SelectTrigger className="w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Người gửi / Tiêu đề</TableHead>
              <TableHead>Phân loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {category !== 'all' || status !== 'all'
                    ? 'Không tìm thấy phản ánh nào phù hợp'
                    : 'Chưa có phản ánh nào'}
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{item.user?.name || 'Ẩn danh'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {item.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </Badge>
                    {item.isUrgent && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Khẩn cấp
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status] || 'bg-gray-100'}>
                      {STATUS_LABELS[item.status] || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetail(item)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hiển thị {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, data.total)} / {data.total} phản ánh
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Trước
            </Button>
            <span className="text-sm px-2">
              Trang {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!data.hasMore}
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết phản ánh</DialogTitle>
            <DialogDescription>
              Xem và cập nhật trạng thái xử lý phản ánh
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-6 py-4">
              {/* User info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFeedback.user?.name || 'Ẩn danh'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[selectedFeedback.category] || selectedFeedback.category}
                  </Badge>
                  {selectedFeedback.isUrgent && (
                    <Badge variant="destructive">Khẩn cấp</Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-lg">{selectedFeedback.title}</h3>
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                  {selectedFeedback.content}
                </p>
              </div>

              {/* Location */}
              {selectedFeedback.location?.address && (
                <div>
                  <Label className="text-muted-foreground">Địa điểm</Label>
                  <p className="mt-1">{selectedFeedback.location.address}</p>
                </div>
              )}

              {/* Photos */}
              {selectedFeedback.photos && selectedFeedback.photos.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Hình ảnh đính kèm</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedFeedback.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status update */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium">Cập nhật trạng thái</h4>

                <div className="space-y-2">
                  <Label>Trạng thái mới</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.filter(s => s.value !== 'all').map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phản hồi cho người dân</Label>
                  <Textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Đóng
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật trạng thái'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
