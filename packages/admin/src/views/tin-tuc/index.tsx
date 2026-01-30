/**
 * News List View
 * Manage news articles with search, filters, and pagination
 * 
 * Note: Business logic has been extracted to useTinTuc.ts hook
 * This component only handles UI rendering
 */

import { useNavigate } from 'react-router-dom'
import type { NewsCategory, NewsStatus } from '@/api/news.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/skeleton'
import { useTinTuc } from './useTinTuc'

// Constants
const CATEGORIES: { value: NewsCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả danh mục' },
  { value: 'su_kien', label: 'Sự kiện' },
  { value: 'thong_bao', label: 'Thông báo' },
  { value: 'chinh_sach', label: 'Chính sách' },
  { value: 'hoat_dong', label: 'Hoạt động' },
  { value: 'khac', label: 'Khác' },
]

const STATUSES: { value: NewsStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'archived', label: 'Lưu trữ' },
  { value: 'hidden', label: 'Ẩn' },
]

const CATEGORY_LABELS: Record<string, string> = {
  su_kien: 'Sự kiện',
  thong_bao: 'Thông báo',
  chinh_sach: 'Chính sách',
  hoat_dong: 'Hoạt động',
  khac: 'Khác',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
  hidden: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
  hidden: 'Ẩn',
}

const PAGE_SIZE = 10

export default function TinTuc() {
  const navigate = useNavigate()
  
  // Get all state and actions from custom hook
  const {
    data,
    loading,
    error,
    search,
    category,
    status,
    page,
    totalPages,
    hasData,
    canGoPrevious,
    canGoNext,
    handleDelete,
    handleCategoryChange,
    handleStatusChange,
    handleSearchChange,
    handlePreviousPage,
    handleNextPage,
  } = useTinTuc()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Tin tức</h1>
          <p className="text-muted-foreground">
            Đăng tin, cập nhật và quản lý bài báo của phường xã
          </p>
        </div>
        <Button onClick={() => navigate('/tin-tuc/tao-moi')}>
          <Plus className="w-4 h-4 mr-2" />
          Viết bài mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-50 max-w-100">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={handleCategoryChange}>
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
        <Select value={status} onValueChange={handleStatusChange}>
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
              <TableHead className="w-[40%]">Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-center">Lượt xem</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {search || category !== 'all' || status !== 'all'
                    ? 'Không tìm thấy bài viết nào phù hợp'
                    : 'Chưa có bài viết nào'}
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="font-medium line-clamp-1">{article.title}</div>
                    {article.isFeatured && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Nổi bật
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[article.category] || article.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[article.status] || 'bg-gray-100'}>
                      {STATUS_LABELS[article.status] || article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      {article.viewCount || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/tin-tuc/chinh-sua/${article.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(article.id)}
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
            Hiển thị {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, data.total)} / {data.total} bài viết
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!canGoPrevious}
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
              onClick={handleNextPage}
              disabled={!canGoNext}
            >
              Sau
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
