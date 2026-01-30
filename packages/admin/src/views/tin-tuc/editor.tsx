/**
 * News Editor Page
 * Create/Edit news articles with block-based content
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { NewsEditor } from '@/features/news/components/NewsEditor'
import { useEditorStore } from '@/features/news/stores/editorStore'
import { NewsController } from '@/domains/news/controllers/news.controller'
import type { NewsBlock, News } from '@phuong-xa/shared'
import type { CreateArticleRequest, UpdateArticleRequest, NewsCategory, NewsStatus } from '@/api/news.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, Eye } from 'lucide-react'

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: 'su_kien', label: 'Sự kiện' },
  { value: 'thong_bao', label: 'Thông báo' },
  { value: 'chinh_sach', label: 'Chính sách' },
  { value: 'hoat_dong', label: 'Hoạt động' },
  { value: 'khac', label: 'Khác' },
]

const STATUSES: { value: NewsStatus; label: string }[] = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'archived', label: 'Lưu trữ' },
  { value: 'hidden', label: 'Ẩn' },
]

interface ArticleMetadata {
  title: string
  summary: string
  category: NewsCategory
  status: NewsStatus
  imageUrl: string
  isFeatured: boolean
  isPinned: boolean
}

const initialMetadata: ArticleMetadata = {
  title: '',
  summary: '',
  category: 'thong_bao',
  status: 'draft',
  imageUrl: '',
  isFeatured: false,
  isPinned: false,
}

export default function TinTucEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id

  const { blocks, setBlocks } = useEditorStore()
  const [metadata, setMetadata] = useState<ArticleMetadata>(initialMetadata)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const controller = new NewsController()

  // Load article data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadArticle(id)
    } else {
      // Reset for create mode
      setMetadata(initialMetadata)
      setBlocks([])
    }
  }, [id, isEditMode])

  const loadArticle = async (articleId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const article = await controller.getArticle(articleId)
      setMetadata({
        title: article.title,
        summary: article.summary || '',
        category: article.category as NewsCategory,
        status: article.status as NewsStatus,
        imageUrl: article.imageUrl || '',
        isFeatured: article.isFeatured,
        isPinned: article.isPinned,
      })
      if (article.blocks && Array.isArray(article.blocks)) {
        setBlocks(article.blocks as NewsBlock[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bài viết')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!metadata.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Convert blocks to content string for backward compatibility
      const content = blocks.map(b => {
        if (b.type === 'text' || b.type === 'heading' || b.type === 'quote') {
          return (b as any).content || ''
        }
        return ''
      }).filter(Boolean).join('\n\n') || metadata.title

      if (isEditMode && id) {
        const updateData: UpdateArticleRequest = {
          title: metadata.title,
          summary: metadata.summary || undefined,
          content,
          category: metadata.category,
          status: metadata.status,
          imageUrl: metadata.imageUrl || undefined,
          isFeatured: metadata.isFeatured,
          isPinned: metadata.isPinned,
          blocks,
        }
        await controller.updateArticle(id, updateData)
      } else {
        const createData: CreateArticleRequest = {
          title: metadata.title,
          summary: metadata.summary || undefined,
          content,
          category: metadata.category,
          status: metadata.status,
          imageUrl: metadata.imageUrl || undefined,
          isFeatured: metadata.isFeatured,
          isPinned: metadata.isPinned,
          blocks,
        }
        await controller.createArticle(createData)
      }

      navigate('/tin-tuc')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu bài viết')
    } finally {
      setIsSaving(false)
    }
  }

  const updateMetadata = (field: keyof ArticleMetadata, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/tin-tuc')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-lg font-semibold">
            {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <Eye className="w-4 h-4 mr-1" />
            Xem trước
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                {isEditMode ? 'Cập nhật' : 'Xuất bản'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Metadata Sidebar */}
        <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
          <h2 className="font-medium mb-4">Thông tin bài viết</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => updateMetadata('title', e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Tóm tắt</Label>
              <Textarea
                id="summary"
                value={metadata.summary}
                onChange={(e) => updateMetadata('summary', e.target.value)}
                placeholder="Mô tả ngắn về bài viết..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select
                value={metadata.category}
                onValueChange={(value) => updateMetadata('category', value)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={metadata.status}
                onValueChange={(value) => updateMetadata('status', value)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Ảnh đại diện (URL)</Label>
              <Input
                id="imageUrl"
                value={metadata.imageUrl}
                onChange={(e) => updateMetadata('imageUrl', e.target.value)}
                placeholder="https://..."
              />
              {metadata.imageUrl && (
                <img
                  src={metadata.imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md mt-2"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.isFeatured}
                  onChange={(e) => updateMetadata('isFeatured', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Nổi bật</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.isPinned}
                  onChange={(e) => updateMetadata('isPinned', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Ghim</span>
              </label>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <NewsEditor />
        </div>
      </div>
    </div>
  )
}
