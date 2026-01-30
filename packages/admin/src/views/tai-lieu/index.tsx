/**
 * Documents List View
 * Manage administrative procedures and documents
 * 
 * Note: Business logic has been extracted to useTaiLieu.ts hook
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
import { Plus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, Loader2, FileText, Clock, Banknote } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useTaiLieu, type Document } from './useTaiLieu'

// Constants
const CATEGORIES = [
  { value: 'all', label: 'Tất cả danh mục' },
  { value: 'ho_tich', label: 'Hộ tịch' },
  { value: 'dat_dai', label: 'Đất đai' },
  { value: 'xay_dung', label: 'Xây dựng' },
  { value: 'kinh_doanh', label: 'Kinh doanh' },
  { value: 'lao_dong', label: 'Lao động - BHXH' },
  { value: 'khac', label: 'Khác' },
]

const CATEGORY_LABELS: Record<string, string> = {
  ho_tich: 'Hộ tịch',
  dat_dai: 'Đất đai',
  xay_dung: 'Xây dựng',
  kinh_doanh: 'Kinh doanh',
  lao_dong: 'Lao động - BHXH',
  khac: 'Khác',
}

const PAGE_SIZE = 10

export default function TaiLieu() {
  // Get all state and actions from custom hook
  const {
    data,
    loading,
    error,
    search,
    category,
    page,
    dialogOpen,
    setDialogOpen,
    dialogMode,
    formData,
    isSaving,
    detailOpen,
    setDetailOpen,
    selectedDoc,
    totalPages,
    canGoPrevious,
    canGoNext,
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
  } = useTaiLieu()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Thủ tục Hành chính</h1>
          <p className="text-muted-foreground">
            Quản lý các quy trình, biểu mẫu và hướng dẫn cho người dân
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm thủ tục
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-50 max-w-100">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên thủ tục..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => { handleCategoryChange(v); handlePreviousPage() }}>
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
              <TableHead className="w-[35%]">Tên thủ tục</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Bộ phận</TableHead>
              <TableHead>Lệ phí</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {search || category !== 'all'
                    ? 'Không tìm thấy thủ tục nào phù hợp'
                    : 'Chưa có thủ tục nào'}
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="font-medium line-clamp-1">{doc.title}</div>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {doc.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[doc.category] || doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {doc.department || 'Văn phòng UBND'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Banknote className="w-4 h-4 text-muted-foreground" />
                      {doc.fee || 'Miễn phí'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {doc.processingTime || 'Trong ngày'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(doc)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
            Hiển thị {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, data.total)} / {data.total} thủ tục
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreviousPage()}
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
              onClick={() => handleNextPage()}
              disabled={!data.hasMore}
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Thêm thủ tục mới' : 'Chỉnh sửa thủ tục'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết về thủ tục hành chính
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên thủ tục *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="VD: Đăng ký khai sinh"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về thủ tục..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleFormChange('category', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Bộ phận</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleFormChange('department', e.target.value)}
                  placeholder="VD: Tư pháp - Hộ tịch"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Lệ phí</Label>
                <Input
                  id="fee"
                  value={formData.fee}
                  onChange={(e) => handleFormChange('fee', e.target.value)}
                  placeholder="VD: 50.000đ hoặc Miễn phí"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingTime">Thời gian xử lý</Label>
                <Input
                  id="processingTime"
                  value={formData.processingTime}
                  onChange={(e) => handleFormChange('processingTime', e.target.value)}
                  placeholder="VD: 3-5 ngày làm việc"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                dialogMode === 'create' ? 'Tạo mới' : 'Cập nhật'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Chi tiết thủ tục
            </DialogTitle>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedDoc.title}</h3>
                <Badge variant="outline" className="mt-2">
                  {CATEGORY_LABELS[selectedDoc.category] || selectedDoc.category}
                </Badge>
              </div>

              {selectedDoc.description && (
                <div>
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <p className="mt-1">{selectedDoc.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Bộ phận tiếp nhận</Label>
                  <p className="mt-1 font-medium">{selectedDoc.department || 'Văn phòng UBND'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lệ phí</Label>
                  <p className="mt-1 font-medium">{selectedDoc.fee || 'Miễn phí'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Thời gian xử lý</Label>
                  <p className="mt-1 font-medium">{selectedDoc.processingTime || 'Trong ngày'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lượt xem</Label>
                  <p className="mt-1 font-medium">{selectedDoc.viewCount || 0}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Đóng
            </Button>
            {selectedDoc && (
              <Button onClick={() => { setDetailOpen(false); handleEdit(selectedDoc) }}>
                <Pencil className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
